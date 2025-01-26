/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import showToaster from "../utils/showToaster";
import errorHandler from "../utils/errorHandler";
import { useDispatch } from "react-redux";
import { addHomepageVideos } from "../utils/slices/appSlice";

function UploadVideoForm({ setToaster, setShowForm }) {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categories: "",
    thumbnail: null,
    video: null,
  });
  const [videoLoaderLoading, setVideoLoaderLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchCategories() {
      const res = await fetch(
        `https://video-sharing-app-2n9p.onrender.com/api/v1/categories/videos/all?associatedWith=video`
      );
      const resJson = await res.json();

      setCategories(resJson.data);
    }

    fetchCategories();
  }, []);

  function handleDataChange(e) {
    const { name, value, files } = e.target;

    let newState = {};

    if (name !== "video" && name !== "thumbnail") {
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

  function handleVideoUpload(e) {
    e?.preventDefault();

    const error = validateFormData(formData);
    if (error) return;

    const data = new FormData();

    for (const [name, value] of Object.entries(formData)) {
      let transformedValue = value;

      if (name === "categories") {
        const category = categories.find(
          (category) => category.name === value.toLowerCase()
        );

        if (category) {
          transformedValue = JSON.stringify([category._id]);
        }
      }
      data.append(name, transformedValue);
    }

    videoUploadFetch(data);
  }

  async function videoUploadFetch(data) {
    const userId = localStorage.getItem("userId");
    const channelId = localStorage.getItem("channelId");

    data.append("userId", userId);
    data.append("channelId", channelId);

    setVideoLoaderLoading(true);

    showToaster(
      "Uploading your video! This may take 1-2 minutes ! Keep patience",
      "text-white",
      setToaster,
      5000
    );

    const res = await fetch(
      `https://video-sharing-app-2n9p.onrender.com/api/v1/channels/videos/upload`,
      {
        method: "POST",
        body: data,
      }
    );

    if (!res) {
      setVideoLoaderLoading(false);

      showToaster(
        "An error occured while uploading video ! Please try again.",
        "text-red",
        setToaster
      );
    }

    const video = await res.json();

    if (video?.status === "success") {
      setVideoLoaderLoading(false);
      setShowForm(false);
      showToaster(
        "Video uploaded successfully !",
        "text-green-500",
        setToaster
      );

      const res = await fetch(
        `https://video-sharing-app-2n9p.onrender.com/api/v1/videos/category/all`
      );
      const homepageVideos = await res.json();

      dispatch(addHomepageVideos(homepageVideos?.data?.videos));
    } else {
      setVideoLoaderLoading(false);
      errorHandler(video.errorCode, setToaster);
    }
  }

  function validateFormData(data) {
    if (
      !data.title ||
      !data.description ||
      !data.categories ||
      !data.video ||
      !data.thumbnail
    ) {
      errorHandler("FIELDS_MISSING", setToaster);
      return true;
    }

    if (data.categories === "Select Category") {
      errorHandler("CATEGORY_NOT_SELECTED", setToaster);
      return true;
    }

    if (data.thumbnail.type.split("/")[0] !== "image") {
      errorHandler("FIRST_FILE_IMAGE_ONLY", setToaster);
      return true;
    }

    if (data.video.type.split("/")[0] !== "video") {
      errorHandler("SECOND_FILE_VIDEO_ONLY", setToaster);
      return true;
    }

    if (data.thumbnail.size > 2 * 1024 * 1024) {
      errorHandler("IMAGE_SIZE_EXCEEDED", setToaster);
      return true;
    }

    if (data.video.size > 50 * 1024 * 1024) {
      errorHandler("COVER_IMAGE_FILE_EXCEEDED", setToaster);
      return true;
    }

    return false;
  }

  return (
    <section className="cursor-not-allowed fixed z-40 top-0 px-4 left-0 min-h-screen w-screen flex flex-col justify-center items-center">
      <section className="cursor-pointer max-[599px]:w-full bg-slate-700 p-5 rounded-md shadow-2xl">
        <header>
          <h1 className="text-white text-3xl font-semibold">Upload Video</h1>
        </header>
        <form
          onSubmit={handleVideoUpload}
          className="mt-7 flex flex-col gap-y-2 min-[600px]:w-[600px]">
          {/* message field */}
          <fieldset className="flex flex-col max-[599px]:w-full">
            <label className="text-white text-[17px] font-semibold">
              Title
            </label>
            <input
              value={formData.title}
              onChange={(e) => handleDataChange(e)}
              type="text"
              name="title"
              className="text-black text-[17px] rounded-sm px-2 py-[3px] outline-none mt-1"
              autoComplete="off"
            />
          </fieldset>

          <fieldset className="flex flex-col max-[599px]:w-full">
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

          <fieldset className="flex flex-col max-[599px]:w-full">
            <label className="text-white text-[17px] font-semibold">
              Category
            </label>
            <select
              className="outline-none py-1"
              defaultValue={categories[0]}
              name="categories"
              onChange={handleDataChange}>
              <option>Select Category</option>
              {categories &&
                categories.map((category) => {
                  return (
                    <option key={category._id}>
                      {category.name.slice(0, 1).toUpperCase() +
                        category.name.slice(1)}
                    </option>
                  );
                })}
            </select>
          </fieldset>

          <fieldset className="flex flex-col min-[600px]:w-[350px] max-[599px]:w-full">
            <label className="text-white text-[17px] font-semibold">
              Thumbnail
            </label>
            <input
              onChange={(e) => handleDataChange(e)}
              type="file"
              accept="image/*"
              name="thumbnail"
              className="text-[16px] py-1 text-white outline-none mt-1"
            />
          </fieldset>

          <fieldset className="flex flex-col min-[600px]:w-[350px] max-[599px]:w-full">
            <label className="text-white text-[17px] font-semibold">
              Video
            </label>
            <input
              onChange={(e) => handleDataChange(e)}
              type="file"
              accept="video/*"
              name="video"
              className="text-[16px] py-1 text-white outline-none mt-1"
            />
          </fieldset>

          <article className="flex justify-start gap-x-4">
            <button
              type="submit"
              name="Upload"
              className="mt-5 flex items-center
                font-semibold text-[1.1rem] text-white cursor-pointer bg-slate-600
                rounded-sm py-[7px] px-8">
              Upload
              {videoLoaderLoading && (
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

export default UploadVideoForm;
