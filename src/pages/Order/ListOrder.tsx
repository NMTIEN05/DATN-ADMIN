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
  Descriptions,
} from "antd";
import axiosInstance from "../../utils/axiosInstance";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Text } = Typography;

const STATUS_FLOW: Record<string, string[]> = {
  pending: ["processing", "cancelled"],
  processing: ["ready_to_ship", "cancelled"],
  ready_to_ship: ["shipped", "cancelled"],
  shipped: ["delivered", "return_requested"],
  delivered: ["return_requested"],
  return_requested: ["returned", "cancelled"],
  returned: [],
  cancelled: [],
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xác nhận",
  processing: "Đang xử lý",
  ready_to_ship: "Chờ giao hàng",
  shipped: "Đang giao",
  delivered: "Đã giao",
  return_requested: "Yêu cầu trả hàng",
  returned: "Đã hoàn trả",
  cancelled: "Đã huỷ",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "gold",
  processing: "blue",
  ready_to_ship: "cyan",
  shipped: "purple",
  delivered: "green",
  return_requested: "orange",
  returned: "volcano",
  cancelled: "red",
};

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

interface ShippingInfo {
  fullName: string;
  phone: string;
  address: string;
  ward?: string;
  district?: string;
  province?: string;
}

interface Order {
  _id: string;
  userId: User;
  items: OrderItem[];
  totalAmount: number;
  shippingInfo: ShippingInfo;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
}

const AdminOrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/orders?limit=9999");
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
    form.setFieldsValue({ status: order.status });
    setIsModalVisible(true);
  };

  const handleUpdateOrder = async () => {
    try {
      const values = await form.validateFields();
      await axiosInstance.put(`/orders/${editingOrder?._id}/status`, values);
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
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      render: (amount: number) => (
        <Text strong>{amount.toLocaleString()}₫</Text>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentMethod",
      render: (method: string) => <Tag color="blue">{method}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (_: any, record: Order) => {
        const color = STATUS_COLORS[record.status] || "default";
        const text = STATUS_LABELS[record.status] || record.status;
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
  title: "Thanh toán",
  dataIndex: "paymentStatus",
  render: (status: string) => {
    let color = "default";
    let text = "Không xác định";

    if (status === "paid") {
      color = "green";
      text = "Đã thanh toán";
    } else if (status === "unpaid") {
      color = "red";
      text = "Chưa thanh toán";
    } else if (status === "failed") {
      color = "orange";
      text = "Thanh toán thất bại";
    }

    return <Tag color={color}>{text}</Tag>;
  },
},

    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: Order) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedOrder(record);
              setIsViewModalVisible(true);
            }}
          >
            Xem
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditClick(record)}
            disabled={STATUS_FLOW[record.status]?.length === 0}
          >
            Sửa
          </Button>
        </Space>
      ),
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

      {/* Modal cập nhật */}
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
            rules={[{ required: true, message: "Vui lòng chọn trạng thái mới" }]}
          >
            <Select>
              {Object.keys(STATUS_LABELS).map((status) => (
                <Option
                  key={status}
                  value={status}
                  disabled={
                    editingOrder &&
                    !STATUS_FLOW[editingOrder.status]?.includes(status)
                  }
                >
                  {STATUS_LABELS[status]}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xem chi tiết */}
      <Modal
        title="Chi tiết đơn hàng"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Mã đơn">
              {selectedOrder._id}
            </Descriptions.Item>
      <Descriptions.Item label="Thông tin giao hàng">
  <>
    <div><strong>Họ tên:</strong> {selectedOrder.shippingInfo?.fullName}</div>
    <div><strong>SĐT:</strong> {selectedOrder.shippingInfo?.phone}</div>
    <div>
      <strong>Địa chỉ:</strong> {selectedOrder.shippingInfo?.address}, {selectedOrder.shippingInfo?.ward},{" "}
      {selectedOrder.shippingInfo?.district}, {selectedOrder.shippingInfo?.province}
    </div>
  </>
</Descriptions.Item>

            <Descriptions.Item label="Thanh toán">
              {selectedOrder.paymentMethod}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={STATUS_COLORS[selectedOrder.status]}>
                {STATUS_LABELS[selectedOrder.status]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {new Date(selectedOrder.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Sản phẩm">
              <Table
                dataSource={selectedOrder.items}
                rowKey="_id"
                pagination={false}
                size="small"
                bordered
              >
                <Table.Column
                  title="Ảnh"
                  dataIndex="variantId"
                  render={(variant: Variant | null) =>
                    variant?.imageUrl?.[0] ? (
                      <Image src={variant.imageUrl[0]} width={50} />
                    ) : (
                      <div style={{ width: 50, height: 50, background: "#eee" }}>
                        No image
                      </div>
                    )
                  }
                />
                <Table.Column
                  title="Tên"
                  dataIndex="variantId"
                  render={(variant: Variant | null) => variant?.name}
                />
                <Table.Column title="Số lượng" dataIndex="quantity" />
                <Table.Column
                  title="Đơn giá"
                  dataIndex="price"
                  render={(price: number) => `${price.toLocaleString()}₫`}
                />
                <Table.Column
                  title="Thành tiền"
                  render={(_, item: OrderItem) =>
                    `${(item.price * item.quantity).toLocaleString()}₫`
                  }
                />
              </Table>
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">
              <Text strong>{selectedOrder.totalAmount.toLocaleString()}₫</Text>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
};

export default AdminOrderList;
