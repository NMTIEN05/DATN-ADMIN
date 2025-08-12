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
  shipped: ["delivered", "return_requested", "delivery_failed"],
  delivered: ["received", "return_requested"],
  received: ["return_requested"],

  return_requested: ["returned", "cancelled", "delivered", "rejected"],
  returned: [],
  delivery_failed: [],
  rejected: [],
  cancelled: [],
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xác nhận",
  processing: "Đang xử lý",
  ready_to_ship: "Chờ giao hàng",
  shipped: "Đang giao",
  delivered: "Đã giao",
  received: "Đã nhận hàng",
  delivery_failed: "Giao hàng thất bại",

  return_requested: "Yêu cầu trả hàng",
  returned: "Đã hoàn trả",
  rejected: "Từ chối hoàn trả",
  cancelled: "Đã huỷ",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "gold",
  processing: "blue",
  ready_to_ship: "cyan",
  shipped: "purple",
  delivered: "green",
  received: "lime",
  delivery_failed: "volcano",

  return_requested: "orange",
  returned: "volcano",
  rejected: "magenta",
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
  discount?: number | string;
  returnRequest?: {
    status?: string;
    reason?: string;
    requestedAt?: string;
  };
}

const AdminOrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [form] = Form.useForm();
  const rejectReason = Form.useWatch("rejectReason", form);

  const [selectedStatus, setSelectedStatus] = useState<string>();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/orders?limit=100");
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
    setSelectedStatus(order.status);
    setIsModalVisible(true);
  };

  const handleUpdateOrder = async () => {
    try {
      const values = await form.validateFields();
      const payload: any = { status: values.status };

      if (
        editingOrder?.status === "return_requested" &&
        ["delivered", "rejected"].includes(values.status)
      ) {
        if (!values.rejectReason || values.rejectReason.trim() === "") {
          message.error("Vui lòng chọn lý do từ chối hoàn trả");
          return;
        }

        if (values.rejectReason === "Lý do khác") {
          if (!values.customRejectReason || values.customRejectReason.trim() === "") {
            message.error("Vui lòng nhập lý do cụ thể");
            return;
          }
          payload.rejectReason = values.customRejectReason;
        } else {
          payload.rejectReason = values.rejectReason;
        }
      }

      await axiosInstance.put(`/orders/${editingOrder?._id}/status`, payload);
      message.success("Cập nhật thành công");
      fetchOrders();
      setIsModalVisible(false);
    } catch (err: any) {
      console.error("❌ Update lỗi:", err?.response?.data);
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
      render: (amount: number) => <Text strong>{amount.toLocaleString()}₫</Text>,
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
            disabled={
              STATUS_FLOW[record.status]?.length === 0 ||
              ["shipped", "delivered", "received", "delivery_failed"].includes(record.status)
            }
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <h2 className="text-3xl font-bold text-indigo-600 mb-5">Danh sách đơn hàng</h2>

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
            <Select
              onChange={(value) => {
                setSelectedStatus(value);
                if (value !== "delivered" && value !== "rejected") {
                  form.setFieldsValue({ rejectReason: undefined, customRejectReason: undefined });
                }
              }}
            >
              {Object.keys(STATUS_LABELS).map((status) => (
                <Option
                  key={status}
                  value={status}
                  disabled={
                    editingOrder && !STATUS_FLOW[editingOrder.status]?.includes(status)
                  }
                >
                  {STATUS_LABELS[status]}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Lý do từ chối khi từ return_requested -> delivered/rejected */}
          {editingOrder?.status === "return_requested" &&
            ["delivered", "rejected"].includes(selectedStatus || "") && (
              <>
                <Form.Item
                  name="rejectReason"
                  label="Lý do từ chối hoàn trả"
                  rules={[{ required: true, message: "Vui lòng chọn lý do từ chối" }]}
                >
                  <Select placeholder="Chọn lý do từ chối">
                    <Option value="Không đủ điều kiện trả hàng">Không đủ điều kiện trả hàng</Option>
                    <Option value="Sản phẩm không lỗi">Sản phẩm không lỗi</Option>
                    <Option value="Lý do khác">Lý do khác</Option>
                  </Select>
                </Form.Item>

                {rejectReason === "Lý do khác" && (
                  <Form.Item
                    name="customRejectReason"
                    label="Nhập lý do cụ thể"
                    rules={[{ required: true, message: "Vui lòng nhập lý do cụ thể" }]}
                  >
                    <textarea
                      className="w-full p-2 border rounded"
                      rows={3}
                      placeholder="Nhập lý do từ chối hoàn trả..."
                    />
                  </Form.Item>
                )}
              </>
            )}
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
                  <strong>Địa chỉ:</strong>{" "}
                  {[
                    selectedOrder.shippingInfo?.address,
                    selectedOrder.shippingInfo?.ward,
                    selectedOrder.shippingInfo?.district,
                    selectedOrder.shippingInfo?.province,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              </>
            </Descriptions.Item>

            <Descriptions.Item label="Trạng thái">
              <Tag color={STATUS_COLORS[selectedOrder.status]}>
                {STATUS_LABELS[selectedOrder.status]}
              </Tag>
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
                  render={(variant: Variant) =>
                    variant?.imageUrl?.[0] ? (
                      <Image src={variant.imageUrl[0]} width={50} />
                    ) : (
                      <div style={{ width: 50, height: 50, background: "#eee" }}>Không có</div>
                    )
                  }
                />
                <Table.Column
                  title="Tên"
                  dataIndex="variantId"
                  render={(variant: Variant) => variant?.name}
                />
                <Table.Column title="Số lượng" dataIndex="quantity" />
                <Table.Column
                  title="Đơn giá"
                  dataIndex="price"
                  render={(price: number) => `${price?.toLocaleString?.() || 0}₫`}
                />
                {/* ❌ ĐÃ BỎ cột "Thành tiền" */}
              </Table>

              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span><strong>Tạm tính:</strong></span>
                  <span>
                    {Number(
                      selectedOrder.items?.reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                      ) || 0
                    ).toLocaleString()}₫
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", color: "red" }}>
                  <span><strong>Giảm giá:</strong></span>
                  <span>-{Number(selectedOrder.discount || 0).toLocaleString()}₫</span>
                </div>

                {/* ✅ Dấu gạch ngăn cách trước "Tổng tiền" */}
                <hr style={{ margin: "12px 0", border: 0, borderTop: "1px solid #eee" }} />

                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
                  <span><strong>Tổng tiền:</strong></span>
                  <span>{Number(selectedOrder.totalAmount || 0).toLocaleString()}₫</span>
                </div>
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
};

export default AdminOrderList;
