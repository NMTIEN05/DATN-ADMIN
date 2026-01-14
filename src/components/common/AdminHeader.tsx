import React, { useEffect, useState } from "react";
import {
  Avatar,
  Typography,
  Dropdown,
  Menu,
  Space,
  Badge,
  Popover,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";


const { Text } = Typography;

const AdminHeader = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [returnRequestCount, setReturnRequestCount] = useState<number>(0);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menu = (
    <Menu style={{ minWidth: 100 }}>
      <Menu.Item key="logout" onClick={handleLogout} icon={<LogoutOutlined />}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

 useEffect(() => {
  const fetchReturnRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8888/api/orders?limit=100", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const orders = res.data.data || [];
      const count = orders.filter(
        (order: any) => order.status === "return_requested"
      ).length;
      setReturnRequestCount(count);
    } catch (err) {
      console.error("❌ Lỗi khi lấy đơn hàng yêu cầu trả:", err);
    }
  };

  fetchReturnRequests();
}, []);


  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        background: "#fff",
        padding: "6px 22px",
        borderRadius: 8,
        marginLeft: 10,
        fontSize: 12,
      }}
    >
      <Space size={16}>
        {/* 🔔 Thông báo */}
        <Popover
          placement="bottomRight"
          title="Thông báo"
          trigger="click"
          content={
            <div>
              {returnRequestCount > 0 ? (
                <p>📦 Có {returnRequestCount} yêu cầu trả hàng mới</p>
              ) : (
                <p>Không có thông báo mới</p>
              )}
            </div>
          }
        >
          <Badge count={returnRequestCount} size="small" offset={[2, 0]}>
            <BellOutlined style={{ fontSize: 18, cursor: "pointer" }} />
          </Badge>
        </Popover>

        {/* 👤 Dropdown user */}
        <Dropdown overlay={menu} trigger={["click"]}>
          <Space style={{ cursor: "pointer" }} size={8}>
            <Avatar size="small" icon={<UserOutlined />} />
            <div>
              <Text strong style={{ fontSize: 12 }}>
                {user.username || "Admin"}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 10 }}>
                {user.role?.toUpperCase() || "ROLE"}
              </Text>
            </div>
          </Space>
        </Dropdown>
      </Space>
    </div>
  );
};

export default AdminHeader;
