/**
 * Brief branded boot screen shown on every hard page load. Pure CSS —
 * no client JS needed to dismiss it, so it still fades away correctly
 * even if hydration is slow. The root layout mounts this once; it never
 * reappears on client-side navigation between pages.
 */
export function SplashScreen() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 z-splash flex animate-splash-out items-center justify-center bg-slate-950"
    >
      <p
        className="animate-fade-up text-2xl font-bold tracking-tight text-white sm:text-3xl"
        style={{ opacity: 0, animationFillMode: "forwards" }}
      >
        My Ultimate Worship
      </p>
    </div>
  );
}
