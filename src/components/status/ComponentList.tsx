"use client";

import { ComponentGroupCard } from "./ComponentGroupCard";
import { useStatusData } from "./StatusData";

export function ComponentList() {
  const { groups } = useStatusData();
  return (
    <>
      {groups.map((g) => (
        <ComponentGroupCard key={g.id} group={g} />
      ))}
    </>
  );
}
