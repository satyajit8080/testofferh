/**
 * Lists every business fact in src/lib/facts.ts that is still unconfirmed (null).
 * Exits 1 while anything is missing, so it can gate a production deploy.
 *
 *   npm run facts
 */
import * as facts from "../src/lib/facts.ts";

const missing: string[] = [];

function walk(value: unknown, path: string) {
  if (value === null) {
    missing.push(path);
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => {
      const key = v && typeof v === "object" ? (v.id ?? v.priority ?? v.item ?? i) : i;
      walk(v, `${path}[${key}]`);
    });
  } else if (typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) walk(v, path ? `${path}.${k}` : k);
  }
}

for (const [name, value] of Object.entries(facts)) walk(value, name);

const notes: string[] = [];
if (facts.testimonials.length < 3) notes.push(`testimonials: ${facts.testimonials.length}/3 named quotes`);
if (facts.legal.draft) notes.push("legal.draft is true — legal pages show a 'Draft' banner");

if (missing.length === 0 && notes.length === 0) {
  console.log("All facts confirmed.");
  process.exit(0);
}

console.log(`${missing.length} unconfirmed fact(s) in src/lib/facts.ts:\n`);
let group = "";
for (const m of missing) {
  const g = m.split(/[.[]/)[0];
  if (g !== group) console.log(`\n${(group = g)}`);
  console.log(`  - ${m}`);
}
if (notes.length) console.log(`\nAlso:\n${notes.map((n) => `  - ${n}`).join("\n")}`);
process.exit(1);
