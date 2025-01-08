import { Outlet, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import store from "./app/store.js";
import { Provider, useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { addCategories } from "./utils/slices/appSlice.js";
import { updateUserData } from "./utils/slices/userSlice.js";
import Toaster from "./components/Toaster.jsx";

function AppBody() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const categories = useSelector((store) => store.appSlice.categories);
  const [token, setToken] = useState(localStorage.getItem("accessToken"));
  const [toaster, setToaster] = useState({
    showToaster: false,
    toasterMessage: "",
    toasterTailwindTextColorClass: "",
  });

  const VITE_BACKEND_API_URI = import.meta.env.VITE_BACKEND_API_URI;

  useEffect(() => {
    setToaster({
      showToaster: true,
      toasterMessage: "Refresh might take some time! Hold Tight.",
      toasterTailwindTextColorClass: "text-white",
    });

    setTimeout(() => {
      setToaster({
        showToaster: false,
        toasterMessage: "",
        toasterTailwindTextColorClass: "",
      });
    }, 4000);
  }, []);

  useEffect(() => {
    async function fetchData(url, fetchWhichData) {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data?.status === "success") {
        if (fetchWhichData === "user") {
          dispatch(
            updateUserData({
              ...data.data,
              isLoggedIn: true,
            })
          );
        } else if (fetchWhichData === "channel") {
          dispatch(
            updateUserData({
              createdChannel: true,
              channel: {
                channelId: data.data._id,
              },
            })
          );
        }
      } else if (data.errorCode === "INVALID_TOKEN") {
        navigate("/login");
      } else if (data.errorCode === "TOKEN_EXPIRED") {
        const res = await fetch(
          `${VITE_BACKEND_API_URI}/api/v1/users/refresh-token/${userId}`
        );
        const resJson = await res.json();

        if (resJson?.status === "success") {
          localStorage.setItem("accessToken", resJson.data.accessToken);
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
    const channelId = localStorage.getItem("channelId");

    if (userId) {
      fetchData(`${VITE_BACKEND_API_URI}/api/v1/users/user/${userId}`, "user");
    }

    if (channelId) {
      fetchData(
        `${VITE_BACKEND_API_URI}/api/v1/channels/channel/${channelId}`,
        "channel"
      );
    }
  }, [token]);

  useEffect(() => {
    // Fetch categories
    if (categories.length === 0) {
      fetchData(
        "${VITE_BACKEND_API_URI}/api/v1/categories/videos/all?associatedWith=video"
      );
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
        {toaster.showToaster && (
          <Toaster
            text={toaster.toasterMessage}
            tailwindTextColorClass={toaster.toasterTailwindTextColorClass}
          />
        )}
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
