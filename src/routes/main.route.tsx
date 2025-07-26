import { createBrowserRouter } from "react-router-dom";
import Dashbroad from "../components/common/Dashbroad";
import Content from "../components/layouts/MainLayout";

import UserForm from "../pages/userList";
import UserList from "../pages/userList";
import BannerList from "../pages/banner/bannerList";
import ErrorPage from "./ErrorPage"; // sửa đường dẫn

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashbroad />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "",
        element: <Content />,
        errorElement: <ErrorPage />,
        children: [
          {
            path: "users/add",
            element: <UserList />,
          },
          {
            path: "banners",
            element: <BannerList />,
          },
        ],
      },
    ],
  },
  {
    path: "/dashboard",
    element: <Dashbroad />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "",
        element: <Content />,
        errorElement: <ErrorPage />,
        children: [
          {
            path: "users/add",
            element: <UserList />,
          },
          {
            path: "banners",
            element: <BannerList />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <ErrorPage />,
  },
]);
