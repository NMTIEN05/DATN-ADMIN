import { createBrowserRouter } from "react-router-dom";
import Dashbroad from "../components/common/Dashbroad";
import Content from "../components/layouts/MainLayout";

import UserForm from "../pages/userList";
import UserList from "../pages/userList";

export const router = createBrowserRouter([
  {
    path: "/dashboard",
    element: <Dashbroad />,   // Layout chính có <Outlet />
    children: [
      {
        path: "",             // Route con trống, để chứa children
        element: <Content />, // Layout con có <Outlet />
        children: [
          {
            path: "users/add",    // /dashboard/users
            element: <UserList />, // Trang users
          },
        ],
      },
    ],
  },
]);

