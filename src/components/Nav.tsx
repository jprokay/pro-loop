import { useLocation } from "@solidjs/router";

export default function Nav() {
  const location = useLocation();
  const active = (path: string) =>
    path == location.pathname ? "border-sky-600" : "border-transparent hover:border-sky-600";
  return (
    <nav class="navbar bg-neutral shadow-sm">
      <div class="navbar-start">
      </div>
      <div class="navbar-center">
        <a class="btn btn-ghost text-3xl font-mono" href="/">PRO-L00P</a>
      </div>
      <div class="navbar-end">
      </div>
    </nav>
  );
}
