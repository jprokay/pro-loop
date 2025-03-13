"use client"
import { ContextProviderComponent, createEffect, createResource, createSignal, onMount } from "solid-js"
import { ClerkContext } from "./auth-context"
import { Clerk } from "@clerk/clerk-js"
import { createStore } from "solid-js/store"

const loadClerk = async (key: string) => {
  const c = new Clerk(key)
  await c.load({})
  return c
}
const ClerkProvider: ContextProviderComponent<string> = (props) => {
  const [clerk] = createResource(() => props.value, loadClerk)

  return (
    <ClerkContext.Provider value={clerk}>
      {props.children}
    </ClerkContext.Provider>
  )
};

export default ClerkProvider;
