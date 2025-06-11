import { createBrowserRouter } from "react-router-dom";
import Dashbroad from "../components/common/Dashbroad";
import Content from "../components/layouts/MainLayout";


import ListCategory from "../pages/Category/ListCategory";
import CreateCategory from "../pages/Category/CreateCategory";
import UpdateCategory from "../pages/Category/UpdateCategory";

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
            path: "category",    
            element: <ListCategory />, 
          },
          {
            path: "category/create",
            element: <CreateCategory />, 
          },
          {
            path: "category/edit/:id",
            element: <UpdateCategory />, // Sử dụng lại CreateCategory cho cập nhật
          }

        ],
      },
    ],
  },
]);

