import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { closeSidebar } from "../utils/slices/sidebarSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faThumbsDown } from "@fortawesome/free-regular-svg-icons";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";

function VideoPlayerPage() {
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const sidebarOpened = useSelector(
    (store) => store.sidebarSlice.sidebarOpened
  );
  const user = useSelector((store) => store.userSlice.user);
  const dispatch = useDispatch();
  const { id } = useParams("id");
  const [openCommentEditList, setOpenCommentEditList] = useState(false);

  useEffect(() => {
    dispatch(closeSidebar());
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [videoRes, commentsRes] = await Promise.all([
      fetch(`/api/v1/videos/video/${id}`),
      fetch(`/api/v1/comments/all/${id}`),
    ]);

    const [video, comments] = await Promise.all([
      videoRes.json(),
      commentsRes.json(),
    ]);

    setVideo(video.data);
    setComments(comments.data.comments);

    const recommendedVideosRes = await fetch(
      `/api/v1/videos/category/${video.data.video.categories[0]._id}`
    );
    const recommendedVideos = await recommendedVideosRes.json();

    setRecommendedVideos(recommendedVideos.data.videos);
  }

  return (
    <section
      className={`${
        sidebarOpened ? "ml-[270px]" : "ml-0"
      } overflow-hidden w-full py-3`}>
      <section className="">
        {/* Video Player */}
        {video && (
          <section className="flex gap-x-5">
            <section className="flex flex-col gap-y-7">
              <section>
                <video
                  className="bg-slate-600 rounded-md outline-none"
                  src={video.video.videoUrl}
                  width="870"
                  height="450"
                  controls
                  autoPlay
                />
                <section className="text-white mt-4 space-y-3">
                  <h1 className="text-2xl font-semibold">
                    {video.video.title}
                  </h1>
                  <article className="flex items-center justify-between gap-x-3">
                    <section className="flex items-center gap-x-3">
                      <img
                        src={video.video.channel.avatar}
                        className="rounded-full w-14"
                      />
                      <article>
                        <p className="font-semibold">
                          {video.video.channel.title}
                        </p>
                        <p className="text-slate-300">
                          {Math.floor(Math.random() * 100)}k subscribers
                        </p>
                      </article>
                      <button className="ml-3 font-semibold text-[1.2rem] text-white py-[7px] px-5 cursor-pointer bg-slate-600 rounded-sm">
                        Subscribe
                      </button>
                    </section>
                    <article className="mr-5 bg-slate-500 rounded-md py-1">
                      <button>
                        <FontAwesomeIcon
                          icon={faThumbsUp}
                          className="text-3xl border-e-2 py-1 px-6"
                        />
                      </button>
                      <button>
                        <FontAwesomeIcon
                          icon={faThumbsDown}
                          className="text-3xl py-1 px-6"
                        />
                      </button>
                    </article>
                  </article>
                </section>
              </section>
              <section className="text-white pb-14">
                <h2 className="text-2xl font-semibold">
                  {comments?.length} Comments
                </h2>
                <section>
                  {/* Add new comment */}
                  <article className="flex flex-col mt-4">
                    <input
                      type="text"
                      placeholder="Add Comment"
                      className="w-full rounded-md px-2 placeholder-white placeholder:font-semibold bg-slate-500 text-white text-lg outline-none py-2"
                    />
                    <button className="mt-4 font-semibold text-[1rem] text-white py-[5px] px-2 cursor-pointer bg-slate-600 rounded-sm">
                      Add Comment
                    </button>
                  </article>

                  {/* comments */}
                  <section className="mt-10 space-y-5">
                    {comments.length ? (
                      comments.map((comment) => {
                        const date = new Date(comment.createdAt);
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

                        return (
                          <article
                            key={comment._id}
                            className="flex items-center gap-x-4 relative">
                            <img
                              src={comment.user.avatar}
                              className="rounded-full w-12"
                            />
                            <article>
                              <article className="flex items-center gap-x-2 font-semibold">
                                <p className="text-slate-300">
                                  {comment.user.username}
                                </p>
                                <p className="text-[14px] mt-1">
                                  {" "}
                                  {`${date.getDate()} ${
                                    months[date.getMonth()]
                                  }, ${date.getFullYear()}`}
                                </p>
                              </article>
                              <p className="mt-1">{comment.message}</p>

                              {user.userId === comment.user._id && (
                                <section>
                                  <button
                                    onClick={() =>
                                      setOpenCommentEditList(
                                        (prevState) => !prevState
                                      )
                                    }
                                    className="absolute top-2 right-2">
                                    <FontAwesomeIcon
                                      icon={faEllipsisVertical}
                                    />
                                  </button>
                                  <ul
                                    className={`absolute top-10 right-2 ${
                                      !openCommentEditList ? "hidden" : ""
                                    } bg-slate-600 top-16 rounded-md`}>
                                    <li className="hover:bg-slate-500 cursor-pointer rounded-t-md px-5 py-2 font-semibold text-white text-[1rem]">
                                      Update
                                    </li>
                                    <li className="hover:bg-slate-500 cursor-pointer border-t-2 rounded-b-md px-5 py-2 font-semibold text-white text-[1rem]">
                                      Delete
                                    </li>
                                  </ul>
                                </section>
                              )}
                            </article>
                          </article>
                        );
                      })
                    ) : (
                      <h1 className="text-center text-5xl mt-10 text-slate-600 font-bold">
                        No video found !
                      </h1>
                    )}
                  </section>
                </section>
              </section>
            </section>
            <section>
              {recommendedVideos.length ? (
                recommendedVideos.map((video) => {
                  const date = new Date(video.createdAt);
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

                  return (
                    <Link to={`/videos/watch/${video._id}`} key={video._id}>
                      <article className="bg-slate-600 rounded-md flex gap-x-4 mt-3">
                        <figure>
                          <img
                            src={video.thumbnail}
                            className="max-w-[170px] h-full object-cover rounded-s-md"
                          />
                        </figure>
                        <article className="text-white font-semibold py-1 ps-1 pe-2">
                          <p className="text-[17px]">{video.title}</p>
                          <article className="mt-1 flex items-center gap-x-2 space-y-1">
                            <figure>
                              <img
                                src={video.channel.avatar}
                                className="w-8 rounded-full mt-1"
                              />
                            </figure>
                            <p className="text-[14px] text-slate-300">
                              {video.channel.title}
                            </p>
                          </article>
                          <p className="text-[15px] text-slate-300 mt-3">
                            {`${date.getDate()} ${
                              months[date.getMonth()]
                            }, ${date.getFullYear()}`}
                          </p>
                          <p className="text-[15px] text-slate-300 mt-2">
                            {video.description}
                          </p>
                        </article>
                      </article>
                    </Link>
                  );
                })
              ) : (
                <h1 className="text-5xl mt-5 text-slate-600 font-bold">
                  No video found !
                </h1>
              )}
            </section>
          </section>
        )}
      </section>
    </section>
  );
}

export default VideoPlayerPage;
