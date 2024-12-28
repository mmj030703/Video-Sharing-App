import { configureStore } from "@reduxjs/toolkit";
import sidebarSlice from "../utils/slices/sidebarSlice.js";
import appSlice from "../utils/slices/appSlice.js";
import userSlice from "../utils/slices/userSlice.js";

const store = configureStore({
    reducer: {
        sidebarSlice,
        appSlice,
        userSlice
    }
});

export default store;