import React, { useEffect, useState } from "react";
import {
  Card,
  Descriptions,
  Button,
  Tag,
  Spin,
  message,
  Row,
  Col,
  Avatar,
  Typography,
  Space,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:8888/api/auth/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        // DEBUG LOG:
        console.log("API trả về:", res.data);
        if (res.data && res.data.data) setUser(res.data.data);
        else setUser(res.data);
      } catch (err) {
        message.error("Không tìm thấy người dùng!");
        navigate("/dashboard/users");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, navigate]);

  if (loading)
    return (
      <div style={{ minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spin size="large" />
      </div>
    );
  if (!user) return null;

  // Optional: tạo avatar từ tên
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase();
  };

  // Chọn màu cho role
  const roleColor =
    user.role === "admin"
      ? "red"
      : user.role === "staff"
      ? "orange"
      : "green";

  return (
    <div>
      <Button
        onClick={() => navigate("/dashboard/users")}
        style={{ marginBottom: 24, borderRadius: 6 }}
        size="large"
      >
        ← Quay lại danh sách
      </Button>
      <Card
        bordered
        style={{
          maxWidth: 750,
          margin: "0 auto",
          borderRadius: 20,
          boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
        }}
        bodyStyle={{ padding: 32 }}
      >
        <Row gutter={[32, 16]} align="middle">
          <Col xs={24} md={8} style={{ textAlign: "center" }}>
            <Avatar
              size={110}
              style={{
                backgroundColor: "#4f46e5",
                fontSize: 38,
                marginBottom: 16,
              }}
              icon={<UserOutlined />}
            >
              {getInitials(user.full_name)}
            </Avatar>
            <Title level={4} style={{ marginBottom: 8 }}>
              {user.full_name}
            </Title>
            <Tag
              color={roleColor}
              style={{
                fontWeight: 600,
                fontSize: 15,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
              icon={<IdcardOutlined />}
            >
              {user.role}
            </Tag>
            <br />
            <Tag
              color={user.isActive ? "green" : "volcano"}
              style={{ fontWeight: 500, marginTop: 8, fontSize: 14 }}
              icon={user.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            >
              {user.isActive ? "Hoạt động" : "Khóa"}
            </Tag>
          </Col>

          <Col xs={24} md={16}>
            <Descriptions
              column={1}
              bordered
              layout="vertical"
              contentStyle={{ fontSize: 16 }}
              labelStyle={{ fontWeight: 600 }}
              style={{ background: "white", borderRadius: 10 }}
              size="middle"
            >
              <Descriptions.Item label="Tên đăng nhập">
                <Space>
                  <UserOutlined />
                  {user.username}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <Space>
                  <MailOutlined />
                  {user.email}
                  <Tag color={user.isVerified ? "green" : "red"} style={{ marginLeft: 10 }}>
                    <SafetyCertificateOutlined />
                    {user.isVerified ? "Đã xác thực" : "Chưa xác thực"}
                  </Tag>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                <Space>
                  <PhoneOutlined />
                  {user.phone || <Text type="secondary">(Chưa cập nhật)</Text>}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                <Space>
                  <HomeOutlined />
                  {user.address || <Text type="secondary">(Chưa cập nhật)</Text>}
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default UserDetail;
