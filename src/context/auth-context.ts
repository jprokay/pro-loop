"use client";
import { Clerk } from "@clerk/clerk-js";
import { Resource, createContext, useContext } from "solid-js";

export const ClerkContext = createContext<Resource<Clerk>>();

export function useAuthContext() {
  const ctx = useContext(ClerkContext);

  if (!ctx) {
    throw new Error("useAuthContext: cannot find a ClerkContext");
  }
  return ctx;
}
