import fs from "fs";
import path from "path";

// Master-data store for content the Admin panel edits directly (menu, tables).
// This is different from src/lib/storage.ts, which appends log-style records
// (contact leads, newsletter signups) to /data. These files live under
// src/data because they ARE the site's content, not a runtime log.
//
// PROTOTYPE LIMITATION: the customer-facing pages (src/pages/menu.tsx etc.)
// import menu.json statically at build time, so an edit made here won't show
// up on the customer site until the dev server restarts / the site rebuilds.
// Swapping this file's fs calls for real database calls (Phase 6) removes
// that limitation for free — nothing else has to change.

const DATA_DIR = path.join(process.cwd(), "src", "data");

function filePath(fileName: string) {
  return path.join(DATA_DIR, fileName);
}

export function readAll<T>(fileName: string): T[] {
  const p = filePath(fileName);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

export function writeAll<T>(fileName: string, records: T[]): void {
  fs.writeFileSync(filePath(fileName), JSON.stringify(records, null, 2) + "\n", "utf-8");
}

export function updateById<T extends { id: string }>(
  fileName: string,
  id: string,
  patch: Partial<T>
): T[] {
  const all = readAll<T>(fileName);
  const updated = all.map((item) => (item.id === id ? { ...item, ...patch } : item));
  writeAll(fileName, updated);
  return updated;
}

export function addRecord<T extends { id: string }>(fileName: string, record: T): T[] {
  const all = readAll<T>(fileName);
  all.push(record);
  writeAll(fileName, all);
  return all;
}

export function deleteById<T extends { id: string }>(fileName: string, id: string): T[] {
  const all = readAll<T>(fileName);
  const remaining = all.filter((item) => item.id !== id);
  writeAll(fileName, remaining);
  return remaining;
}
