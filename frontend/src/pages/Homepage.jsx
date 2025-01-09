import { useDispatch, useSelector } from "react-redux";
import { addHomepageVideos } from "../utils/slices/appSlice";
import { useEffect } from "react";
import { Link } from "react-router-dom";

function HomePage() {
  const categories = useSelector((store) => store.appSlice.categories);
  const homepageVideos = useSelector((store) => store.appSlice.homepageVideos);
  const sidebarOpened = useSelector(
    (store) => store.sidebarSlice.sidebarOpened
  );
  const dispatch = useDispatch();

  useEffect(() => {
    // On first render, rendering all videos in homepage
    fetchHomepageVideos("all");
  }, []);

  async function fetchHomepageVideos(category) {
    const res = await fetch(
      `https://video-sharing-app-2n9p.onrender.com/api/v1/videos/category/${category}`
    );
    const homepageVideos = await res.json();

    dispatch(addHomepageVideos(homepageVideos?.data?.videos));
  }

  return (
    <section
      className={`${
        sidebarOpened ? "min-[850px]:ml-[270px]" : "ml-0"
      } overflow-hidden w-full py-3`}>
      {/* Categories */}
      <section className="overflow-scroll scrollbar-none">
        <section className="flex gap-x-4 max-[350px]:mt-24 max-[685px]:mt-14">
          <button
            className="font-semibold text-[1.05rem] text-white py-[5px] px-4 cursor-pointer bg-slate-600 rounded-sm"
            onClick={() => fetchHomepageVideos("all")}>
            All
          </button>
          {categories.length
            ? categories.map((category) => {
                return (
                  <button
                    key={category._id}
                    onClick={() => fetchHomepageVideos(category._id)}
                    className="font-semibold text-[1.05rem] text-white py-[5px] px-4 cursor-pointer bg-slate-600 rounded-sm">
                    {category.name.slice(0, 1).toUpperCase() +
                      category.name.slice(1)}
                  </button>
                );
              })
            : null}
        </section>
      </section>

      {/* List of videos as per categories */}
      <section className="mt-6 grid max-[550px]:place-items-center grid-cols-[repeat(auto-fit, minmax(1fr,1fr))] min-[550px]:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-x-4 gap-y-5">
        {homepageVideos.length ? (
          homepageVideos.map((video) => {
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
                <article className="bg-slate-600 rounded-md min-[550px]:max-w-[400px] min-h-[350px]">
                  <figure>
                    <img
                      src={video.thumbnail}
                      className="w-full h-[220px] object-cover rounded-md"
                    />
                  </figure>
                  <article className="flex gap-x-4 px-2 py-2">
                    <figure>
                      <img
                        src={video.channel.avatar}
                        className="w-10 rounded-full mt-1"
                      />
                    </figure>
                    <article className="text-white font-semibold ">
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
                          {`${date.getDate()} ${
                            months[date.getMonth()]
                          }, ${date.getFullYear()}`}
                        </p>
                      </article>
                    </article>
                  </article>
                </article>
              </Link>
            );
          })
        ) : (
          <h1 className="w-full whitespace-nowrap text-5xl mt-5 text-slate-600 font-bold">
            No videos !
          </h1>
        )}
      </section>
    </section>
  );
}

export default HomePage;
