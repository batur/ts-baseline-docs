import { create } from "zustand";

interface UsersUiState {
  readonly density: "comfortable" | "compact";
  readonly setDensity: (density: UsersUiState["density"]) => void;
}

export const useUsersUiStore = create<UsersUiState>((set) => ({
  density: "comfortable",
  setDensity: (density) => {
    set({ density });
  },
}));
