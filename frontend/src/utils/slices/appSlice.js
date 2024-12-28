import { createSlice } from "@reduxjs/toolkit";

const appSlice = createSlice({
    name: "app",
    initialState: {
        categories: [],
        homepageVideos: []
    },
    reducers: {
        addCategories: (state, action) => {
            if (state.categories.length === 0) {
                state.categories.push(...action.payload);
            }
        },
        addHomepageVideos: (state, action) => {
            state.homepageVideos = action.payload;
        }
    }
});

export const { addCategories, addHomepageVideos } = appSlice.actions;

export default appSlice.reducer;