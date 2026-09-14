import fs from "fs";
import path from "path";

// Prototype-only storage: appends JSON records to a file under /data.
// In production, swap this for PostgreSQL (see Section 8 of the project blueprint —
// contact_leads / newsletter_subscribers tables). The function signatures below
// are written so that swap only touches this one file.

const DATA_DIR = path.join(process.cwd(), "data");

function ensureFile(fileName: string) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const filePath = path.join(DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]", "utf-8");
  return filePath;
}

export function appendRecord<T>(fileName: string, record: T): void {
  const filePath = ensureFile(fileName);
  const existing: T[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  existing.push(record);
  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), "utf-8");
}

export function readRecords<T>(fileName: string): T[] {
  const filePath = ensureFile(fileName);
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
