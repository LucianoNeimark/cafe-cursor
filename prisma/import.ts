import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();
const usersPath = join(process.cwd(), "prisma/users.csv");
const creditsPath = join(process.cwd(), "prisma/credits.csv");

function parseCsv(content: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < content.length; index++) {
    const character = content[index];

    if (character === '"') {
      if (quoted && content[index + 1] === '"') {
        field += '"';
        index++;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(field.trim());
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && content[index + 1] === "\n") index++;
      row.push(field.trim());
      field = "";

      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error("El CSV contiene una comilla sin cerrar");

  row.push(field.trim());
  if (row.some((value) => value !== "")) rows.push(row);
  if (rows.length === 0) return [];

  const headers = rows[0].map((header) =>
    header.replace(/^\uFEFF/, "").trim().toLowerCase()
  );

  return rows.slice(1).map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]))
  );
}

function loadCsv(path: string): Record<string, string>[] {
  return parseCsv(readFileSync(path, "utf8"));
}

function getReferralCode(link: string): string {
  let parsed: URL;

  try {
    parsed = new URL(link);
  } catch {
    throw new Error("Se encontró un enlace de crédito inválido");
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Los enlaces de crédito deben usar HTTP o HTTPS");
  }

  const code = parsed.searchParams.get("code")?.trim();
  if (!code) throw new Error("Un enlace de crédito no contiene el parámetro code");

  return code;
}

async function importUsers(): Promise<number> {
  if (!existsSync(usersPath)) return 0;

  const users = loadCsv(usersPath);
  let imported = 0;

  for (const row of users) {
    const email = (row.email || "").trim().toLowerCase();
    const name = (row.name || "").trim();

    if (!email || !email.includes("@") || !name) {
      throw new Error("Cada usuario debe tener un correo válido y un nombre");
    }

    const userData = {
      name,
      company: row.company?.trim() || null,
      role: row.role?.trim() || null,
      approvalStatus: (row.approval_status || row.status || "approved").trim().toLowerCase(),
    };

    await prisma.eligibleUser.upsert({
      where: { email },
      create: { email, ...userData },
      update: userData,
    });
    imported++;
  }

  return imported;
}

async function importCredits(): Promise<number> {
  if (!existsSync(creditsPath)) return 0;

  const credits = loadCsv(creditsPath);
  let imported = 0;

  for (const row of credits) {
    const link = (row.link || row.url || "").trim();
    if (!link) throw new Error("Cada crédito debe incluir un enlace");

    const code = getReferralCode(link);

    await prisma.credit.upsert({
      where: { code },
      create: { code, link, isTest: false },
      update: { link },
    });
    imported++;
  }

  return imported;
}

async function main() {
  const hasUsers = existsSync(usersPath);
  const hasCredits = existsSync(creditsPath);

  if (!hasUsers && !hasCredits) {
    throw new Error("Agrega prisma/users.csv o prisma/credits.csv antes de importar");
  }

  console.log("Importando datos reales sin borrar asignaciones existentes…");
  const usersImported = await importUsers();
  const creditsImported = await importCredits();

  console.log(`Usuarios importados o actualizados: ${usersImported}`);
  console.log(`Créditos importados o actualizados: ${creditsImported}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Error de importación");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
