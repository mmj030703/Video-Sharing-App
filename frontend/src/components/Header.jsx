import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faCaretDown,
  faCirclePlay,
  faCirclePlus,
  faCloudArrowUp,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar } from "../utils/slices/sidebarSlice";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Toaster from "./Toaster";
import errorHandler from "../utils/errorHandler";
import { updateUserData } from "../utils/slices/userSlice";
import CreateChannelForm from "./CreateChannelForm";
import UploadVideoForm from "./UploadVideoForm";
import showToaster from "../utils/showToaster";

function Header() {
  const [searchInput, setSearchInput] = useState("");
  const [openAccountNavList, setOpenAccountNavList] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.userSlice.user);
  const [toaster, setToaster] = useState({
    showToaster: false,
    toasterMessage: "",
    toasterTailwindTextColorClass: "",
  });
  const [showChannelCreateForm, setShowChannelCreateForm] = useState(false);
  const [showVideoUploadForm, setShowVideoUploadForm] = useState(false);

  function handleSidebar() {
    dispatch(toggleSidebar());
  }

  function handleSearch() {
    if (searchInput === "") return;

    navigate(`/search?q=${searchInput}`);
  }

  async function handleLogout() {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("accessToken");

    if (!token) {
      showToaster(
        "Please login to perform this operation !",
        "text-white",
        setToaster
      );
      return;
    }

    const res = await fetch(
      `https://video-sharing-app-2n9p.onrender.com/api/v1/users/logout/${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const resJson = await res.json();

    if (resJson?.status === "success") {
      dispatch(
        updateUserData({
          userId: "",
          email: "",
          username: "",
          avatar: "",
          isLoggedIn: false,
          createdChannel: false,
          channel: {
            channelId: "",
          },
        })
      );

      localStorage.removeItem("accessToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("channelId");
    } else if (resJson.errorCode === "INVALID_TOKEN") {
      logout();
      navigate("/login");
    } else if (resJson.errorCode === "TOKEN_EXPIRED") {
      const res = await fetch(
        `https://video-sharing-app-2n9p.onrender.com/api/v1/users/refresh-token/${userId}`
      );
      const resJson = await res.json();

      if (resJson?.status === "success") {
        localStorage.setItem("accessToken", resJson.data.accessToken);
        await handleLogout();
        return;
      } else if (
        [
          "REFRESH_TOKEN_ERROR",
          "INVALID_TOKEN",
          "TOKEN_EXPIRED",
          "INVALID_REFRESH_TOKEN",
        ].includes(resJson.errorCode)
      ) {
        logout();
        navigate("/login");
      }
    } else {
      errorHandler(resJson.errorCode, setToaster);
    }
  }

  function logout() {
    dispatch(
      updateUserData({
        userId: "",
        email: "",
        username: "",
        avatar: "",
        isLoggedIn: false,
        createdChannel: false,
        channel: {
          channelId: "",
        },
      })
    );

    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("channelId");
  }

  return (
    <>
      <header className="z-10 px-2 min-[450px]:px-6 bg-slate-800 fixed top-0 left-0 w-full py-1 flex flex-wrap justify-between items-center">
        {/* Logo */}
        <article className="flex gap-x-6 items-center mr-1">
          <FontAwesomeIcon
            onClick={handleSidebar}
            icon={faBars}
            className="min-[300px]:text-[1.2rem] min-[450px]:text-[1.5rem] cursor-pointer text-white"
          />
          <Link to={"/"} className="flex gap-x-2 items-center">
            <FontAwesomeIcon
              className="text-[1.4rem] min-[300px]:text-[1.7rem] min-[450px]:text-[2rem] text-red-500"
              icon={faCirclePlay}
            />
            <p className="text-[1.4rem] min-[300px]:text-[1.7rem] min-[450px]:text-[2rem] font-bold text-white">
              Vidionix
            </p>
          </Link>
        </article>
        {/* Search Bar & Icons */}
        <article className="flex max-[350px]:flex-wrap items-center gap-x-5 max-[693px]:order-2 max-[693px]:flex-1 max-[693px]:w-full">
          <article className="relative flex flex-1 max-[693px]:my-2">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              type="text"
              placeholder="Search"
              className="max-[693px]:flex-1 min-[950px]:min-w-[500px] ps-2 pe-8 rounded-sm text-[1.25rem] py-1 outline-none"
            />
            <button>
              <FontAwesomeIcon
                icon={faSearch}
                onClick={handleSearch}
                className="absolute right-[8px] top-[11px] text-[1.15rem]"
              />
            </button>
          </article>
          {user.isLoggedIn && !user.createdChannel && (
            <button
              onClick={() =>
                setShowChannelCreateForm((prevState) => !prevState)
              }
              className="max-[350px]:flex-1 font-semibold text-[1.1rem] text-white py-[5px] px-4 cursor-pointer bg-slate-600 rounded-sm">
              <FontAwesomeIcon icon={faCirclePlus} />
            </button>
          )}
          {user.isLoggedIn && user.createdChannel && (
            <button
              onClick={() => setShowVideoUploadForm((prevState) => !prevState)}
              title="Upload Video"
              className="max-[350px]:flex-1 font-semibold text-[1.1rem] text-white py-[5px] px-4 cursor-pointer bg-slate-600 rounded-sm">
              <FontAwesomeIcon icon={faCloudArrowUp} />
            </button>
          )}
        </article>
        {/* Account related avatar */}
        {user?.isLoggedIn ? (
          <article className="relative">
            <article
              onClick={() => setOpenAccountNavList((prevState) => !prevState)}
              className="flex items-center gap-x-3 hover:bg-slate-600 hover:rounded-sm hover:transition-all py-1 px-2 cursor-pointer">
              <img
                src={`${user.avatar}`}
                className="w-10 min-[450[px]:w-12 rounded-full"
              />
              <FontAwesomeIcon
                icon={faCaretDown}
                className="text-[1.3rem] min-[450px]:text-[1.6rem] mt-1 text-white"
              />
            </article>
            <ul
              className={`absolute ${
                !openAccountNavList ? "hidden" : ""
              } bg-slate-600 top-16 rounded-md`}>
              <li className="hover:bg-slate-500 px-3 min-[450px]:py-3 font-semibold text-white text-[1.2rem]">
                {user.username}
              </li>
              <li>
                <button
                  onClick={() => handleLogout()}
                  className="hover:bg-slate-500 font-semibold px-3 py-3 text-red-400 text-[1.2rem]">
                  Logout
                </button>
              </li>
            </ul>
          </article>
        ) : (
          <button className="font-semibold text-[1.1rem] text-white cursor-pointer bg-slate-600 rounded-sm">
            <Link to={"/login"} className="block py-[5px] px-4">
              Sign in
            </Link>
          </button>
        )}
        {toaster.showToaster && (
          <Toaster
            text={toaster.toasterMessage}
            tailwindTextColorClass={toaster.toasterTailwindTextColorClass}
          />
        )}
      </header>
      {showChannelCreateForm && (
        <CreateChannelForm
          setToaster={setToaster}
          setShowForm={setShowChannelCreateForm}
        />
      )}
      {showVideoUploadForm && (
        <UploadVideoForm
          setToaster={setToaster}
          setShowForm={setShowVideoUploadForm}
        />
      )}
    </>
  );
}

export default Header;
