import React from "react";
import { Avatar, Typography, Dropdown, Menu, Space, Switch, Tooltip } from "antd";
import { UserOutlined, LogoutOutlined, BulbOutlined, BulbFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";



const { Text } = Typography;

const AdminHeader = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");


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

  return (
    <div
      style={{
         position: "absolute",
        top: 16,
        right: 16,
        background: "#fff",
        padding: "6px 22px",
        borderRadius: 8,
        marginLeft:10,
        fontSize: 12,
      }}
    >
    

      {/* Dropdown user */}
      <Dropdown overlay={menu} trigger={["click"]}>
        <Space style={{ cursor: "pointer" }} size={8}>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <Text strong style={{ fontSize: 12 }}>{user.username || "Admin"}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 10 }}>
              {user.role?.toUpperCase() || "ROLE"}
            </Text>
          </div>
        </Space>
      </Dropdown>
    </div>
  );
};

export default AdminHeader;
