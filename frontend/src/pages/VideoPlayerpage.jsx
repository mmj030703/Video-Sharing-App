/* eslint-disable react-hooks/exhaustive-deps */
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { closeSidebar } from "../utils/slices/sidebarSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faThumbsUp as faThumbsUpRegular,
  faThumbsDown as faThumbsDownRegular,
} from "@fortawesome/free-regular-svg-icons";
import {
  faEllipsisVertical,
  faThumbsUp as faThumbsUpSolid,
  faThumbsDown as faThumbsDownSolid,
} from "@fortawesome/free-solid-svg-icons";
import Toaster from "../components/Toaster";
import errorHandler from "../utils/errorHandler";
import showToaster from "../utils/showToaster";
import UpdateCommentForm from "../components/UpdateCommentForm";

function VideoPlayerPage() {
  const [commentLoaderLoading, setCommentLoaderLoading] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const user = useSelector((store) => store.userSlice.user);
  const dispatch = useDispatch();
  const { id } = useParams("id");
  const [openCommentEditListId, setOpenCommentEditListId] = useState("");
  const [toaster, setToaster] = useState({
    showToaster: false,
    toasterMessage: "",
    toasterTailwindTextColorClass: "",
  });
  const navigate = useNavigate();
  const [showUpdateCommentForm, setShowUpdateCommentForm] = useState(false);
  const [likeDislikeOperation, setLikeDislikeOperation] = useState({
    liked: false,
    disliked: false,
  });

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

  useEffect(() => {
    dispatch(closeSidebar());
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    fetchLikeDislikeUserStatus();
  }, [id]);

  async function fetchLikeDislikeUserStatus() {
    // console.log("id:", id);
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("accessToken");

    const likeDislikeUserStatusRes = await fetch(
      `/api/v1/likes-dislikes/user-status/${id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
        }),
      }
    );

    const likeDislikeUserStatus = await likeDislikeUserStatusRes.json();
    // console.log(likeDislikeUserStatus);

    // Logged In User like-dislike status
    if (likeDislikeUserStatus.status === "success") {
      if (likeDislikeUserStatus.data.userLikedDisliked === true) {
        // console.log("user has either liked or disliked");
        setLikeDislikeOperation({
          liked: likeDislikeUserStatus.data.type === true ? true : false,
          disliked: likeDislikeUserStatus.data.type === false ? true : false,
        });
      } else
        setLikeDislikeOperation({
          liked: false,
          disliked: false,
        });
    } else if (likeDislikeUserStatus.errorCode === "INVALID_TOKEN") {
      navigate("/login");
    } else if (likeDislikeUserStatus.errorCode === "TOKEN_EXPIRED") {
      // console.log("failed");

      const res = await fetch(`/api/v1/users/refresh-token/${userId}`);
      const resJson = await res.json();

      if (resJson?.status === "success") {
        localStorage.setItem("accessToken", resJson.data.accessToken);
        await fetchLikeDislikeUserStatus();
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
      errorHandler(likeDislikeUserStatus.errorCode, setToaster);
    }
  }

  async function fetchData() {
    const [videoRes, commentsRes] = await Promise.all([
      fetch(`/api/v1/videos/video/${id}`),
      fetch(`/api/v1/comments/all/${id}`),
    ]);

    const [video, comments] = await Promise.all([
      videoRes.json(),
      commentsRes.json(),
    ]);

    if (video.status === "success") {
      setVideo(video.data);
    } else {
      showToaster(
        "There was an error while loading data please reload !",
        "text-red-400",
        setToaster
      );
    }

    if (comments.status === "success") {
      setComments(comments.data.comments);
    } else {
      showToaster("Problem in loading comments !", "text-red-400", setToaster);
    }

    const recommendedVideosRes = await fetch(
      `/api/v1/videos/category/${video.data.video.categories[0]._id}`
    );
    const recommendedVideos = await recommendedVideosRes.json();

    if (recommendedVideos.status === "success") {
      setRecommendedVideos(recommendedVideos.data.videos);
    } else {
      showToaster(
        "Problem in loading recommended videos !",
        "text-red-400",
        setToaster
      );
    }
  }

  function handleAddComment() {
    setCommentLoaderLoading(true);

    const error = validateCommentMessage(commentInput);
    if (error) return;

    addComment(commentInput);
  }

  async function addComment(message) {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("accessToken");

    const res = await fetch(`/api/v1/comments/add/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        message,
      }),
    });

    const comment = await res.json();

    if (comment?.status === "success") {
      const commentsRes = await fetch(`/api/v1/comments/all/${id}`);
      const comments = await commentsRes.json();
      // console.log(comments);

      setCommentLoaderLoading(false);

      if (comments.status === "success") {
        // console.log(comments);
        setCommentInput("");
        setComments(comments.data.comments);
        // console.log("comments after fetching : ", comments);

        showToaster(
          "Comment added succesfully !",
          "text-green-500",
          setToaster
        );
      } else {
        showToaster(
          "Problem in fetching comments ! Please reload for getting comments.",
          "text-red-400",
          setToaster
        );
      }
    } else if (comment.errorCode === "INVALID_TOKEN") {
      navigate("/login");
    } else if (comment.errorCode === "TOKEN_EXPIRED") {
      // console.log("failed");

      const res = await fetch(`/api/v1/users/refresh-token/${userId}`);
      const resJson = await res.json();

      if (resJson?.status === "success") {
        localStorage.setItem("accessToken", resJson.data.accessToken);
        handleAddComment();
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
      setCommentLoaderLoading(false);
      errorHandler(comment.errorCode, setToaster);
    }

    // console.log(comment);
  }

  function validateCommentMessage(message) {
    if (!message || message.trim() === "") {
      errorHandler("FIELDS_MISSING", setToaster);
      return true;
    }

    return false;
  }

  async function handleCommentDelete(commentId) {
    console.log(commentId);

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("accessToken");

    const res = await fetch(`/api/v1/comments/delete/${commentId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
      }),
    });

    const deletedComment = await res.json();

    console.log(deletedComment);

    if (deletedComment.status === "success") {
      const commentsRes = await fetch(`/api/v1/comments/all/${id}`);
      const comments = await commentsRes.json();
      console.log(comments);

      if (comments.status === "success") {
        console.log(comments);
        setComments(comments.data.comments);
        setOpenCommentEditListId(null);
        console.log("comments after fetching : ", comments);

        showToaster(
          "Comment deleted succesfully !",
          "text-green-500",
          setToaster
        );
      }
    } else if (deletedComment.errorCode === "INVALID_TOKEN") {
      navigate("/login");
    } else if (deletedComment.errorCode === "TOKEN_EXPIRED") {
      console.log("failed");

      const res = await fetch(`/api/v1/users/refresh-token/${userId}`);
      const resJson = await res.json();

      if (resJson?.status === "success") {
        localStorage.setItem("accessToken", resJson.data.accessToken);
        await handleCommentDelete(commentId);
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
      setCommentLoaderLoading(false);
      errorHandler(deletedComment.errorCode, setToaster);
    }
  }

  async function handleLikeDislikeOperation(type) {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("accessToken");

    const res = await fetch(
      `/api/v1/likes-dislikes/update-likes-dislikes/${id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          type: type === "like" ? true : false,
          operation:
            (type === "like" && !likeDislikeOperation.liked) ||
            (type === "dislike" && !likeDislikeOperation.disliked)
              ? "add"
              : "remove",
          alreadyLiked: likeDislikeOperation.liked,
          alreadyDisliked: likeDislikeOperation.disliked,
        }),
      }
    );

    const resJson = await res.json();

    if (resJson.status === "success") {
      console.log("success");

      setLikeDislikeOperation((prevState) => {
        console.log("prev", prevState);
        let liked = prevState.liked;
        let disliked = prevState.disliked;

        const newState = {
          liked: false,
          disliked: false,
        };

        if (type === "like" && !liked) {
          newState.liked = !liked ? true : false;
          newState.disliked = false;
        } else if (type === "dislike" && !disliked) {
          newState.disliked = !disliked ? true : false;
          newState.liked = false;
        }

        console.log(newState);
        return newState;
      });
    } else if (resJson.errorCode === "INVALID_TOKEN") {
      navigate("/login");
    } else if (resJson.errorCode === "TOKEN_EXPIRED") {
      console.log("failed");

      const res = await fetch(`/api/v1/users/refresh-token/${userId}`);
      const resJson = await res.json();

      if (resJson?.status === "success") {
        localStorage.setItem("accessToken", resJson.data.accessToken);
        await handleLikeDislikeOperation(type);
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
      errorHandler(resJson.errorCode, setToaster);
    }
  }

  return (
    <section className={`overflow-hidden w-full py-3`}>
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
                <section className="text-white mt-4">
                  <h1 className="text-2xl font-semibold">
                    {video.video.title}
                  </h1>
                  <article className="mt-3 flex items-center justify-between gap-x-3">
                    <section className="flex items-center gap-x-3">
                      <img
                        src={video.video.channel.avatar}
                        className="rounded-full w-14"
                      />
                      <article>
                        <p className="font-semibold">
                          {video.video.channel.title}
                        </p>
                        <p className="text-slate-300">85k subscribers</p>
                      </article>
                      <button
                        onClick={(e) => {
                          e.target.textContent =
                            e.target.textContent === "Subscribe"
                              ? "Subscribed"
                              : "Subscribe";
                        }}
                        className="hover:bg-slate-500 ml-3 font-semibold text-[1.2rem] text-white py-[7px] px-5 cursor-pointer bg-slate-600 rounded-sm">
                        Subscribe
                      </button>
                    </section>
                    <article className="mr-5 bg-slate-500 rounded-md py-1">
                      <button
                        onClick={() => handleLikeDislikeOperation("like")}>
                        {!likeDislikeOperation.liked && (
                          <FontAwesomeIcon
                            icon={faThumbsUpRegular}
                            className="text-3xl border-e-2 py-1 px-6"
                          />
                        )}
                        {likeDislikeOperation.liked && (
                          <FontAwesomeIcon
                            icon={faThumbsUpSolid}
                            className="text-3xl border-e-2 py-1 px-6"
                          />
                        )}
                      </button>
                      <button
                        onClick={() => handleLikeDislikeOperation("dislike")}>
                        {!likeDislikeOperation.disliked && (
                          <FontAwesomeIcon
                            icon={faThumbsDownRegular}
                            className="text-3xl py-1 px-6"
                          />
                        )}
                        {likeDislikeOperation.disliked && (
                          <FontAwesomeIcon
                            icon={faThumbsDownSolid}
                            className="text-3xl py-1 px-6"
                          />
                        )}
                      </button>
                    </article>
                  </article>
                  <article className="max-w-[870px] mt-7 bg-slate-600 p-3 rounded-md">
                    <article className="flex gap-x-3 font-semibold">
                      <p>{video.viewsCount} views</p>
                      <p>
                        {new Date(video.video.createdAt).getDate()}{" "}
                        {months[new Date(video.video.createdAt).getMonth()]},{" "}
                        {new Date(video.video.createdAt).getFullYear()}
                      </p>
                    </article>
                    <article className="mt-2">
                      <p className="whitespace-pre-wrap">
                        {video.video.description}
                      </p>
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
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      type="text"
                      placeholder="Add Comment"
                      autoComplete="off"
                      className="w-full rounded-md px-2 placeholder-white placeholder:font-semibold bg-slate-500 text-white text-lg outline-none py-2"
                    />
                    <button
                      onClick={handleAddComment}
                      className="flex items-center justify-center mt-4 hover:bg-slate-500 font-semibold text-[1rem] text-white py-[5px] px-2 cursor-pointer bg-slate-600 rounded-sm">
                      Add Comment
                      {commentLoaderLoading && (
                        <span className="ml-3 animate-spin inline-block w-5 h-5 border-4 border-white border-t-slate-600 rounded-full"></span>
                      )}
                    </button>
                  </article>

                  {/* comments */}
                  <section className="mt-10 space-y-5">
                    {comments.length ? (
                      comments.map((comment) => {
                        const date = new Date(comment.updatedAt);

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
                                    onClick={() => {
                                      setOpenCommentEditListId((prevState) => {
                                        return prevState === comment._id
                                          ? null
                                          : comment._id;
                                      });
                                    }}
                                    className="absolute top-2 right-2">
                                    <FontAwesomeIcon
                                      icon={faEllipsisVertical}
                                    />
                                  </button>
                                  <ul
                                    className={`z-50 absolute top-5 right-6 ${
                                      openCommentEditListId !== comment._id
                                        ? "hidden"
                                        : ""
                                    } bg-slate-600 top-0 rounded-md`}>
                                    <li
                                      onClick={() =>
                                        setShowUpdateCommentForm(true)
                                      }
                                      className="hover:bg-slate-500 cursor-pointer rounded-t-md px-4 py-2 font-semibold text-white text-[.9rem]">
                                      Update
                                    </li>
                                    <li
                                      onClick={() => {
                                        handleCommentDelete(comment._id);
                                      }}
                                      className="hover:bg-slate-500 cursor-pointer border-t-2 rounded-b-md px-4 py-[6px] bg-red-700 font-semibold text-white text-[.9rem]">
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
                        Make first comment on this video !
                      </h1>
                    )}

                    {showUpdateCommentForm && (
                      <UpdateCommentForm
                        setToaster={setToaster}
                        setShowUpdateCommentForm={setShowUpdateCommentForm}
                        setOpenCommentEditListId={setOpenCommentEditListId}
                        comment={comments.find(
                          (comment) => comment._id === openCommentEditListId
                        )}
                        setComments={setComments}
                      />
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
      {toaster.showToaster && (
        <Toaster
          text={toaster.toasterMessage}
          tailwindTextColorClass={toaster.toasterTailwindTextColorClass}
        />
      )}
    </section>
  );
}

export default VideoPlayerPage;
