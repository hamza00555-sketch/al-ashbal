import { cn } from "@/lib/cn";

/*
  Ambient decorative motion layers for Child & Parent areas only.
  - position absolute inside the (clipped) page shell, pointer-events-none,
    aria-hidden, transform/opacity/filter only.
  - Visible on the deep-plum canvas, but never over text/buttons (low layer).
  - All motion is disabled under prefers-reduced-motion (see globals.css).
  Teacher pages never render these.
*/

/** A twinkling star/dot. */
function Star({ className, delay = "" }: { className?: string; delay?: string }) {
  return (
    <span
      aria-hidden
      className={cn("anim-twinkle absolute rounded-full bg-cream shadow-[0_0_8px_2px_rgba(255,253,247,0.55)]", delay, className)}
    />
  );
}

/** Child: lively but soft — drifting glow blobs + twinkling stars + a crescent. */
export function ChildAmbientMotion() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* drifting glow blobs */}
      <span className="anim-float-a absolute -top-16 -start-10 size-72 rounded-full bg-purple/35 blur-3xl" />
      <span className="anim-float-b absolute top-1/4 -end-16 size-80 rounded-full bg-gold/22 blur-3xl" />
      <span className="anim-float-a anim-delay-2 absolute bottom-8 start-1/3 size-64 rounded-full bg-mint/20 blur-3xl" />
      {/* crescent glow */}
      <span className="anim-breathe-soft absolute end-10 top-10 size-16 rounded-full bg-gold/25 blur-md" />
      {/* twinkling stars */}
      <Star className="start-[12%] top-[18%] size-1.5" />
      <Star className="start-[28%] top-[42%] size-1" delay="anim-delay-2" />
      <Star className="end-[18%] top-[30%] size-2" delay="anim-delay-1" />
      <Star className="end-[34%] top-[62%] size-1.5" delay="anim-delay-3" />
      <Star className="start-[20%] top-[74%] size-1" />
      <Star className="end-[12%] top-[80%] size-1.5" delay="anim-delay-2" />
    </div>
  );
}

/** Parent: calmer & slower — soft glow + a couple of gentle shapes, fewer stars. */
export function ParentAmbientMotion() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <span className="anim-float-slow absolute -top-20 -start-12 size-80 rounded-full bg-purple/30 blur-3xl" />
      <span className="anim-float-slow anim-delay-3 absolute bottom-10 -end-16 size-72 rounded-full bg-gold/16 blur-3xl" />
      <span className="anim-breathe-soft absolute end-1/4 top-16 size-14 rounded-full bg-lavender/20 blur-lg" />
      <Star className="start-[16%] top-[24%] size-1.5" />
      <Star className="end-[22%] top-[40%] size-1" delay="anim-delay-2" />
      <Star className="start-[30%] top-[70%] size-1.5" delay="anim-delay-1" />
    </div>
  );
}
