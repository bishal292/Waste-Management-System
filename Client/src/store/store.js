import { create } from "zustand";
import { createAuthSlice } from "./slices/auth-slice.js";


const sidebar = (set) => (
    {
        sidebarOpen: false,
        setSidebarOpen: (value) => set(() => ({ value })),
    }
)
export const useAppStore = create()((...a)=>({
    ...createAuthSlice(...a),
    ...sidebar(...a)
}))