import { Outlet, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import store from "./app/store.js";
import { Provider, useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { addCategories } from "./utils/slices/appSlice.js";
import { updateUserData } from "./utils/slices/userSlice.js";

function AppBody() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const categories = useSelector((store) => store.appSlice.categories);
  const [token, setToken] = useState(localStorage.getItem("accessToken"));

  useEffect(() => {
    async function fetchUserData() {
      const res = await fetch(`/api/v1/users/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const user = await res.json();

      if (user?.status === "success") {
        dispatch(
          updateUserData({
            ...user.data,
            isLoggedIn: true,
          })
        );
      } else if (user.errorCode === "INVALID_TOKEN") {
        navigate("/login");
      } else if (user.errorCode === "TOKEN_EXPIRED") {
        const res = await fetch(`/api/v1/users/refresh-token/${userId}`);
        const resJson = await res.json();

        if (resJson?.status === "success") {
          setToken(resJson.data.accessToken);
        } else if (
          [
            "REFRESH_TOKEN_ERROR",
            "INVALID_TOKEN",
            "TOKEN_EXPIRED",
            "INVALID_REFRESH_TOKEN",
          ].includes(resJson.errorCode)
        ) {
          navigate("/login");
        }
      }
    }

    // fetch user data
    const userId = localStorage.getItem("userId");

    if (userId) {
      fetchUserData();
    }
  }, [token]);

  useEffect(() => {
    // Fetch categories
    if (categories.length === 0) {
      fetchData("/api/v1/categories/videos/all?associatedWith=video");
    }
  }, []);

  async function fetchData(url) {
    const res = await fetch(url);
    const categories = await res.json();

    dispatch(addCategories(categories.data));
  }

  return (
    <section className="bg-slate-800 min-h-screen">
      <section className="relative max-w-[1320px] mx-auto px-4">
        <Header />
        <section className="flex gap-x-5 w-full mt-14 pb-5 relative">
          <Sidebar />
          <Outlet />
        </section>
      </section>
    </section>
  );
}

function App() {
  return (
    <>
      <Provider store={store}>
        <AppBody />
      </Provider>
    </>
  );
}

export default App;
