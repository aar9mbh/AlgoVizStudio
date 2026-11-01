export function ModuleArt({ kind }: { kind: string }) {
  return (
    <svg viewBox="0 0 240 90" className="module-art" aria-hidden="true">
      {kind === "bars" &&
        [28, 53, 38, 67, 45, 76, 58, 84].map((h, i) => (
          <rect
            key={i}
            x={22 + i * 25}
            y={90 - h}
            width="15"
            height={h}
            rx="3"
            opacity={0.35 + i * 0.08}
          />
        ))}
      {(kind === "tree" || kind === "graph") && (
        <>
          <g fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".45">
            <path d="M120 15 65 45 35 77 M65 45 95 77 M120 15 175 45 145 77 M175 45 205 77" />
            {kind === "graph" && (
              <path d="m65 45 110 0M95 77 50-0 60 0M35 77 85-62" />
            )}
          </g>
          {[
            [120, 15],
            [65, 45],
            [175, 45],
            [35, 77],
            [95, 77],
            [145, 77],
            [205, 77],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="7"
              fill="var(--panel)"
              stroke="currentColor"
              strokeWidth="2"
            />
          ))}
        </>
      )}
      {kind === "string" && (
        <>
          {"A B A B C A".split(" ").map((c, i) => (
            <g key={i}>
              <rect
                x={15 + i * 36}
                y="19"
                width="29"
                height="32"
                rx="5"
                opacity={i < 3 ? ".6" : ".15"}
              />
              <text
                x={30 + i * 36}
                y="40"
                textAnchor="middle"
                fill="#ece8f8"
                fontSize="14"
              >
                {c}
              </text>
            </g>
          ))}
          <path d="M25 65h91m-8-5 8 5-8 5" stroke="currentColor" fill="none" />
        </>
      )}
      {kind === "greedy" &&
        [0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect
              x={30 + i * 42}
              y={50 - i * 9}
              width="31"
              height={22 + i * 9}
              rx="5"
              opacity={0.25 + i * 0.2}
            />
            <path
              d={`M${45 + i * 42} ${41 - i * 9}v-12`}
              stroke="currentColor"
            />
          </g>
        ))}
      {kind === "grid" &&
        Array.from({ length: 24 }, (_, i) => (
          <rect
            key={i}
            x={32 + (i % 6) * 30}
            y={8 + Math.floor(i / 6) * 21}
            width="25"
            height="16"
            rx="3"
            opacity={i % 7 === 0 ? ".85" : ".12"}
          />
        ))}
    </svg>
  );
}
