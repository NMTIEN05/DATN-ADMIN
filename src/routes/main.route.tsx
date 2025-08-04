import { createBrowserRouter, Navigate } from "react-router-dom";
import Dashbroad from "../components/common/Dashbroad";
import Content from "../components/layouts/MainLayout";

import ListCategory from "../pages/Category/ListCategory";
import CreateCategory from "../pages/Category/CreateCategory";
import UpdateCategory from "../pages/Category/UpdateCategory";

import CreateProduct from "../pages/Product/CreateProduct";
import ProductList from "../pages/Product/ListProduct";
import EditProduct from "../pages/Product/EditProduct";

import CreateProductGroup from "../pages/Capacity/CreateProductGroup";
import ListProductGroup from "../pages/Capacity/ListProductGroup";
import EditProductGroup from "../pages/Capacity/EditProductGroup";

import ListUser from "../pages/User/ListUser";
import Login from "../pages/Auth/Login";
import Unauthorized from "../pages/Auth/Unauthorized";
import ProtectedRoute from "../pages/Auth/ProtectedRoute";
import AdminOrderList from "../pages/Order/ListOrder";
import DeletedProductList from "../pages/Product/components/DeletedProductList";
import DeletedCategoryList from "../pages/Category/DeletedCategoryList";
import DeletedProductGroupList from "../pages/Capacity/DeletedProductGroupList";
import Dashboard from "../pages/Dash/PT";
import BannerList from "../pages/banner/bannerList";
import ListCoupon from "../pages/voucher/ListVoucher";
import CreateCoupon from "../pages/voucher/AddVoucher";
import EditCoupon from "../pages/voucher/EditVoucher";

 // import middleware này

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute allowedRoles={["admin", "staff"]}>
        <Dashbroad />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <Content />,
        children: [
          {
            path: "",
            element: <Navigate to="phantich" replace />,
          },
          // Category
          {
            path: "category",
            element: <ListCategory />,
          },
            {
            path: "phantich",
            element: <Dashboard />,
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
            path: "category/deleted",
            element: <DeletedCategoryList />,
          },
          // ProductGroup (Capacity)
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
            path: "capacity/deleted",
            element: <DeletedProductGroupList />,
          },

          // Product
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
          {
  path: "product/deleted",
  element: <DeletedProductList />,
},


          // User
          {
            path: "users",
            element: <ListUser />,
          },
          {
            path:"orders",
            element:<AdminOrderList />
          },
          // Banner
          {
            path: "banners",
            element: <BannerList />,
          },
          {
            path :"vouchers",
            element :<ListCoupon/>
          },
           {
            path :"vouchers/add",
            element :<CreateCoupon/>
          },
           {
            path :"vouchers/:id",
            element :<EditCoupon/>
          },

        ],
      },
    ],
  },
]);
