import { createBrowserRouter } from "react-router-dom";
import Dashbroad from "../components/common/Dashbroad";
import Content from "../components/layouts/MainLayout";

import ListCategory from "../pages/Category/ListCategory";
import CreateCategory from "../pages/Category/CreateCategory";
import UpdateCategory from "../pages/Category/UpdateCategory";



import CreateProduct from "../pages/Product/CreateProduct";
// import ProductList from "../pages/Product/ListProduct";

import CreateColer from "../pages/Coler/CreateColer";
import ListColor from "../pages/Coler/ListColer";
import EditColor from "../pages/Coler/EditColer";
import CreateProductGroup from "../pages/Capacity/CreateProductGroup";
import ListProductGroup from "../pages/Capacity/ListProductGroup";
import EditProductGroup from "../pages/Capacity/EditProductGroup";
import ProductList from "../pages/Product/ListProduct";
import EditProduct from "../pages/Product/EditProduct";

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
            element: <ListProductGroup />,
          },
          {
            path: "capacity/create",
            element: <CreateProductGroup />,
          },
          {
            path: "capacity/edit/:id",
            element: <EditProductGroup />,
          },

          {
            path: "product",
            element: <ProductList />,
          },

          {
            path: "product/create",
            element: <CreateProduct />,
          },
          {
            path: "product/edit/:id",
            element: <EditProduct />,
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
