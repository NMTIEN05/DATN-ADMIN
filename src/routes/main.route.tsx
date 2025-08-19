import { createBrowserRouter, Navigate } from "react-router-dom";
import Dashbroad from "../components/common/Dashbroad";
import Content from "../components/layouts/MainLayout";

import ListCategory from "../pages/Category/ListCategory";
import CreateCategory from "../pages/Category/CreateCategory";
import UpdateCategory from "../pages/Category/UpdateCategory";

import CreateProduct from "../pages/Product/CreateProduct";
import ProductList from "../pages/Product/ListProduct";


import CreateProductGroup from "../pages/Capacity/CreateProductGroup";
import ListProductGroup from "../pages/Capacity/ListProductGroup";
import EditProductGroup from "../pages/Capacity/EditProductGroup";

import ListUser from "../pages/User/ListUser";
import Login from "../pages/Auth/Login";
import Unauthorized from "../pages/Auth/Unauthorized";
import ProtectedRoute from "../pages/Auth/ProtectedRoute";
import AdminOrderList from "../pages/Order/ListOrder";
import DeletedCategoryList from "../pages/Category/DeletedCategoryList";
import DeletedProductGroupList from "../pages/Capacity/DeletedProductGroupList";
import Dashboard from "../pages/Dash/PT";
import BannerList from "../pages/banner/bannerList";
import CreateUser from "../pages/User/CreateUser";



import FlashSaleList from "../pages/Flashsale/FlashSaleList";
import CreateFlashSale from "../pages/Flashsale/CreateFlashSale";
import EditFlashSale from "../pages/Flashsale/EditFlashSale";

import ShipperOrderList from "../pages/shipper/ListOrderbyShip";
import ListVoucher from "../pages/voucher/ListVoucher";
import CreateCoupon from "../pages/voucher/AddVoucher";
import EditCoupon from "../pages/voucher/EditVoucher";
import EditProduct from "../pages/Order/Product/EditProduct";
import DeletedProductList from "../pages/Order/Product/components/DeletedProductList";
import ShipperDashboard from "../pages/shipper/Dashboard";
import ShipperStats from "../pages/shipper/ShipperStats";
import UserDetail from "../pages/shipper/DetailUser";





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
  path: "/shipper/orders",
  element: (
    <ProtectedRoute allowedRoles={["shipper"]}>
      <ShipperOrderList />
    </ProtectedRoute>
  ),
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
        // FlashSale
        {
          path: "flashsale",
          element: <FlashSaleList />,
        },
        {
          path: "flashsale/create",
          element: <CreateFlashSale />,
        },
        {
          path: "flashsale/edit/:id",
          element: <EditFlashSale />,
        },
        {
            path:"vouchers",
            element:<ListVoucher />
        },
        {
          path: "vouchers/add",
          element: <CreateCoupon />,
        },
        {
          path: "vouchers/:id",
          element: <EditCoupon />,
        },
       


          // User
          {
            path: "users",
            element: <ListUser />,
          },
          {
  path: "users/create",
  element: <CreateUser />,
},
{
  path: "users/:id",
  element: <UserDetail />,
},


          {
            path:"orders",
            element:<AdminOrderList />
          },
          // Banner
          {
            path: "banners",
            element: <BannerList />,
          }
        ],
      },
    ],
  },
 {
  path: "/shipper/orders",
  element: (
    <ProtectedRoute allowedRoles={["shipper"]}>
      <ShipperDashboard />
    </ProtectedRoute>
  ),
children: [
  { path: "", element: <Navigate to="orders" replace /> },
  { path: "orders", element: <ShipperOrderList /> },
  { 
    path: "thongke", 
    element: <ShipperStats  /> 
  },
],

}

]);
