import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

function SearchPage() {
  const [searchVideos, setSearchVideos] = useState([]);
  const sidebarOpened = useSelector(
    (store) => store.sidebarSlice.sidebarOpened
  );
  const [searchParams] = useSearchParams();
  const title = searchParams.get("q");

  useEffect(() => {
    if (title === "") return;

    // On first render, rendering the search query
    fetchSearchVideos(title);
  }, [searchParams]);

  async function fetchSearchVideos(title) {
    const res = await fetch(
      `https://video-sharing-app-2n9p.onrender.com/api/v1/videos/search/title?query=${title}`
    );
    const searchVideos = await res.json();

    setSearchVideos(searchVideos?.data?.videos);
  }

  return (
    <section
      className={`${
        sidebarOpened ? "min-[850px]:ml-[270px]" : "ml-0"
      } py-3 max-[350px]:mt-24 max-[685px]:mt-14 w-full`}>
      {/* List of videos as per query */}
      <section className="w-full flex flex-col gap-y-2">
        {searchVideos.length ? (
          searchVideos.map((video) => {
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
              <Link
                to={`/videos/watch/${video._id}`}
                key={video._id}
                className="w-full">
                <article className="bg-slate-600 rounded-md flex shadow-lg flex-col min-[650px]:flex-row gap-x-4 mt-3">
                  <figure>
                    <img
                      src={video.thumbnail}
                      className="w-full min-[650px]:min-w-[260px] min-[650px]:w-[260px] h-[200px] object-cover rounded-md min-[650px]:rounded-s-md"
                    />
                  </figure>
                  <article className="text-white font-semibold py-3 min-[650px]:py-1 px-2 min-[650px]:px-0">
                    <p className="text-[22px]">{video.title}</p>
                    <article className="mt-1 flex items-center gap-x-4 space-y-1">
                      <figure>
                        <img
                          src={video.channel.avatar}
                          className="w-8 h-8 rounded-full mt-1"
                        />
                      </figure>
                      <p className="text-[15px] text-slate-300">
                        {video.channel.title}
                      </p>
                    </article>
                    <p className="text-[15px] text-slate-300 mt-3">
                      {`${date.getDate()} ${
                        months[date.getMonth()]
                      }, ${date.getFullYear()}`}
                    </p>
                    <p
                      title="description"
                      className="text-[15px] text-slate-300 mt-2">
                      {video.description.length > 80
                        ? video.description.slice(0, 80) + "..."
                        : video.description}
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
  );
}

export default SearchPage;
