import { Component, Show, createEffect, createSignal } from "solid-js"
import { createStore } from "solid-js/store"
import { Portal } from "solid-js/web"

type NotificationBody = {
  type: "success" | "danger"
  content: string
}

type Notification = {
  it: NotificationBody
  show: boolean
}

const NotificationBody: Component<NotificationBody> = (props) => {
  return (
    <div class={props.type == "success" ? "notification is-success" : "notification is-danger"}>
      {props.content}
    </div>
  )
}

export const useNotification = () => {
  const [notification, setNotification] = createStore<NotificationBody>({
    type: "success",
    content: "Logged in"
  })

  const [show, setShow] = createSignal(false);

  createEffect(() => {
    if (show()) {
      setInterval(() => setShow(false), 1_000)
    }
  })

  return {
    notification,
    setNotification,
    show,
    setShow
  }
}

export const Notification: Component<Notification> = (props) => {

  return (
    <Portal>
      <Show when={props.show}>
        <div class="top-right">
          <NotificationBody {...props.it} />
        </div>
      </Show>
    </Portal>

  )
}
