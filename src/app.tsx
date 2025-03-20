import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense, onMount } from "solid-js";
import Nav from "~/components/Nav";
import "./app.css";
import { clientOnly } from "@solidjs/start";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";

const ClientOnlyClerk = clientOnly(() => import("./context/AuthProvider"));

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ClientOnlyClerk value={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
        <Router
          root={props => (
            <>
              <Nav />
              <Suspense>{props.children}</Suspense>
            </>
          )}
        >
          <FileRoutes />
        </Router>
      </ClientOnlyClerk>
    </QueryClientProvider>

  );
}
