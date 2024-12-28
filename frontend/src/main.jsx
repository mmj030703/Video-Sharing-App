import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/Homepage.jsx";
import LoginPage from "./pages/Loginpage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import VideoPlayerPage from "./pages/VideoPlayerpage.jsx";
import ChannelPage from "./pages/Channelpage.jsx";
import SearchPage from "./pages/Searchpage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/videos/watch/:id",
        element: <VideoPlayerPage />,
      },
      {
        path: "/channels/:id",
        element: <ChannelPage />,
      },
      {
        path: "/search",
        element: <SearchPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router}>
      <App />
    </RouterProvider>
  </StrictMode>
);
