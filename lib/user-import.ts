import type { PrismaClient } from "@prisma/client";

export type EligibleUserImport = {
  email: string;
  name: string;
  company: string | null;
  role: string | null;
  approvalStatus: string;
};

export type UserImportError = {
  row: number;
  email?: string;
  message: string;
};

export type UserImportResult = {
  added: number;
  updated: number;
  errors: UserImportError[];
};

const MAX_CSV_CHARS = 1_000_000;

export function parseCsv(content: string): Record<string, string>[] {
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

export function parseEligibleUserRow(
  row: Record<string, string>,
  rowNumber: number
): { ok: true; user: EligibleUserImport } | { ok: false; error: UserImportError } {
  const email = (row.email || "").trim().toLowerCase();
  const name = (row.name || "").trim();

  if (!email || !email.includes("@") || !name) {
    return {
      ok: false,
      error: {
        row: rowNumber,
        email: email || undefined,
        message: "Cada usuario debe tener un correo válido y un nombre",
      },
    };
  }

  return {
    ok: true,
    user: {
      email,
      name,
      company: row.company?.trim() || null,
      role: row.role?.trim() || null,
      approvalStatus: (row.approval_status || row.status || "approved").trim().toLowerCase(),
    },
  };
}

export async function upsertEligibleUser(
  db: PrismaClient,
  user: EligibleUserImport
): Promise<"added" | "updated"> {
  const existing = await db.eligibleUser.findUnique({
    where: { email: user.email },
    select: { id: true },
  });

  await db.eligibleUser.upsert({
    where: { email: user.email },
    create: {
      email: user.email,
      name: user.name,
      company: user.company,
      role: user.role,
      approvalStatus: user.approvalStatus,
    },
    update: {
      name: user.name,
      company: user.company,
      role: user.role,
      approvalStatus: user.approvalStatus,
    },
  });

  return existing ? "updated" : "added";
}

export async function importEligibleUsersFromCsv(
  db: PrismaClient,
  csv: string,
  options: { stopOnError?: boolean } = {}
): Promise<UserImportResult> {
  if (csv.length > MAX_CSV_CHARS) {
    throw new Error("El CSV supera el tamaño máximo de 1 MB");
  }

  const rows = parseCsv(csv);
  const result: UserImportResult = { added: 0, updated: 0, errors: [] };

  for (let index = 0; index < rows.length; index++) {
    const rowNumber = index + 2;
    const parsed = parseEligibleUserRow(rows[index], rowNumber);

    if (!parsed.ok) {
      if (options.stopOnError) {
        throw new Error(`Fila ${parsed.error.row}: ${parsed.error.message}`);
      }
      result.errors.push(parsed.error);
      continue;
    }

    const outcome = await upsertEligibleUser(db, parsed.user);
    if (outcome === "added") {
      result.added++;
    } else {
      result.updated++;
    }
  }

  return result;
}
