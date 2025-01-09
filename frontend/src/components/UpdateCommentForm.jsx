/* eslint-disable react/prop-types */
import { useState } from "react";
import showToaster from "../utils/showToaster";
import { useNavigate } from "react-router-dom";
import errorHandler from "../utils/errorHandler";
import { updateUserData } from "../utils/slices/userSlice";
import { useDispatch } from "react-redux";

function UpdateCommentForm({
  setToaster,
  setShowUpdateCommentForm,
  comment,
  setOpenCommentEditListId,
  setComments,
}) {
  const [message, setMessage] = useState(comment.message);
  const [commentLoaderLoading, setCommentLoaderLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleCommentUpdate(e) {
    e?.preventDefault();

    setCommentLoaderLoading(true);

    if (message.trim() === "") {
      showToaster("Comment cannot be empty !", "text-red-400", setToaster);
      return;
    }

    updateComment(message);
  }

  async function updateComment(message) {
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
      `https://video-sharing-app-2n9p.onrender.com/api/v1/comments/update/${comment._id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
          userId,
        }),
      }
    );

    const updatedComment = await res.json();

    if (updatedComment.status === "success") {
      const commentsRes = await fetch(
        `https://video-sharing-app-2n9p.onrender.com/api/v1/comments/all/${comment.video}`
      );
      const comments = await commentsRes.json();

      setCommentLoaderLoading(false);

      if (comments.status === "success") {
        setComments(comments.data.comments);
        setShowUpdateCommentForm(false);
        setOpenCommentEditListId(null);

        showToaster(
          "Comment Updated succesfully !",
          "text-green-500",
          setToaster
        );
      }
    } else if (updatedComment.errorCode === "INVALID_TOKEN") {
      showToaster("Please login again !", "text-white", setToaster);
      logout();
      navigate("/login");
    } else if (updatedComment.errorCode === "TOKEN_EXPIRED") {
      const res = await fetch(
        `https://video-sharing-app-2n9p.onrender.com/api/v1/users/refresh-token/${userId}`
      );
      const resJson = await res.json();

      if (resJson?.status === "success") {
        localStorage.setItem("accessToken", resJson.data.accessToken);
        handleCommentUpdate();
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
      setCommentLoaderLoading(false);
      errorHandler(updatedComment.errorCode, setToaster);
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
    <section className="cursor-not-allowed fixed px-4 z-50 top-0 left-0 min-h-screen w-screen flex flex-col justify-center items-center">
      <section className="cursor-pointer max-[449px]:w-full bg-slate-700 p-5 rounded-md shadow-2xl">
        <header>
          <h1 className="text-white text-3xl font-semibold">Update Comment</h1>
        </header>
        <form
          onSubmit={handleCommentUpdate}
          className="mt-9 flex flex-col gap-y-2">
          {/* message field */}
          <fieldset className="flex flex-col min-[450px]:w-[350px]">
            <label className="text-white text-[20px] font-semibold">
              Comment
            </label>
            <input
              type="text"
              value={message}
              name="message"
              onChange={(e) => setMessage(e.target.value)}
              className="text-black text-[17px] px-2 py-1 outline-none mt-1"
              autoComplete="off"
            />
          </fieldset>
          <article className="flex max-[330px]:flex-col justify-start gap-x-4">
            <button
              type="submit"
              name="update"
              className="mt-5 flex items-center
                font-semibold text-[1.1rem] text-white cursor-pointer bg-slate-600
                rounded-sm py-[7px] px-8">
              Update
              {commentLoaderLoading && (
                <span className="ml-3 animate-spin inline-block w-6 h-6 border-4 border-white border-t-slate-600 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => {
                setMessage("");
                setOpenCommentEditListId((prevState) => {
                  return prevState === comment._id ? null : comment._id;
                });
                setShowUpdateCommentForm(false);
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

export default UpdateCommentForm;
