import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  message,
  Popconfirm,
  Modal,
  Form,
  Select,
  Switch,
  Typography,
} from "antd";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const { Option } = Select;
const { Text } = Typography;

interface User {
  _id: string;
  isVerified: boolean;
  username: string;
  email: string;
  phone: string;
  full_name: string;
  address: string;
  role: string;
  isActive: boolean;
}

const ListUser: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [lockReason, setLockReason] = useState("");

  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = currentUser.role === "admin";

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8888/api/auth", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: { limit: 1000 },
      });
      setUsers(res.data.data);
    } catch (error) {
      message.error("Lỗi khi lấy danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await axios.delete(`http://localhost:8888/api/auth/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Xoá người dùng thành công");
      fetchUsers();
    } catch (error) {
      message.error("Xoá người dùng thất bại");
    }
  };

  const handleUpdateUser = async () => {
    try {
      const values = await form.validateFields();
      await axios.put(
        `http://localhost:8888/api/auth/${editingUser?._id}`,
        values,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Cập nhật người dùng thành công");
      setIsModalVisible(false);
      fetchUsers();
    } catch (error:any) {
      toast.error( error.response?.data?.message || "Cập nhật người dùng thất bại");
    }
  };
  const handleLockUnlockUser = async (userId: string, isActive: boolean, reason = "") => {
  try {
    await axios.put(
      `http://localhost:8888/api/auth/${userId}`,
      { isActive, lockReason: reason },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    toast.success(isActive ? "Mở khóa thành công" : "Khóa tài khoản thành công");
    fetchUsers();
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Cập nhật thất bại");
  }
};

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const columns = [
    {
      title: "STT",
      key: "index",
      render: (_: any, __: User, index: number) => index + 1,
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Họ và tên",
      dataIndex: "full_name",
      key: "full_name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Xác thực Email",
      dataIndex: "isVerified",
      key: "isVerified",
      render: (verified: boolean) => (
        <Tag color={verified ? "green" : "red"}>
          {verified ? "Đã xác thực" : "Chưa xác thực"}
        </Tag>
      ),
    },
    {
      title: "Phân quyền",
      dataIndex: "role",
      key: "role",
      render: (role: string) => {
        let color = "blue";
        if (role === "admin") color = "red";
        else if (role === "staff") color = "orange";
        else if (role === "user") color = "green";
        else if (role === "shipper") color = "blue";

        return (
          <Tag color={color} style={{ fontWeight: "bold", textTransform: "uppercase" }}>
            {role}
          </Tag>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (active: boolean) => (
        <Tag color={active ? "green" : "volcano"}>
          {active ? "Hoạt động" : "Khóa"}
        </Tag>
      ),
    },
{
  title: "Thao tác",
  key: "action",
  render: (_: any, record: User) => (
    <Space size="middle">
      <Button
        type="link"
        onClick={() => navigate(`/dashboard/users/${record._id}`)}
      >
        Chi tiết
      </Button>

      {isAdmin && (
        <>
          {/* Sửa */}
          <Button
            type="link"
            onClick={() => {
              setEditingUser(record);
              form.setFieldsValue({
                role: record.role,
                isActive: record.isActive,
              });
              setIsModalVisible(true);
            }}
          >
            Sửa
          </Button>

          {/* Khóa / Mở khóa */}
          {record.role !== "admin" && (
            record.isActive ? (
              <Button
                type="link"
                danger
                onClick={() => {
                  Modal.confirm({
                    title: "Nhập lý do khóa tài khoản",
                    content: (
                      <textarea
                        style={{ width: "100%", minHeight: "80px" }}
                        placeholder="Nhập lý do..."
                        onChange={(e) => setLockReason(e.target.value)}
                      />
                    ),
                    okText: "Xác nhận",
                    cancelText: "Hủy",
                    onOk: () => {
                      onOk: () => {
  if (!lockReason.trim()) {
    message.error("Vui lòng nhập lý do");
    throw new Error("Missing lock reason"); // hoặc return Promise.reject(new Error("..."))
  }
  return handleLockUnlockUser(record._id, false, lockReason);
}

                      return handleLockUnlockUser(record._id, false, lockReason);
                    },
                  });
                }}
              >
                Khóa
              </Button>
            ) : (
              <Button
                type="link"
                onClick={() => handleLockUnlockUser(record._id, true, "")}
              >
                Mở khóa
              </Button>
            )
          )}

          {/* Xóa */}
          {record.role !== "admin" && (
            <Popconfirm
              title="Bạn có chắc chắn muốn xoá người dùng này không?"
              okText="Xoá"
              cancelText="Hủy"
              onConfirm={() => handleDeleteUser(record._id)}
            >
              <Button type="link" danger>
                Xoá
              </Button>
            </Popconfirm>
          )}
        </>
      )}
    </Space>
  )
}


  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-indigo-600 mb-5">
        Danh sách người dùng
      </h2>
      <Button
        type="primary"
        onClick={() => navigate("/dashboard/users/create")}
        style={{ marginBottom: 16 }}
      >
        + Tạo người dùng
      </Button>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 8 }}
      />

      <Modal
        title="Sửa thông tin người dùng"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleUpdateUser}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="role"
            label="Phân quyền"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="admin">Admin</Option>
              <Option value="staff">Staff</Option>
              <Option value="user">User</Option>
              
              <Option value="shipper">Shipper</Option>

            </Select>
          </Form.Item>
          <Form.Item
            name="isActive"
            label="Trạng thái"
            valuePropName="checked"
          >
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Khóa" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ListUser;
