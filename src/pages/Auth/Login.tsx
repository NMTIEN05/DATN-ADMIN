import React from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const Login = () => {
    const nav = useNavigate()
  const onFinish = async (values: any) => {
    try {
      const res = await axios.post("http://localhost:8888/api/auth/login", values);
      const { token, user } = res.data;

      if (!token || !user) {
        message.error("Dữ liệu đăng nhập không hợp lệ từ server.");
        return;
      }
      // Kiểm tra quyền
      if (!["admin", "staff"].includes(user.role)) {
        message.error("Bạn không có quyền truy cập trang quản trị.");
        return;
      }
      // Lưu vào localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Thông báo
      message.success(`Chào mừng ${user.username} (${user.role})!`);
      nav("/dashboard")
    } catch (err: any) {
      console.error("Lỗi khi đăng nhập:", err);
      if (err.response?.data?.message) {
        message.error(err.response.data.message);
      } else {
        message.error("Lỗi kết nối đến máy chủ!");
      }
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 100 }}>
      <Card title={<Title level={3}>Đăng nhập</Title>} style={{ width: 400 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Vui lòng nhập email" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
