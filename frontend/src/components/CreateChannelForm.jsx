/* eslint-disable react/prop-types */
import { useState } from "react";
import showToaster from "../utils/showToaster";
import { useNavigate } from "react-router-dom";
import errorHandler from "../utils/errorHandler";
import { useDispatch } from "react-redux";
import { updateUserData } from "../utils/slices/userSlice";

function CreateChannelForm({ setToaster, setShowForm }) {
  const [formData, setFormData] = useState({
    handle: "",
    channelName: "",
    description: "",
    coverImage: null,
    avatar: null,
  });
  const [channelLoaderLoading, setChannelLoaderLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleDataChange(e) {
    const { name, value, files } = e.target;
    let newState = {};

    if (name !== "coverImage" && name !== "avatar") {
      newState = {
        [name]: value,
      };
    } else {
      newState = {
        [name]: files[0],
      };
    }

    setFormData((prevState) => ({ ...prevState, ...newState }));
  }

  function handleChannelCreate(e) {
    e.preventDefault();

    const error = validateFormData(formData);
    if (error) return;

    const data = new FormData();

    Object.entries(formData).forEach(([name, value]) => {
      data.append(name, value);
    });

    createChannelFetch(data);
  }

  async function createChannelFetch(data) {
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

    data.append("userId", userId);

    setChannelLoaderLoading(true);

    const res = await fetch("/api/v1/channels/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: data,
    });

    const channel = await res.json();

    if (channel.status === "success") {
      localStorage.setItem("channelId", channel.data._id);

      dispatch(
        updateUserData({
          createdChannel: true,
          channel: {
            channelId: channel.data._id,
          },
        })
      );

      setChannelLoaderLoading(false);
      setShowForm(false);
      showToaster(
        "Channel created successfully !",
        "text-green-500",
        setToaster
      );
    } else if (channel.errorCode === "INVALID_TOKEN") {
      showToaster("Please login again !", "text-white", setToaster);
      logout();
      navigate("/login");
    } else if (channel.errorCode === "TOKEN_EXPIRED") {
      const res = await fetch(`/api/v1/users/refresh-token/${userId}`);
      const resJson = await res.json();

      if (resJson?.status === "success") {
        localStorage.setItem("accessToken", resJson.data.accessToken);
        handleChannelCreate();
        return;
      } else if (
        [
          "REFRESH_TOKEN_ERROR",
          "INVALID_TOKEN",
          "TOKEN_EXPIRED",
          "INVALID_REFRESH_TOKEN",
        ].includes(resJson.errorCode)
      ) {
        showToaster("Please login again !", "text-white", setToaster);
        logout();
        navigate("/login");
      }
    } else {
      setChannelLoaderLoading(false);
      errorHandler(channel.errorCode, setToaster);
    }
  }

  function validateFormData(data) {
    if (
      !data.handle ||
      !data.channelName ||
      !data.description ||
      !data.avatar ||
      !data.coverImage
    ) {
      errorHandler("FIELDS_MISSING", setToaster);
      return true;
    }

    if (data.avatar.type.split("/")[0] !== "image") {
      errorHandler("AVATAR_NOT_IMAGE", setToaster);
      return true;
    }

    if (data.coverImage.type.split("/")[0] !== "image") {
      errorHandler("COVER_IMAGE_NOT_IMAGE", setToaster);
      return true;
    }

    if (data.avatar.size > 2 * 1024 * 1024) {
      errorHandler("AVATAR_FILE_EXCEEDED", setToaster);
      return true;
    }

    if (data.coverImage.size > 2 * 1024 * 1024) {
      errorHandler("COVER_IMAGE_FILE_EXCEEDED", setToaster);
      return true;
    }

    return false;
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
    <section className="cursor-not-allowed fixed z-50 top-0 px-4 left-0 min-h-screen w-screen flex flex-col justify-center items-center">
      <section className="cursor-pointer max-[599px]:w-full bg-slate-700 p-5 rounded-md shadow-2xl">
        <header>
          <h1 className="text-white text-3xl font-semibold">Create Channel</h1>
        </header>
        <form
          onSubmit={handleChannelCreate}
          className="mt-7 flex flex-col gap-y-2 min-[800px]:w-[600px]">
          {/* message field */}
          <fieldset className="flex flex-col">
            <label className="text-white text-[17px] font-semibold">
              Handle
            </label>
            <input
              value={formData.handle}
              onChange={(e) => handleDataChange(e)}
              type="text"
              name="handle"
              className="text-black text-[17px] rounded-sm px-2 py-[3px] outline-none mt-1"
              autoComplete="off"
            />
          </fieldset>
          <fieldset className="flex flex-col">
            <label className="text-white text-[17px] font-semibold">
              Channel Name
            </label>
            <input
              value={formData.channelName}
              onChange={(e) => handleDataChange(e)}
              type="text"
              name="channelName"
              className="text-black text-[17px] rounded-sm px-2 py-[3px] outline-none mt-1"
              autoComplete="off"
            />
          </fieldset>
          <fieldset className="flex flex-col">
            <label className="text-white text-[17px] font-semibold">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleDataChange(e)}
              name="description"
              rows={4}
              className="resize-none text-black text-[17px] rounded-sm px-2 py-[3px] outline-none mt-1"
              autoComplete="off"
            />
          </fieldset>

          <fieldset className="flex flex-col w-[350px]">
            <label className="text-white text-[17px] font-semibold">
              Cover Image
            </label>
            <input
              onChange={(e) => handleDataChange(e)}
              type="file"
              accept="image/*"
              name="coverImage"
              className="text-[16px] py-1 text-white outline-none mt-1"
            />
          </fieldset>

          <fieldset className="flex flex-col w-[350px]">
            <label className="text-white text-[17px] font-semibold">
              Avatar
            </label>
            <input
              onChange={(e) => handleDataChange(e)}
              type="file"
              accept="image/*"
              name="avatar"
              className="text-[16px] py-1 text-white outline-none mt-1"
            />
          </fieldset>

          <article className="flex justify-start gap-x-4">
            <button
              type="submit"
              name="Create"
              className="mt-5 flex items-center
                font-semibold text-[1.1rem] text-white cursor-pointer bg-slate-600
                rounded-sm py-[7px] px-8">
              Create
              {channelLoaderLoading && (
                <span className="ml-3 animate-spin inline-block w-6 h-6 border-4 border-white border-t-slate-600 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
              }}
              type="button"
              name="cancel"
              className="mt-5 flex items-center
                font-semibold text-[1.1rem] text-white cursor-pointer bg-slate-600
                rounded-sm py-[7px] px-8">
              Cancel
            </button>
          </article>
        </form>
      </section>
    </section>
  );
}

export default CreateChannelForm;
