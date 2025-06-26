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
} from "antd";
import axios from "axios";
import { toast } from "react-toastify";

const { Option } = Select;

interface User {
  _id: string;
  username: string;
  email: string;
  phone: string;
  full_name: string;
  address: string;
  role: string;
  isActive: boolean;
}

const ListUser = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = currentUser.role === "admin";

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8888/api/auth", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách user:", error);
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
      console.error("Lỗi khi xoá:", error);
      message.error("Xoá người dùng thất bại");
    }
  };

  const handleUpdateUser = async () => {
    try {
      const values = await form.validateFields();
        console.log("Đang cập nhật user với ID:", editingUser?._id);
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
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      toast.error("Cập nhật thất bại");
    }
  };

  useEffect(() => {
    fetchUsers();
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
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      render: (text: string) => text || <i>Chưa cập nhật</i>,
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
        return (
          <Tag
            color={color}
            style={{ fontWeight: "bold", textTransform: "uppercase" }}
          >
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
      render: (_: any, record: User) =>
        isAdmin ? (
          <Space size="middle">
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
          </Space>
        ) : (
          <i>Không có quyền</i>
        ),
    },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-indigo-600 mb-5">
        Danh sách người dùng
      </h2>
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
          <Form.Item name="role" label="Phân quyền" rules={[{ required: true }]}>
            <Select>
              <Option value="admin">Admin</Option>
              <Option value="staff">Staff</Option>
              <Option value="user">User</Option>
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
