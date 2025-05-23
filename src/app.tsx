import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense, onMount } from "solid-js";
import Nav from "~/components/Nav";
import "./app.css";
import { clientOnly } from "@solidjs/start";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { MetaProvider } from "@solidjs/meta"

//const ClientOnlyClerk = clientOnly(() => import("./context/AuthProvider"));

//const queryClient = new QueryClient()

export default function App() {
  return (
    <MetaProvider>
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
    </MetaProvider>

  );
}
