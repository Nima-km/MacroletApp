import { create } from "zustand";

type DateProps = {
	date: Date;
	setDate: (newDate: Date) => void;
};

export const useDateStore = create<DateProps>((set) => ({
	date: new Date(),
	setDate: (newDate) => set({ date: newDate }),
}));
