import type { Block } from "@/lib/content";

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if ("h" in b) return <h2 key={i}>{b.h}</h2>;
        if ("p" in b) return <p key={i}>{b.p}</p>;
        if ("code" in b)
          return (
            <pre key={i}>
              <code>{b.code}</code>
            </pre>
          );
        return (
          <ul key={i}>
            {b.list.map((li) => (
              <li key={li}>{li}</li>
            ))}
          </ul>
        );
      })}
    </>
  );
}
