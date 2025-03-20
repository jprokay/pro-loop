import { A } from "@solidjs/router";
import { Component, Show, createEffect, onMount, useContext } from "solid-js";
import { Portal } from "solid-js/web";
import { useAuthContext } from "~/context/auth-context";
import { GET } from "~/routes/api/loops";

const SignInModal: Component<{ id: string, ref: HTMLDialogElement }> = (props) => {
  const clerk = useAuthContext()

  let signInRef: HTMLDivElement | undefined
  createEffect(() => {
    if (clerk.latest && !clerk.latest.user) {
      clerk.latest.user
      clerk().mountSignIn(signInRef!)
    }
  })

  return (
    <dialog id={props.id} class="modal" ref={props.ref}>
      <form method="dialog">
        <div ref={signInRef} id="sign-in"></div>
        {/* if there is a button in form, it will close the modal */}
        <button class="btn">Close</button>
      </form>
    </dialog>
  )
}
export default function Nav() {


  let userButtonRef: HTMLDivElement | undefined
  let modalRef: HTMLDialogElement | undefined

  const clerk = useAuthContext()

  createEffect(() => {
    if (clerk.latest) {
      clerk().mountUserButton(userButtonRef!)
    }
  })

  return (
    <nav class="navbar bg-neutral shadow-sm">
      <div class="navbar-start">
        <A href="/practice/song">New Loop</A>
      </div>
      <div class="navbar-center">
        <a class="btn btn-ghost text-3xl font-mono" href="/">PRO-L00P</a>
      </div>
      <div class="navbar-end">
        <Show when={clerk.latest && clerk().user} fallback={<button class="btn-primary" onClick={() => modalRef?.showModal()}>Sign In</button>}>
          <div ref={userButtonRef} id="user-button"></div>
        </Show>
      </div>
      <Portal>
        <SignInModal ref={modalRef!} id="foo" />
      </Portal>
    </nav>
  );
}
