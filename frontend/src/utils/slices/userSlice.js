import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "userSlice",
    initialState: {
        user: {
            userId: "",
            email: "",
            username: "",
            avatar: "",
            isLoggedIn: false,
            createdChannel: false,
            channel: {
                channelId: "",
            }
        }
    },
    reducers: {
        updateUserData: (state, action) => {
            state.user = { ...state.user, ...action.payload };
        }
    }
});

export const { updateUserData } = userSlice.actions;

export default userSlice.reducer;