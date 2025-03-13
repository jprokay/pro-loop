import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense, onMount } from "solid-js";
import Nav from "~/components/Nav";
import "./app.css";
import { clientOnly } from "@solidjs/start";

const ClientOnlyClerk = clientOnly(() => import("./context/AuthProvider"));
export default function App() {
  return (
    <Router
      root={props => (
        <ClientOnlyClerk value={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
          <Nav />
          <Suspense>{props.children}</Suspense>
        </ClientOnlyClerk>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
