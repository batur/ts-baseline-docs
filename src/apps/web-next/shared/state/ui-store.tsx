"use client";

import { createContext, useContext, useRef } from "react";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

import type { ReactNode } from "react";
import type { StoreApi } from "zustand/vanilla";

interface UiStoreState {
  readonly density: "comfortable" | "compact";
  readonly setDensity: (density: UiStoreState["density"]) => void;
}

function createUiStore(): StoreApi<UiStoreState> {
  return createStore<UiStoreState>((set) => ({
    density: "comfortable",
    setDensity: (density) => {
      set({ density });
    },
  }));
}

const UiStoreContext = createContext<StoreApi<UiStoreState> | null>(null);

export function UiStoreProvider({ children }: { readonly children: ReactNode }) {
  const storeRef = useRef<StoreApi<UiStoreState> | null>(null);

  storeRef.current ??= createUiStore();

  return <UiStoreContext.Provider value={storeRef.current}>{children}</UiStoreContext.Provider>;
}

export function useUiStore<T>(selector: (state: UiStoreState) => T): T {
  const store = useContext(UiStoreContext);
  if (store === null) throw new Error("useUiStore must be used inside UiStoreProvider.");

  return useStore(store, selector);
}
