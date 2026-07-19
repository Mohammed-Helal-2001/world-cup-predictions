"use client";

import { useEffect, useState } from "react";
import { Crown, Sparkles, Trophy } from "lucide-react";
import type { LeaderboardRow, LeagueCelebrationSettings } from "@/lib/types";

type Props = {
  settings: LeagueCelebrationSettings | null;
  leader: LeaderboardRow | null;
};

const CELEBRATION_DURATION_MS = 24000;

const confetti = Array.from({ length: 72 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  delay: `${(index % 18) * 0.22}s`,
  duration: `${6.5 + (index % 5) * 0.45}s`,
  color: ["#C9A227", "#D75A4A", "#0F7A5B", "#FFFFFF", "#7DD3FC", "#F472B6"][index % 6]
}));

const sparks = Array.from({ length: 40 }, (_, index) => ({
  id: index,
  left: `${7 + ((index * 17) % 86)}%`,
  top: `${14 + ((index * 23) % 64)}%`,
  delay: `${(index % 10) * 0.28}s`
}));

const fireworks = Array.from({ length: 34 }, (_, index) => ({
  id: index,
  side: index % 2 === 0 ? "left" : "right",
  delay: `${index * 0.62}s`,
  offset: `${8 + ((index * 11) % 16)}vw`
}));

const celebrationShapes = Array.from({ length: 14 }, (_, index) => ({
  id: index,
  left: `${8 + ((index * 19) % 84)}%`,
  top: `${16 + ((index * 29) % 62)}%`,
  delay: `${(index % 7) * 0.42}s`,
  symbol: ["✦", "✧", "✺", "✹", "◆", "◇", "✶"][index % 7]
}));

export function EndOfLeagueCelebration({ settings, leader }: Props) {
  const enabled = Boolean(settings?.celebration_enabled && leader);
  const [started, setStarted] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setStarted(false);
      setIntroComplete(false);
      return;
    }

    const startTimer = window.setTimeout(() => setStarted(true), 1000);
    const stopTimer = window.setTimeout(() => setIntroComplete(true), CELEBRATION_DURATION_MS);

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(stopTimer);
    };
  }, [enabled, leader?.user_id, settings?.celebration_message]);

  if (!enabled || !leader) return null;

  return (
    <>
      <section className="celebration-banner rounded-lg border border-gold/35 bg-gradient-to-r from-[#2b2110] via-[#7b560f] to-[#f0c85a] p-5 text-white shadow-soft ring-1 ring-white/25">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/15 text-[#ffe990] ring-1 ring-white/25">
              <Crown size={26} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black uppercase tracking-wide text-[#ffe990]">👑 Champion of the League</p>
              <h2 className="mt-1 truncate text-2xl font-black">{leader.display_name}</h2>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-md bg-white/15 px-4 py-3 text-lg font-black ring-1 ring-white/20">
            <Trophy size={20} className="text-[#ffe990]" />
            {leader.total_points} pts
          </div>
        </div>
      </section>

      {started && !introComplete ? (
        <div className="celebration-stage pointer-events-none fixed inset-0 z-40 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,229,138,0.24),rgba(23,32,51,0.52)_42%,rgba(23,32,51,0.12)_72%,transparent)]" />
          <div className="celebration-shimmer absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-white/35 to-transparent" />

          {fireworks.map((firework) => (
            <span
              key={firework.id}
              className={`firework firework-${firework.side}`}
              style={{
                animationDelay: firework.delay,
                [firework.side === "left" ? "left" : "right"]: firework.offset
              }}
            />
          ))}

          {confetti.map((piece) => (
            <span
              key={piece.id}
              className="confetti-piece"
              style={{ left: piece.left, animationDelay: piece.delay, animationDuration: piece.duration, backgroundColor: piece.color }}
            />
          ))}

          {sparks.map((spark) => (
            <span key={spark.id} className="gold-spark" style={{ left: spark.left, top: spark.top, animationDelay: spark.delay }} />
          ))}

          <span className="glow-star left-[12%] top-[26%]">★</span>
          <span className="glow-star left-[84%] top-[28%] delay-300">★</span>
          <span className="glow-star left-[20%] top-[70%] delay-700">★</span>
          <span className="glow-star left-[76%] top-[68%] delay-500">★</span>
          <span className="glow-star left-[46%] top-[18%] delay-1000">★</span>
          <span className="glow-star left-[58%] top-[78%] delay-700">★</span>

          {celebrationShapes.map((shape) => (
            <span
              key={shape.id}
              className="celebration-shape"
              style={{ left: shape.left, top: shape.top, animationDelay: shape.delay }}
            >
              {shape.symbol}
            </span>
          ))}

          <div className="champion-reveal absolute inset-x-4 top-1/2 mx-auto max-w-3xl -translate-y-1/2 text-center text-white">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#fff4b0] to-[#c79720] text-ink shadow-soft ring-4 ring-white/35">
              <Crown size={54} />
            </div>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 text-sm font-black uppercase tracking-wide text-[#ffe990] ring-1 ring-white/25">
              <Sparkles size={16} />
              👑 Champion
            </div>
            <h2 className="mt-4 text-4xl font-black tracking-normal sm:text-6xl">{leader.display_name}</h2>
            <div className="mx-auto mt-5 flex w-fit items-center gap-3 rounded-lg bg-white/15 px-5 py-3 text-2xl font-black ring-1 ring-white/25">
              <Trophy className="text-[#ffe990]" size={28} />
              {leader.total_points} pts
            </div>
            {settings?.celebration_message ? (
              <p className="mx-auto mt-6 max-w-2xl whitespace-pre-wrap rounded-lg bg-white/15 p-4 text-base font-semibold leading-7 text-white shadow-sm ring-1 ring-white/20 sm:text-lg">
                {settings.celebration_message}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
