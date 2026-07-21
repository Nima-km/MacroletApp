import { create } from "zustand";

interface ScrollStore {
	scrollPos: number;
	setScrollPos: (newPos: number) => void;
}

export const useScrollStore = create<ScrollStore>((set) => ({
	scrollPos: 0,
	setScrollPos: (newPos) => set({ scrollPos: newPos }),
}));
