import { createSlice } from "@reduxjs/toolkit";

const sidebarSlice = createSlice({
    name: "sidebar",
    initialState: {
        sidebarOpened: true
    },
    reducers: {
        toggleSidebar: (state) => {
            state.sidebarOpened = !state.sidebarOpened;
        }
    }
});

export const { toggleSidebar } = sidebarSlice.actions;
export default sidebarSlice.reducer;