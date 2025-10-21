"use client";

import React from "react";

const MouthShape = ({ d }: { d: string }) => (
  <path
    d={d}
    stroke="hsl(var(--foreground))"
    strokeWidth="3"
    fill="hsl(var(--foreground))"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
);

const visemeShapes: Record<string, string> = {
  A: "M 10 30 Q 50 50 90 30", // ah, aa, ay
  B: "M 10 30 L 90 30", // b, m, p (closed lips)
  C: "M 10 25 Q 50 40 90 25", // k, g, ng
  D: "M 15 20 Q 50 35 85 20", // d, t, l, n
  E: "M 10 35 Q 50 20 90 35", // eh, ae, ey
  F: "M 20 20 Q 50 30 80 20", // f, v
  G: "M 15 30 Q 50 45 85 30", // ch, j, sh
  H: "M 25 30 Q 50 25 75 30", // hh
  I: "M 10 40 Q 50 10 90 40", // iy, ih, y
  O: "M 30 30 Q 50 50 70 30 Q 50 10 30 30 Z", // ow, ao
  R: "M 25 20 Q 50 35 75 20", // r
  S: "M 15 25 Q 50 30 85 25", // s, z
  U: "M 35 35 Q 50 45 65 35 Q 50 25 35 35 Z", // uw, uh
  W: "M 30 35 Q 50 45 70 35 Q 50 25 30 35 Z", // w, oo
  X: "M 20 30 L 80 30", // idle, silence (same as B)
};

export function Mouth({
  viseme,
  className,
}: {
  viseme: string;
  className?: string;
}) {
  const pathData = visemeShapes[viseme.toUpperCase()] || visemeShapes["X"];

  return (
    <svg
      viewBox="0 0 100 50"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <MouthShape d={pathData} />
    </svg>
  );
}
