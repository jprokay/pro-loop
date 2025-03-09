import { RouteSectionProps } from "@solidjs/router";

export default function PracticeLayout(props: RouteSectionProps) {
  return (
    <main class="mx-auto flex flex-col items-center w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {props.children}
    </main>
  );
}
