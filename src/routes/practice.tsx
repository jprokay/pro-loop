import { RouteSectionProps } from "@solidjs/router";
import SEOHead from "~/components/SEOHead";
import { onMount } from "solid-js/types/server/reactive.js";

export default function PracticeLayout(props: RouteSectionProps) {
  return (
    <>
      <SEOHead 
        title="Practice Loops | Pro-L00ps"
        description="Practice your saved music loops with precise control. Set custom start and end points to master difficult passages."
        canonicalUrl="https://pro-loops.com/practice"
      />
      <main class="mx-auto flex flex-col items-center w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {props.children}
      </main>
    </>
  );
}
