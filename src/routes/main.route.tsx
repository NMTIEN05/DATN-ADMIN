import { createBrowserRouter } from "react-router-dom";
import Dashbroad from "../components/common/Dashbroad";
import Content from "../components/layouts/MainLayout";


import ListCategory from "../pages/Category/ListCategory";
import CreateCategory from "../pages/Category/CreateCategory";
import UpdateCategory from "../pages/Category/UpdateCategory";
import ListCapacity from "../pages/Capacity/ListCapacity";
import CreateCapacity from "../pages/Capacity/CreateCapacity";
import UpdateCapacity from "../pages/Capacity/EditCapacity";

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
            element: <UpdateCategory />, 
          },
          {
            path: "capacity",
            element: <ListCapacity/>, 
          },
          {
            path:"capacity/create",
            element: <CreateCapacity />, // Giả sử bạn có một trang tạo dung lượng
          },
          {
            path:"capacity/edit/:id",
            element: <UpdateCapacity />, // Giả sử bạn có một trang cập nhật dung lượng
          }
        ],
      },
    ],
  },
]);

