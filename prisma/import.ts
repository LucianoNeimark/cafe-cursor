import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  importEligibleUsersFromCsv,
  parseCsv,
} from "../lib/user-import";

const prisma = new PrismaClient();
const usersPath = join(process.cwd(), "prisma/users.csv");
const creditsPath = join(process.cwd(), "prisma/credits.csv");

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

  const result = await importEligibleUsersFromCsv(
    prisma,
    readFileSync(usersPath, "utf8"),
    { stopOnError: true }
  );

  return result.added + result.updated;
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
