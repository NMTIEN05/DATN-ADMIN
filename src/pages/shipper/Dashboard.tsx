import React, { useState, useEffect } from "react";
import { Layout, Menu, message } from "antd";
import { BarChartOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import axios from "axios";

const { Header, Sider, Content } = Layout;

const ShipperDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const location = useLocation();
  const token = localStorage.getItem("token");
  const shipperId = localStorage.getItem("shipperId");

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:8888/api/orders/shipper", {
        params: { shipperId, limit: 99999 },
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders || []);
      console.log("🚀 Received orders:", res.data.orders || []);
    } catch (err: any) {
      console.error(err);
      message.error("Lấy đơn hàng thất bại!");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{ color: "#fff", textAlign: "center", padding: 16 }}>
          Shipper Dashboard
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname.includes("thongke") ? "thongke" : "orders"]}
        >
          <Menu.Item key="thongke" icon={<BarChartOutlined />}>
            <NavLink to="thongke">Thống kê</NavLink>
          </Menu.Item>
          <Menu.Item key="orders" icon={<ShoppingCartOutlined />}>
            <NavLink to="orders">Đơn hàng</NavLink>
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header style={{ background: "#fff", padding: 0 }} />
        <Content style={{ margin: 16 }}>
          {/* Truyền orders và fetchOrders qua Outlet context */}
          <Outlet context={{ orders, fetchOrders }} />
        </Content>
      </Layout>
    </Layout>
  );
};

export default ShipperDashboard;
