import React from "react";
import { Table, Tag, Space, Button } from "antd";

const UserList = () => {
  const columns = [
    {
      title: "STT",
      dataIndex: "1",
      key: "1",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Họ tên",
      dataIndex: "full_name",
      key: "full_name",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag color={role === "admin" ? "red" : "blue"}>{role.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: () => (
        <Space>
          <Button type="link">Sửa</Button>
          <Button type="link" danger>Xoá</Button>
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: "1",
      username: "nguyenvana",
      email: "a@gmail.com",
      full_name: "Nguyễn Văn A",
      phone: "0909123456",
      role: "admin",
    },
    {
      key: "2",
      username: "tranthib",
      email: "b@gmail.com",
      full_name: "Trần Thị B",
      phone: "0912345678",
      role: "client",
    },
  ];

  return (
    <div
  style={{
    
    padding: 24,
    background: "#fff",
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    minHeight: "100%",
  }}
>
  <h1
  style={{
    margin: 0,
    fontSize: 24,
    fontWeight: 600,
    borderBottom: '2px solid #f0f0f0',
    paddingBottom: 8,
    color: '#1890ff',
    marginBottom: 16
  }}
>
  Danh sách người dùng
</h1>

  <div style={{ marginBottom: 16 }}>
    <Button style={{marginRight:1100}} type="primary">Thêm người dùng</Button>
  </div>
  <Table columns={columns} dataSource={data} />
</div>

  );
};

export default UserList;
