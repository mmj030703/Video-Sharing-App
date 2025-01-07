/* eslint-disable react/prop-types */
import { useState } from "react";
import showToaster from "../utils/showToaster";
import errorHandler from "../utils/errorHandler";
import { useNavigate } from "react-router-dom";

function UpdateChannelForm({
  setToaster,
  setShowUpdateChannelForm,
  channel,
  setChannelUpdated,
}) {
  const [formData, setFormData] = useState({
    title: channel.title,
    description: channel.description,
    coverImage: null,
    avatar: null,
  });
  const [channelLoaderLoading, setChannelLoaderLoading] = useState(false);
  const navigate = useNavigate();

  function handleDataChange(e) {
    const { name, value, files } = e.target;

    let newState = {};

    if (name !== "avatar" && name !== "coverImage") {
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

  function handleChannelUpdate(e) {
    e?.preventDefault();

    setChannelLoaderLoading(true);

    const error = validateFormData(formData);
    if (error) return;

    const data = new FormData();

    for (const [name, value] of Object.entries(formData)) {
      if ((name === "coverImage" && !value) || (name === "avatar" && !value))
        continue;
      data.append(name, value);
    }

    updateChannel(data);

    for (const [name, value] of data.entries()) {
      console.log(name, value);
    }
  }

  async function updateChannel(data) {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("accessToken");

    if (!token) {
      showToaster(
        "Login to perform this operation !",
        "text-white",
        setToaster
      );
      return;
    }

    data.append("userId", userId);

    setChannelLoaderLoading(true);

    const res = await fetch(`/api/v1/channels/update/${channel?._id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: data,
    });

    const updatedChannel = await res.json();

    setChannelLoaderLoading(false);

    console.log(updatedChannel);

    if (updatedChannel?.status === "success") {
      setShowUpdateChannelForm((prevState) => ({
        ...prevState,
        channel: false,
      }));
      showToaster(
        "Channel information updated successfully !",
        "text-green-500",
        setToaster
      );
      setChannelUpdated(Math.random());
    } else if (updatedChannel.errorCode === "INVALID_TOKEN") {
      showToaster("Please login again !", "text-white", setToaster);
      logout();
      navigate("/login");
    } else if (updatedChannel.errorCode === "TOKEN_EXPIRED") {
      console.log("failed");

      const res = await fetch(`/api/v1/users/refresh-token/${userId}`);
      const resJson = await res.json();

      if (resJson?.status === "success") {
        localStorage.setItem("accessToken", resJson.data.accessToken);
        handleChannelUpdate();
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
      errorHandler(updatedChannel.errorCode, setToaster);
    }
  }

  function validateFormData(data) {
    if (!data.title && !data.description && !data.coverImage && !data.avatar) {
      errorHandler("NO_FIELDS_UPDATED", setToaster);
      return true;
    }

    if (data.title.trim() === "") {
      console.log("empty");
      showToaster("Title cannot be empty !", "text-red-400", setToaster);
      return true;
    }

    if (data.description.trim() === "") {
      showToaster("Description cannot be empty !", "text-red-400", setToaster);
      return true;
    }

    if (data.coverImage && data.coverImage.type.split("/")[0] !== "image") {
      errorHandler("NOT_IMAGE_ERROR", setToaster);
      return true;
    }

    if (data.avatar && data.avatar.type.split("/")[0] !== "image") {
      errorHandler("NOT_IMAGE_ERROR", setToaster);
      return true;
    }

    if (data.coverImage && data.coverImage.size > 2 * 1024 * 1024) {
      errorHandler("IMAGE_SIZE_EXCEEDED", setToaster);
      return true;
    }

    if (data.avatar && data.avatar.size > 2 * 1024 * 1024) {
      errorHandler("IMAGE_SIZE_EXCEEDED", setToaster);
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
    <section className="cursor-not-allowed fixed z-50 top-0 left-0 px-4 min-h-screen w-screen flex flex-col justify-center items-center">
      <section className="cursor-pointer bg-slate-700 max-[599px]:w-full p-3 min-[600px]:p-5 rounded-md shadow-2xl">
        <header>
          <h1 className="text-white text-3xl font-semibold max-[600px]:text-center">Update Channel</h1>
        </header>
        <form
          onSubmit={handleChannelUpdate}
          className="mt-9 flex flex-col gap-y-4 w-full">
          {/* title field */}
          <fieldset className="flex flex-col w-full min-[600px]:w-[500px]">
            <label className="text-white text-[20px] font-semibold">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              name="title"
              onChange={handleDataChange}
              className="text-black text-[17px] rounded-sm px-2 py-1 outline-none mt-1"
              autoComplete="off"
            />
          </fieldset>
          {/* description field */}
          <fieldset className="flex flex-col w-full min-[600px]:w-[500px]">
            <label className="text-white text-[20px] font-semibold">
              Description
            </label>
            <textarea
              value={formData.description}
              name="description"
              onChange={handleDataChange}
              className="text-black resize-none rounded-sm text-[17px] px-2 py-1 outline-none mt-1"
              rows={4}
              autoComplete="off"
            />
          </fieldset>
          {/* coverImage field */}
          <fieldset className="flex flex-col w-full min-[600px]:w-[500px]">
            <label className="text-white text-[20px] font-semibold">
              Cover Image
            </label>
            <input
              type="file"
              accept="image/*"
              name="coverImage"
              onChange={handleDataChange}
              className="text-white resize-none rounded-sm text-[17px] px-2 py-1 outline-none mt-1"
            />
          </fieldset>
          {/* avatar field */}
          <fieldset className="flex flex-col w-full min-[600px]:w-[500px]">
            <label className="text-white text-[20px] font-semibold">
              Avatar
            </label>
            <input
              type="file"
              accept="image/*"
              name="avatar"
              onChange={handleDataChange}
              className="text-white resize-none rounded-sm text-[17px] px-2 py-1 outline-none mt-1"
            />
          </fieldset>
          <article className="flex justify-start gap-x-4">
            <button
              type="submit"
              name="update"
              className="mt-5 flex items-center
                font-semibold text-[1.1rem] text-white cursor-pointer bg-slate-600
                rounded-sm py-[7px] px-8">
              Update
              {channelLoaderLoading && (
                <span className="ml-3 animate-spin inline-block w-6 h-6 border-4 border-white border-t-slate-600 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() =>
                setShowUpdateChannelForm((prevState) => ({
                  ...prevState,
                  channel: false,
                }))
              }
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

export default UpdateChannelForm;
