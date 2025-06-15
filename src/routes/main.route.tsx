import { createBrowserRouter } from "react-router-dom";
import Dashbroad from "../components/common/Dashbroad";
import Content from "../components/layouts/MainLayout";

import ListCategory from "../pages/Category/ListCategory";
import CreateCategory from "../pages/Category/CreateCategory";
import UpdateCategory from "../pages/Category/UpdateCategory";

import ListCapacity from "../pages/Capacity/ListCapacity";
import CreateCapacity from "../pages/Capacity/CreateCapacity";
import UpdateCapacity from "../pages/Capacity/EditCapacity";

import CreateProduct from "../pages/Product/CreateProduct";
import ProductList from "../pages/Product/ListProduct";

import CreateColer from "../pages/Coler/CreateColer";
import ListColor from "../pages/Coler/ListColer";
import EditColor from "../pages/Coler/EditColer";

export const router = createBrowserRouter([
  {
    path: "/dashboard",
    element: <Dashbroad />, // Layout chính có <Outlet />
    children: [
      {
        path: "", // Route con trống, để chứa children
        element: <Content />, // Layout con có <Outlet />
        children: [
          // Category routes
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

          // Capacity routes
          {
            path: "capacity",
            element: <ListCapacity />,
          },
          {
            path: "capacity/create",
            element: <CreateCapacity />,
          },
          {
            path: "capacity/edit/:id",
            element: <UpdateCapacity />,
          },

          // Product routes
          {
            path: "product",
            element: <ProductList />,
          },
          {
            path: "product/create",
            element: <CreateProduct />,
          },

          // Color routes
          {
            path: "color",
            element: <ListColor />,
          },
          {
            path: "color/create",
            element: <CreateColer />,
          },
          {
            path: "color/edit/:id",
            element: <EditColor />,
          },
        ],
      },
    ],
  },
]);
