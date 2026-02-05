"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

type ConfettiPiece = {
  id: number;
  left: string;
  delay: string;
  color: string;
  rotate: string;
};

const details = [
  { label: "Дата", value: "(скажу позже)" },
  { label: "Время", value: "(скажу позже)" },
  { label: "Адрес", value: "(скажу позже)" },
];

const storageKey = "invite_yes";
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () =>
  typeof window !== "undefined" &&
  window.localStorage.getItem(storageKey) === "true";

const getServerSnapshot = () => false;

const setAcceptedStorage = () => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, "true");
  listeners.forEach((listener) => listener());
};

const pseudoRandom = (seed: number) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};

export default function Home() {
  const accepted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const noRef = useRef<HTMLButtonElement>(null);
  const yesRef = useRef<HTMLButtonElement>(null);

  const positionNoButton = useCallback(() => {
    const container = containerRef.current;
    const button = noRef.current;

    if (!container || !button) return;

    const padding = 8;
    const maxStep = 80;
    const availableX = Math.max(
      0,
      container.clientWidth - button.offsetWidth - padding * 2
    );
    const availableY = Math.max(
      0,
      container.clientHeight - button.offsetHeight - padding * 2
    );

    const containerRect = container.getBoundingClientRect();
    const yesRect = yesRef.current?.getBoundingClientRect();
    const yes = yesRect
      ? {
          x: yesRect.left - containerRect.left,
          y: yesRect.top - containerRect.top,
          w: yesRect.width,
          h: yesRect.height,
        }
      : null;

    const btnW = button.offsetWidth;
    const btnH = button.offsetHeight;

    const clamp = (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), max);

    const baseX =
      Number(button.dataset.x) || padding + Math.round(availableX / 2);
    const baseY =
      Number(button.dataset.y) || padding + Math.round(availableY / 2);

    let x = baseX;
    let y = baseY;
    let tries = 0;

    // Move in short hops so it doesn't fly far, but keep it inside the container.
    while (tries < 18) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 24 + Math.random() * maxStep;
      x = clamp(baseX + Math.cos(angle) * distance, padding, padding + availableX);
      y = clamp(baseY + Math.sin(angle) * distance, padding, padding + availableY);

      const overlaps = yes
        ? x < yes.x + yes.w + 12 &&
          x + btnW + 12 > yes.x &&
          y < yes.y + yes.h + 12 &&
          y + btnH + 12 > yes.y
        : false;

      if (!overlaps) break;
      tries += 1;
    }

    // Fallback: random position if we couldn't find a nearby spot.
    if (tries >= 18) {
      x = padding + Math.random() * availableX;
      y = padding + Math.random() * availableY;
    }

    const rot = Math.random() * 16 - 8;
    button.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`;
    button.dataset.x = `${x}`;
    button.dataset.y = `${y}`;
  }, []);

  // Initial placement + keep within bounds on resize.
  useEffect(() => {
    positionNoButton();
    const handleResize = () => positionNoButton();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [positionNoButton]);

  const handleYes = () => {
    setAcceptedStorage();
  };

  const confettiPieces: ConfettiPiece[] = Array.from({ length: 14 }).map(
    (_, index) => ({
      id: index,
      left: `${6 + index * 6}%`,
      delay: `${pseudoRandom(index + 1) * 0.6}s`,
      color: ["#f59e0b", "#fb7185", "#60a5fa", "#a78bfa", "#34d399"][
        index % 5
      ],
      rotate: `${pseudoRandom(index + 11) * 30 - 15}deg`,
    })
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-slate-100">
      {/* Dark, premium background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,59,59,0.12),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_70%,_rgba(255,59,59,0.18),_transparent_45%)]" />
      <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(255,59,59,0.35),_transparent_70%)] blur-3xl opacity-80 float-slower" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,_rgba(255,59,59,0.25),_transparent_70%)] blur-3xl opacity-70 float-slow" />
      <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-35" />
      <div className="pointer-events-none absolute inset-0 bg-soft-lines opacity-60" />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        <section className="glass-card w-full max-w-xl rounded-3xl border border-white/10 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.55)] sm:p-10">
          <div className="fade-up">
            <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
              Приглашение
            </p>
            <h1 className="font-display mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Я тебя приглашаю 😊
            </h1>
            <p className="mt-3 text-base leading-relaxed text-slate-300 sm:text-lg">
              На дружескую встречу. Без напряга — просто приятно провести время.
            </p>
          </div>

          <div className="fade-up mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur sm:mt-7">
            <div className="space-y-3">
              {details.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between text-sm sm:text-base"
                >
                  <span className="text-slate-400">{item.label}</span>
                  <span className="font-medium text-slate-100">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="fade-up mt-5 text-sm text-slate-400">
            Ты можешь согласиться или отказаться — я пойму 🙂
          </p>

          {accepted ? (
            <div
              className="fade-up relative mt-8 rounded-2xl border border-rose-500/40 bg-white/5 px-6 py-5 text-center shadow-[0_12px_40px_rgba(255,59,59,0.18)]"
              role="status"
              aria-live="polite"
            >
              <p className="text-base font-semibold text-white sm:text-lg">
                Урааа! Спасибо 🥹💛 Напишу тебе детали чуть позже.
              </p>
              <div className="pointer-events-none absolute inset-0">
                {confettiPieces.map((piece) => (
                  <span
                    key={piece.id}
                    className="confetti-piece"
                    style={{
                      left: piece.left,
                      animationDelay: piece.delay,
                      background: piece.color,
                      transform: `rotate(${piece.rotate})`,
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div
              ref={containerRef}
              className="relative mt-8 h-20 w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  ref={yesRef}
                  type="button"
                  onClick={handleYes}
                  className="h-12 min-w-[140px] rounded-full bg-[#ff3b3b] px-6 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_14px_40px_rgba(255,59,59,0.35)] transition hover:-translate-y-0.5 hover:bg-[#ff2a2a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300"
                >
                  YES
                </button>
              </div>
              <button
                ref={noRef}
                type="button"
                onPointerEnter={positionNoButton}
                onPointerDown={positionNoButton}
                onFocus={positionNoButton}
                onClick={(event) => {
                  event.preventDefault();
                  positionNoButton();
                }}
                className="absolute left-0 top-0 h-12 min-w-[120px] rounded-full border border-white/20 bg-white/10 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 shadow-sm transition-transform duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-200"
                aria-label="Отказаться"
              >
                NO
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
