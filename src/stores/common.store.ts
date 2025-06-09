import { create } from "zustand";

type State = {
  count: number;
  tokenAccess: string;
  reFreshToken: string;
};

type Actions = {
  increment: (qty: number) => void;
  decrement: (qty: number) => void;
};

export const useCountStore = create<State & Actions>((set) => ({
  count: 100,
  tokenAccess: "",
  reFreshToken: "",
  increment: (qty: number) => set((state) => ({ count: state.count + qty })),
  decrement: (qty: number) => set((state) => ({ count: state.count - qty })),
}));
