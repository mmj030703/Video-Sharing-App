import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import UpdateChannelForm from "../components/UpdateChannelForm";
import Toaster from "../components/Toaster.jsx";
import UpdateVideoForm from "../components/UpdateVideoForm.jsx";
import showToaster from "../utils/showToaster.js";
import errorHandler from "../utils/errorHandler.js";

function ChannelPage() {
  const [channel, setChannel] = useState(null);
  const [channelVideos, setChannelVideos] = useState(null);
  const [openVideoEditListId, setOpenVideoEditListId] = useState("");
  const [showUpdateForm, setShowUpdateForm] = useState({
    channel: false,
    video: false,
  });
  const [channelUpdated, setChannelUpdated] = useState("");
  const sidebarOpened = useSelector(
    (store) => store.sidebarSlice.sidebarOpened
  );
  const user = useSelector((store) => store.userSlice.user);
  const { id } = useParams("id");
  const [toaster, setToaster] = useState({
    showToaster: false,
    toasterMessage: "",
    toasterTailwindTextColorClass: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchChannelById(id);
  }, [id, channelUpdated]);

  async function fetchChannelById(id) {
    const [channelRes, channelVideosRes] = await Promise.all([
      fetch(
        `https://video-sharing-app-2n9p.onrender.com/api/v1/channels/channel/${id}`
      ),
      fetch(
        `https://video-sharing-app-2n9p.onrender.com/api/v1/videos/channel/${id}`
      ),
    ]);

    const [channel, channelVideos] = await Promise.all([
      channelRes.json(),
      channelVideosRes.json(),
    ]);

    setChannel(channel.data);
    setChannelVideos(channelVideos.data);
  }

  function getFormattedDate(createdAt) {
    const date = new Date(createdAt);
    const months = {
      0: "Jan",
      1: "Feb",
      2: "Mar",
      3: "Apr",
      4: "May",
      5: "Jun",
      6: "Jul",
      7: "Aug",
      8: "Sep",
      9: "Oct",
      10: "Nov",
      11: "Dec",
    };

    return `${date.getDate()} ${
      months[date.getMonth()]
    }, ${date.getFullYear()}`;
  }

  function handleVideoDelete(videoId) {
    async function deleteVideoById(videoId) {
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

      showToaster("Video getting deleted !", "text-white", setToaster);

      const res = await fetch(
        `https://video-sharing-app-2n9p.onrender.com/api/v1/channels/videos/delete/${videoId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId,
          }),
        }
      );

      const deletedVideo = await res.json();

      if (deletedVideo?.status === "success") {
        setOpenVideoEditListId(false);
        showToaster(
          "Video deleted successfully !",
          "text-green-500",
          setToaster
        );
        setChannelUpdated(Math.random());
      } else if (deletedVideo.errorCode === "INVALID_TOKEN") {
        navigate("/login");
      } else if (deletedVideo.errorCode === "TOKEN_EXPIRED") {
        const res = await fetch(
          `https://video-sharing-app-2n9p.onrender.com/api/v1/users/refresh-token/${userId}`
        );
        const resJson = await res.json();

        if (resJson?.status === "success") {
          localStorage.setItem("accessToken", resJson.data.accessToken);
          handleVideoDelete(videoId);
          return;
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
      } else {
        errorHandler(deletedVideo.errorCode, setToaster);
      }
    }

    deleteVideoById(videoId);
  }

  return (
    <section
      className={`${
        sidebarOpened ? "min:[600px]:ml-[270px]" : "ml-0"
      } overflow-hidden w-full py-3 max-[350px]:mt-24 max-[685px]:mt-14`}>
      {channel && (
        <figure>
          <img
            src={channel?.coverImage}
            className="w-full object-cover h-[200px] outline-none rounded-md"
          />
        </figure>
      )}
      <section className="mt-7">
        <article className="text-white w-full flex max-[449px]:flex-col max-[449px]:items-center gap-x-3">
          {channel && (
            <figure>
              <img
                src={channel?.avatar}
                alt="Channel Avatar"
                className="rounded-full w-40 min-[650px]:w-48"
              />
            </figure>
          )}
          <article className="flex max-[649px]:flex-col max-[449px]:items-center justify-between w-full mt-4">
            <article className="flex-1">
              <h1 className="font-bold text-3xl min-[650px]:text-4xl">
                {channel?.title}
              </h1>
              <article className="flex max-[599px]:flex-col gap-x-4 text-lg mt-1">
                <p className="font-semibold">@{channel?.handle}</p>
                <article className="flex gap-x-2">
                  <p className="text-slate-400">89k subscribers</p>
                  {channelVideos?.totalItems ? (
                    <p className="text-slate-400">
                      {channelVideos?.totalItems} videos
                    </p>
                  ) : null}
                </article>
              </article>
            </article>
            {user.channel.channelId === channel?._id && (
              <button
                onClick={() =>
                  setShowUpdateForm((prevState) => ({
                    ...prevState,
                    channel: true,
                  }))
                }
                className="max-[649px]:w-full self-start rounded-sm bg-slate-500 px-3 py-1 mt-4">
                Update
              </button>
            )}
          </article>
        </article>

        <article className="text-white mt-4 bg-slate-600 rounded-md px-2 py-1 w-full">
          <p className="">{getFormattedDate(channel?.createdAt)}</p>
          <p title={channel?.description}>
            {channel?.description?.length > 200
              ? channel?.description.slice(0, 200) + "..."
              : channel?.description}
          </p>
        </article>
        {showUpdateForm.channel && (
          <UpdateChannelForm
            setToaster={setToaster}
            setShowUpdateChannelForm={setShowUpdateForm}
            channel={channel}
            setChannelUpdated={setChannelUpdated}
          />
        )}
      </section>

      <section className="mt-7">
        <h1 className="text-white font-semibold text-[1.6rem]">Videos</h1>
        <section className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-x-4 gap-y-5">
          {channelVideos?.videos?.length ? (
            channelVideos?.videos?.map((video) => {
              return (
                <article
                  key={video._id}
                  className="bg-slate-600 rounded-md min-h-[350px]">
                  <Link to={`/videos/watch/${video._id}`}>
                    <figure>
                      <img
                        src={video.thumbnail}
                        className="w-full h-[220px] object-cover rounded-t-md"
                      />
                    </figure>
                  </Link>
                  <article className="flex gap-x-4 px-2 py-2">
                    <Link
                      to={`/videos/watch/${video._id}`}
                      className="flex flex-1">
                      <article className="flex gap-x-4">
                        <figure>
                          <img
                            src={video.channel.avatar}
                            className="w-10 rounded-full mt-1"
                          />
                        </figure>
                        <article className="text-white font-semibold w-full">
                          <p title={video.title} className="text-[19px]">
                            {video.title.length > 35
                              ? video.title.slice(0, 35) + " ..."
                              : video.title}
                          </p>
                          <article className="mt-1 space-y-1">
                            <p className="text-[15px] text-slate-300">
                              {video.channel.title}
                            </p>
                            <p className="text-[15px] text-slate-300">
                              {`${getFormattedDate(video?.createdAt)}`}
                            </p>
                          </article>
                        </article>
                      </article>
                    </Link>
                    {user.channel.channelId === channel?._id && (
                      <article className="mr-1 relative">
                        <FontAwesomeIcon
                          icon={faEllipsisV}
                          className="z-50 text-white transition-all cursor-pointer hover:bg-slate-500 px-[14px] py-2 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenVideoEditListId((prevState) => {
                              return prevState === video._id ? null : video._id;
                            });
                          }}
                        />
                        <ul
                          className={`z-50 absolute top-5 right-7 ${
                            openVideoEditListId !== video?._id ? "hidden" : ""
                          } bg-slate-500 top-0 rounded-md`}>
                          <li
                            onClick={() =>
                              setShowUpdateForm((prevState) => ({
                                ...prevState,
                                video: true,
                              }))
                            }
                            className="hover:bg-slate-500 cursor-pointer rounded-t-md px-4 py-2 font-semibold text-white text-[.9rem]">
                            Update
                          </li>
                          <li
                            onClick={() => {
                              handleVideoDelete(video?._id);
                            }}
                            className="hover:bg-slate-500 cursor-pointer border-t-2 rounded-b-md px-4 py-[6px] bg-red-700 font-semibold text-white text-[.9rem]">
                            Delete
                          </li>
                        </ul>
                      </article>
                    )}
                  </article>
                </article>
              );
            })
          ) : (
            <h1 className="w-full whitespace-nowrap text-5xl mt-5 text-slate-600 font-bold">
              Upload your first video !
            </h1>
          )}
          {showUpdateForm.video && (
            <UpdateVideoForm
              setToaster={setToaster}
              setOpenVideoEditListId={setOpenVideoEditListId}
              setShowUpdateVideoForm={setShowUpdateForm}
              video={channelVideos?.videos?.find(
                (video) => video._id === openVideoEditListId
              )}
              setChannelUpdated={setChannelUpdated}
            />
          )}
        </section>
      </section>
      {toaster.showToaster && (
        <Toaster
          text={toaster.toasterMessage}
          tailwindTextColorClass={toaster.toasterTailwindTextColorClass}
        />
      )}
    </section>
  );
}

export default ChannelPage;
