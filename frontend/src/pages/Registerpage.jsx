import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Toaster from "../components/Toaster.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlay } from "@fortawesome/free-solid-svg-icons";
import errorHandler from "../utils/errorHandler.js";
import showToaster from "../utils/showToaster.js";

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    avatar: null,
  });
  const [toaster, setToaster] = useState({
    showToaster: false,
    toasterMessage: "",
    toasterTailwindTextColorClass: "",
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const navigate = useNavigate();

  function handleDataChange(e) {
    const { name, value, files } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: name !== "avatar" ? value : files[0],
    }));
  }

  function handleRegister(e) {
    e.preventDefault();

    const error = validateFormData(formData);
    if (error) return;

    const data = new FormData();
    Object.entries(formData).forEach((field) => {
      if (field[0] === "avatar" && !field[1]) {
        return;
      }
      data.append(field[0], field[1]);
    });

    registerUser(data);
  }

  async function registerUser(data) {
    setRegisterLoading(true);

    const res = await fetch("/api/v1/users/register", {
      method: "POST",
      body: data,
    });

    const userData = await res.json();
    setRegisterLoading(false);

    if (userData?.status === "success") {
      showToaster(
        "Registration Successful. Redirecting to Login page !",
        "text-green-600",
        setToaster
      );

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } else {
      errorHandler(userData.errorCode, setToaster);
    }

    console.log(userData);
  }

  function validateFormData(data) {
    if (!data.username || !data.email || !data.password || !data.avatar) {
      errorHandler("FIELDS_MISSING", setToaster);
      return true;
    }

    if (!/\S+@\S+\.\S+/.test(data.email)) {
      errorHandler("INVALID_EMAIL", setToaster);
      return true;
    }

    if (data.avatar.type.split("/")[0] !== "image") {
      errorHandler("AVATAR_NOT_IMAGE", setToaster);
      return true;
    }

    if (data.avatar.size > 2 * 1024 * 1024) {
      errorHandler("AVATAR_FILE_EXCEEDED", setToaster);
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

      <section className="relative bg-slate-800 min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-white text-4xl font-semibold">Register</h1>
        <form
          onSubmit={handleRegister}
          encType="multipart/form-data"
          className="mt-5 flex flex-col items-center gap-y-2">
          {/* username field */}
          <fieldset className="flex flex-col w-[350px]">
            <label className="text-white text-[20px] font-semibold">
              Username
            </label>
            <input
              type="text"
              name="username"
              className="text-[17px] px-2 py-1 outline-none mt-1"
              autoComplete="off"
              onChange={handleDataChange}
            />
          </fieldset>

          {/* email field */}
          <fieldset className="flex flex-col w-[350px]">
            <label className="text-white text-[20px] font-semibold">
              Email
            </label>
            <input
              type="text"
              name="email"
              className="text-[17px] px-2 py-1 outline-none mt-1"
              autoComplete="off"
              onChange={handleDataChange}
            />
          </fieldset>

          {/* password field */}
          <fieldset className="flex flex-col w-[350px]">
            <label className="text-white text-[20px] font-semibold">
              Password
            </label>
            <input
              type="password"
              name="password"
              className="text-[17px] px-2 py-1 outline-none mt-1"
              autoComplete="off"
              onChange={handleDataChange}
            />
          </fieldset>

          {/* avatar field */}
          <fieldset className="flex flex-col w-[350px]">
            <label className="text-white text-[20px] font-semibold">
              Avatar
            </label>
            <input
              type="file"
              accept="image/*"
              name="avatar"
              className="text-[16px] py-1 text-white outline-none mt-1"
              onChange={handleDataChange}
            />
          </fieldset>

          <button
            type="submit"
            name="register"
            className="mt-5 flex items-center
          font-semibold text-[1.1rem] text-white cursor-pointer bg-slate-600
          rounded-sm py-[7px] px-8">
            Register
            {registerLoading && (
              <span className="ml-3 animate-spin inline-block w-6 h-6 border-4 border-white border-t-slate-600 rounded-full"></span>
            )}
          </button>
        </form>
        <Link
          to={"/login"}
          className="text-white underline underline-offset-2 mt-6 font-semibold">
          Already Registered !
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

export default RegisterPage;
