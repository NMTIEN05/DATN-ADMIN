import React from "react";
import { Form, Input, Select, Button, Card, Typography, Row, Col } from "antd";
import {
  UserAddOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Option } = Select;
const { Title, Text } = Typography;

const CreateUser: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      const { isActive, confirm_password, ...payload } = values;
      if (/@/.test(payload.username)) {
        form.setFields([
          {
            name: "username",
            errors: ["Tên đăng nhập không được là email hoặc chứa ký tự @"],
          },
        ]);
        return;
      }

      await axios.post("http://localhost:8888/api/auth/register", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      form.resetFields();
      navigate("/dashboard/users");
    } catch (err: any) {
      form.setFields([
        {
          name: "username",
          errors: [err?.response?.data?.message || "Lỗi tạo người dùng!"],
        },
      ]);
    }
  };

  return (
    <Row
      justify="center"
      align="middle"
      style={{
        minHeight: "100vh",
        background: "#f4f6fb",
      }}
    >
      <Col xs={24} sm={22} md={18} lg={14} xl={12}>
        <Card
          bordered={false}
          style={{
            margin: "40px auto",
            boxShadow: "0 8px 32px rgba(33,41,54,0.13)",
            borderRadius: 24,
            padding: 0,
            minHeight: 630,
          }}
        >
          <div style={{ textAlign: "center", margin: "30px 0 18px 0" }}>
            <UserAddOutlined style={{ fontSize: 44, color: "#5c6bc0" }} />
            <Title level={2} style={{ margin: "16px 0 0 0", color: "#364d79" }}>
              Tạo tài khoản người dùng
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              Admin tạo tài khoản mới và phân quyền tại đây
            </Text>
          </div>
          <Form
            form={form}
            layout="vertical"
            size="large"
            onFinish={onFinish}
            style={{
              padding: "0 42px 18px 42px",
              maxWidth: 900,
              margin: "0 auto",
            }}
            autoComplete="off"
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Tên đăng nhập"
                  name="username"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên đăng nhập!" },
                    {
                      pattern: /^[a-zA-Z0-9_]+$/,
                      message: "Chỉ chữ, số và dấu gạch dưới.",
                    },
                    {
                      validator: (_, value) =>
                        value && /@/.test(value)
                          ? Promise.reject("Không được nhập email vào đây!")
                          : Promise.resolve(),
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Ví dụ: hieuminh2566"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email!" },
                    { type: "email", message: "Email không hợp lệ!" },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="example@gmail.com"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại!" },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="Nhập số điện thoại"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Họ và tên"
                  name="full_name"
                  rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Nhập họ tên đầy đủ"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Mật khẩu"
                  name="password"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu!" },
                  ]}
                  hasFeedback
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="********"
                  />
                </Form.Item>
              </Col>

              {/* Xác nhận mật khẩu */}
              <Col xs={24} md={12}>
                <Form.Item
                  label="Xác nhận mật khẩu"
                  name="confirm_password"
                  dependencies={["password"]}
                  hasFeedback
                  rules={[
                    { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("Mật khẩu xác nhận không trùng khớp!")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Nhập lại mật khẩu"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Phân quyền"
                  name="role"
                  rules={[{ required: true, message: "Chọn quyền tài khoản!" }]}
                >
                  <Select
                    placeholder="Chọn quyền tài khoản"
                    suffixIcon={<SafetyOutlined />}
                    style={{ width: "100%" }}
                  >
                    <Option value="admin">Admin</Option>
                    <Option value="staff">Staff</Option>
                    <Option value="user">User</Option>
                    <Option value="shipper">Shipper</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginTop: 22 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                style={{
                  background: "linear-gradient(90deg,#5c6bc0 0,#42a5f5 100%)",
                  border: 0,
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 18,
                  height: 50,
                  boxShadow: "0 2px 12px rgba(64,108,255,0.13)",
                  marginTop: 4,
                  letterSpacing: 0.5,
                }}
                icon={<UserAddOutlined />}
              >
                Tạo mới
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default CreateUser;
