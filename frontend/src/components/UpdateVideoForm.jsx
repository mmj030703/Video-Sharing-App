/* eslint-disable react/prop-types */
import { useState } from "react";
import showToaster from "../utils/showToaster";
import errorHandler from "../utils/errorHandler";
import { useNavigate } from "react-router-dom";
import { updateUserData } from "../utils/slices/userSlice";
import { useDispatch } from "react-redux";

function UpdateVideoForm({
  setToaster,
  setShowUpdateVideoForm,
  video,
  setChannelUpdated,
  setOpenVideoEditListId,
}) {
  const [formData, setFormData] = useState({
    title: video?.title,
    description: video?.description,
    thumbnail: null,
  });
  const [videoLoaderLoading, setVideoLoaderLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleDataChange(e) {
    const { name, value, files } = e.target;

    let newState = {};

    if (name !== "thumbnail") {
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

  function handleVideoUpdate(e) {
    e?.preventDefault();

    const error = validateFormData(formData);
    if (error) return;

    const data = new FormData();

    for (const [name, value] of Object.entries(formData)) {
      if (name === "thumbnail" && !value) continue;
      data.append(name, value);
    }

    updateVideo(data);
  }

  async function updateVideo(data) {
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

    setVideoLoaderLoading(true);

    const res = await fetch(
      `https://video-sharing-app-2n9p.onrender.com/api/v1/channels/videos/update/${video?._id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      }
    );

    const updatedVideo = await res.json();

    setVideoLoaderLoading(false);

    if (updatedVideo?.status === "success") {
      setOpenVideoEditListId(false);
      setShowUpdateVideoForm((prevState) => ({ ...prevState, video: false }));
      showToaster(
        "Video information updated successfully !",
        "text-green-500",
        setToaster
      );
      setChannelUpdated(Math.random());
    } else if (updatedVideo.errorCode === "INVALID_TOKEN") {
      showToaster("Please login again !", "text-white", setToaster);
      logout();
      navigate("/login");
    } else if (updatedVideo.errorCode === "TOKEN_EXPIRED") {
      const res = await fetch(
        `https://video-sharing-app-2n9p.onrender.com/api/v1/users/refresh-token/${userId}`
      );
      const resJson = await res.json();

      if (resJson?.status === "success") {
        localStorage.setItem("accessToken", resJson.data.accessToken);
        handleVideoUpdate();
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
      errorHandler(updatedVideo.errorCode, setToaster);
    }
  }

  function validateFormData(data) {
    if (!data.title && !data.description && !data.thumbnail) {
      errorHandler("NO_FIELDS_UPDATED", setToaster);
      return true;
    }

    if (data.title.trim() === "") {
      showToaster("Title cannot be empty !", "text-red-400", setToaster);
      return true;
    }

    if (data.description.trim() === "") {
      showToaster("Description cannot be empty !", "text-red-400", setToaster);
      return true;
    }

    if (data.thumbnail && data.thumbnail.type.split("/")[0] !== "image") {
      errorHandler("NOT_IMAGE_ERROR", setToaster);
      return true;
    }

    if (data.thumbnail && data.thumbnail.size > 2 * 1024 * 1024) {
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
    <section className="cursor-not-allowed fixed z-40 px-4 top-0 left-0 min-h-screen w-screen flex flex-col justify-center items-center">
      <section className="cursor-pointer max-[599px]:w-full bg-slate-700 p-5 rounded-md shadow-2xl">
        <header>
          <h1 className="text-white text-3xl font-semibold">Update Video</h1>
        </header>
        <form
          onSubmit={handleVideoUpdate}
          className="mt-9 flex flex-col gap-y-4">
          {/* title field */}
          <fieldset className="flex flex-col min-[600px]:w-[500px]">
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
          <fieldset className="flex flex-col min-[600px]:w-[500px]">
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
          {/* thumbnail field */}
          <fieldset className="flex flex-col min-[600px]:w-[500px]">
            <label className="text-white text-[20px] font-semibold">
              Thumbnail
            </label>
            <input
              type="file"
              accept="image/*"
              name="thumbnail"
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
              {videoLoaderLoading && (
                <span className="ml-3 animate-spin inline-block w-6 h-6 border-4 border-white border-t-slate-600 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => {
                setOpenVideoEditListId(false);
                setShowUpdateVideoForm((prevState) => ({
                  ...prevState,
                  video: false,
                }));
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

export default UpdateVideoForm;
