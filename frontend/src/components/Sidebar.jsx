import { Link } from "react-router-dom";
import Footer from "./Footer";
import { useDispatch, useSelector } from "react-redux";
import { addHomepageVideos } from "../utils/slices/appSlice";

function Sidebar() {
  const categories = useSelector((store) => store.appSlice.categories);
  const sidebarOpened = useSelector(
    (store) => store.sidebarSlice.sidebarOpened
  );
  const dispatch = useDispatch();

  async function fetchHomepageVideos(category) {
    const res = await fetch(`/api/v1/videos/category/${category}`);
    const homepageVideos = await res.json();

    dispatch(addHomepageVideos(homepageVideos?.data?.videos));
  }

  return (
    <section
      className={`${
        !sidebarOpened && "hidden"
      } fixed top-[68px] bg-slate-700 min-w-64 py-2 px-2 pe-2 rounded-sm h-screen overflow-y-scroll scrollbar scrollbar-track-slate-600 scrollbar-thumb-slate-400`}>
      {/* My Section */}
      <section className="flex flex-col gap-y-3 pb-2 w-full hover:">
        <button className="font-semibold text-[1.1rem] text-white cursor-pointer bg-slate-600 rounded-sm">
          <Link to={"/"} className="block py-[8px] px-4">
            Home
          </Link>
        </button>
        <button className="font-semibold text-[1.1rem] text-white cursor-pointer bg-slate-600 rounded-sm">
          <Link to={"/"} className="block py-[8px] px-4">
            Your Channel
          </Link>
        </button>
      </section>

      {/* Categories Section */}
      <section className="mt-5">
        <p className="text-center text-[1.5rem] text-white font-semibold">
          Categories
        </p>
        <section className="flex flex-col gap-y-3 w-full mt-2">
          {categories.length &&
            categories.map((category) => {
              return (
                <button
                  onClick={() => fetchHomepageVideos(category._id)}
                  key={category._id}
                  className="font-semibold text-[1.1rem] text-white py-[8px] px-4 cursor-pointer bg-slate-600 rounded-sm">
                  {category.name.slice(0, 1).toUpperCase() +
                    category.name.slice(1)}
                </button>
              );
            })}
        </section>
      </section>
      <Footer />
    </section>
  );
}

export default Sidebar;