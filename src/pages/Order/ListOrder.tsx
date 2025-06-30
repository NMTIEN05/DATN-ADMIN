import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  message,
  Modal,
  Form,
  Select,
  Typography,
  Image,
} from "antd";
import axiosInstance from "../../utils/axiosInstance";

const { Option } = Select;
const { Text } = Typography;

interface Variant {
  _id: string;
  name: string;
  imageUrl: string[];
  price: number;
}

interface OrderItem {
  _id: string;
  variantId: Variant | null;
  quantity: number;
  price: number;
}

interface User {
  _id: string;
  full_name?: string;
  email?: string;
}

interface Order {
  _id: string;
  userId: User;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

const AdminOrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/orders");
      if (Array.isArray(res.data.data)) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleEditClick = (order: Order) => {
    setEditingOrder(order);
    form.setFieldsValue({
      status: order.status,
      paymentMethod: order.paymentMethod,
    });
    setIsModalVisible(true);
  };

  const handleUpdateOrder = async () => {
    try {
      const values = await form.validateFields();
      const res = await axiosInstance.put(
        `/orders/${editingOrder?._id}/status`,
        values
      );
      message.success("Cập nhật thành công");
      fetchOrders();
      setIsModalVisible(false);
    } catch (err) {
      console.error(err);
      message.error("Cập nhật thất bại");
    }
  };

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "_id",
      render: (id: string) => <Text strong>{id.slice(-6).toUpperCase()}</Text>,
    },
    {
      title: "Khách hàng",
      dataIndex: "userId",
      render: (user: User) => (
        <>
          <div>{user?.full_name ?? "Chưa có tên"}</div>
          <div>{user?.email ?? "Chưa có email"}</div>
        </>
      ),
    },
    {
      title: "Sản phẩm",
      dataIndex: "items",
      render: (items: OrderItem[]) => (
        <>
          {items.map((item) => {
            const variant = item.variantId;
            const image = variant?.imageUrl?.[0];
            return (
              <div
                key={item._id}
                style={{ display: "flex", gap: 8, marginBottom: 8 }}
              >
                {image ? (
                  <Image width={40} src={image} />
                ) : (
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: "#eee",
                      textAlign: "center",
                    }}
                  >
                    No image
                  </div>
                )}
                <div>
                  <div>{variant?.name || "Không rõ tên sản phẩm"}</div>
                  <small>Số lượng: {item.quantity}</small>
                </div>
              </div>
            );
          })}
        </>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      render: (amount: number) => (
        <Text strong>{amount.toLocaleString()}₫</Text>
      ),
    },
    {
      title: "Địa chỉ",
      dataIndex: "shippingAddress",
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentMethod",
      render: (method: string) => <Tag color="blue">{method}</Tag>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (_: any, record: Order) => {
        let color = "default";
        let text = record.status;

        switch (record.status) {
          case "pending":
            color = "gold";
            text = "Chờ xử lý";
            break;
          case "processing":
            color = "blue";
            text = "Đang giao";
            break;
          case "completed":
            color = "green";
            text = "Hoàn tất";
            break;
          case "cancelled":
            color = "red";
            text = "Đã huỷ";
            break;
        }

        return (
          <Space>
            <Tag color={color}>{text}</Tag>
            <Button onClick={() => handleEditClick(record)} type="link">
              Sửa
            </Button>
          </Space>
        );
      },
    },
    
  ];

  return (
    <>
      <h2 className="text-3xl font-bold text-indigo-600 mb-5">
        Danh sách đơn hàng
      </h2>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={orders}
        loading={loading}
        pagination={{ pageSize: 6 }}
      />

      <Modal
        title="Cập nhật đơn hàng"
        open={isModalVisible}
        onOk={handleUpdateOrder}
        onCancel={() => setIsModalVisible(false)}
        okText="Lưu"
        cancelText="Huỷ"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="pending">Chờ xử lý</Option>
              <Option value="processing">Đang giao</Option>
              <Option value="completed">Hoàn tất</Option>
              <Option value="cancelled">Đã huỷ</Option>
            </Select>
          </Form.Item>
          
        </Form>
      </Modal>
    </>
  );
};

export default AdminOrderList;
