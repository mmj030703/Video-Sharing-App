import { createSlice } from "@reduxjs/toolkit";

const sidebarSlice = createSlice({
    name: "sidebar",
    initialState: {
        sidebarOpened: true
    },
    reducers: {
        toggleSidebar: (state) => {
            state.sidebarOpened = !state.sidebarOpened;
        },
        closeSidebar: (state) => {
            state.sidebarOpened = false;
        }
    }
});

export const { toggleSidebar, closeSidebar } = sidebarSlice.actions;
export default sidebarSlice.reducer;