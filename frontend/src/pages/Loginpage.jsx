import { faCirclePlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from "react-router-dom";
import Toaster from "../components/Toaster";
import { useState } from "react";
import showToaster from "../utils/showToaster";
import errorHandler from "../utils/errorHandler";
import { Provider, useDispatch, useSelector } from "react-redux";
import { updateUserData } from "../utils/slices/userSlice";
import store from "../app/store.js";

function LoginComponent() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [toaster, setToaster] = useState({
    showToaster: false,
    toasterMessage: "",
    toasterTailwindTextColorClass: "",
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((store) => store.userSlice.user);

  if (user.isLoggedIn) {
    showToaster("Already logged in !", "text-white", setToaster);
    navigate("/");
  }

  function handleDataChange(e) {
    const { name, value } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  function handleLogin(e) {
    e.preventDefault();

    const error = validateFormData(formData);
    if (error) return;

    loginUser(formData);
  }

  async function loginUser(data) {
    setLoginLoading(true);

    const res = await fetch(
      `https://video-sharing-app-2n9p.onrender.com/api/v1/users/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      }
    );

    const userData = await res.json();
    setLoginLoading(false);

    if (userData?.status === "success") {
      localStorage.setItem("accessToken", userData.data.accessToken);
      localStorage.setItem("userId", userData.data.userData.userId);
      if (userData.data.userData.channel?.channelId) {
        localStorage.setItem(
          "channelId",
          userData.data.userData.channel.channelId
        );
      }

      dispatch(
        updateUserData({
          ...userData.data.userData,
          channelCreated: userData.data.userData.channel?.channelId
            ? true
            : false,
          isLoggedIn: true,
        })
      );

      showToaster(
        "Login Successful. Redirecting to Homepage !",
        "text-green-600",
        setToaster
      );

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } else {
      errorHandler(userData.errorCode, setToaster);
    }
  }

  function validateFormData(data) {
    if (!data.email || !data.password) {
      errorHandler("FIELDS_MISSING", setToaster);
      return true;
    }

    if (!/\S+@\S+\.\S+/.test(data.email)) {
      errorHandler("INVALID_EMAIL", setToaster);
      return true;
    }

    return false;
  }

  return (
    <>
      <header className="z-10 h-[67px] px-6 bg-slate-800 fixed top-0 left-0 w-full py-1 flex justify-between items-center">
        {/* Logo */}
        <Link to={"/"} className="flex gap-x-2 items-center">
          <FontAwesomeIcon
            className="text-[2rem] text-red-500"
            icon={faCirclePlay}
          />
          <p className="text-[2rem] font-bold text-white">Vidionix</p>
        </Link>
      </header>
      <section className="bg-slate-800 min-h-screen flex flex-col justify-center items-center">
        <header>
          <h1 className="text-white text-4xl font-semibold">Login</h1>
        </header>
        <form
          onSubmit={handleLogin}
          className="mt-5 flex flex-col items-center gap-y-2">
          {/* email field */}
          <fieldset className="flex flex-col min-[400px]:w-[350px]">
            <label className="text-white text-[20px] font-semibold">
              Email
            </label>
            <input
              type="text"
              name="email"
              onChange={handleDataChange}
              className="text-[17px] px-2 py-1 outline-none mt-1"
              autoComplete="off"
            />
          </fieldset>
          {/* password field */}
          <fieldset className="flex flex-col min-[400px]:w-[350px]">
            <label className="text-white text-[20px] font-semibold">
              Password
            </label>
            <input
              type="password"
              name="password"
              onChange={handleDataChange}
              className="text-[17px] px-2 py-1 outline-none mt-1"
              autoComplete="off"
            />
          </fieldset>
          <button
            type="submit"
            name="login"
            className="mt-5 flex items-center
            font-semibold text-[1.1rem] text-white cursor-pointer bg-slate-600
            rounded-sm py-[7px] px-8">
            Login
            {loginLoading && (
              <span className="ml-3 animate-spin inline-block w-6 h-6 border-4 border-white border-t-slate-600 rounded-full"></span>
            )}
          </button>
        </form>
        <Link
          to={"/register"}
          className="text-white underline underline-offset-2 mt-6 font-semibold">
          Not Registered
        </Link>
        {toaster.showToaster && (
          <Toaster
            text={toaster.toasterMessage}
            tailwindTextColorClass={toaster.toasterTailwindTextColorClass}
          />
        )}
      </section>
    </>
  );
}

function LoginPage() {
  return (
    <Provider store={store}>
      <LoginComponent />
    </Provider>
  );
}

export default LoginPage;
