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
import { produce } from "immer"; // ✅ named export


import axios from "axios";
// import { title } from "process";

const { Option } = Select;
const { Text } = Typography;

const STATUS_FLOW: Record<string, string[]> = {
  pending: ["processing", "cancelled"],
  processing: ["ready_to_ship", "cancelled"],
  ready_to_ship: [ "cancelled"],
  shipped: ["delivered", "return_requested", "delivery_failed"],
  delivered: ["received", "return_requested"],
  received: ["return_requested"],

  return_requested: ["returned", "delivered", "rejected"],
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

interface Shipper {
  _id: string;
  full_name: string;
  phone: string;
  email?: string;
  username?: string;
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
  shipperId?: Shipper; // ✅ Bổ sung shipperId
  cancelReason?: string; // ✅ Bổ sung cancelReason
  rejectReason?: string; // ✅ Bổ sung rejectReason
  failReason?: string; // ✅ Bổ sung failReason
}

const AdminOrderList: React.FC = () => {
  const PAYMENT_STATUS_LABELS: Record<string, string> = {
  paid: "Đã thanh toán",
  unpaid: "Chưa thanh toán",
  failed: "Thanh toán thất bại",
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  paid: "green",
  unpaid: "red",
  failed: "orange",
};

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [shippers, setShippers] = useState<{ _id: string; full_name: string; phone: string; username?: string; email?: string }[]>([]);
  const [selectedShipperId, setSelectedShipperId] = useState<string | undefined>(undefined);
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

  const fetchShippers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8888/api/auth/shipper", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success && Array.isArray(res.data.data)) {
        console.log("🚚 Danh sách shipper:", res.data.data);
        setShippers(res.data.data);
      } else {
        console.warn("🚨 Response không đúng định dạng:", res.data);
        setShippers([]);
      }
    } catch (err: any) {
      console.error("❌ Lỗi khi tải danh sách shipper:", err.response?.data || err.message || err);
      message.error("Lỗi khi tải danh sách shipper");
    }
  };

const handleEditClick = (order: Order) => {
  setEditingOrder(order);
  form.setFieldsValue({ status: order.status, shipperId: order.shipperId?._id });
  setSelectedStatus(order.status); // Thiết lập selectedStatus ban đầu

  // ✅ CHỈ GỌI fetchShippers KHI CÓ THỂ CHỌN SHIPPER
  if (STATUS_FLOW[order.status]?.includes("ready_to_ship")) {
    fetchShippers();
  } else {
    setShippers([]); // Đảm bảo danh sách shipper rỗng nếu không cần
  }
  
  setIsModalVisible(true);
};

  useEffect(() => {
    fetchOrders();
  }, []);

 const handleUpdateOrder = async () => {
  try {
    if (!editingOrder?._id) {
      message.error("Không xác định đơn hàng để cập nhật");
      return;
    }

    const values = await form.validateFields();

    // Kiểm tra nếu status không thay đổi và không chọn shipper
    if (values.status === editingOrder.status && !values.shipperId) {
      message.warning("Trạng thái không thay đổi");
      return;
    }

    const payload: any = { status: values.status };

    // Xử lý lý do từ chối hoàn trả
    if (
      editingOrder.status === "return_requested" &&
      ["delivered", "rejected"].includes(values.status)
    ) {
      if (!values.rejectReason?.trim()) {
        message.error("Vui lòng chọn lý do từ chối hoàn trả");
        return;
      }
      payload.rejectReason =
        values.rejectReason === "Lý do khác"
          ? values.customRejectReason?.trim()
          : values.rejectReason;
      if (!payload.rejectReason) {
        message.error("Vui lòng nhập lý do cụ thể");
        return;
      }
    }

    // Xử lý shipper
    if (values.status === "ready_to_ship") {
      if (!values.shipperId) {
        message.error("Vui lòng chọn shipper để giao hàng");
        return;
      }
      payload.shipperId = values.shipperId;
    }

    const token = localStorage.getItem("token");

    // 1️⃣ Update trạng thái
    await axios.put(
      `http://localhost:8888/api/orders/${editingOrder._id}/status`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // 2️⃣ Lấy lại order đầy đủ sau khi update
    const { data: fullOrder } = await axios.get(
      `http://localhost:8888/api/orders/${editingOrder._id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // 3️⃣ Cập nhật state orders
    setOrders(prev => {
      const idx = prev.findIndex(o => o._id === fullOrder._id);
      if (idx === -1) return prev;
      const newOrders = [...prev];
      newOrders[idx] = fullOrder;
      return newOrders;
    });

    // 4️⃣ Cập nhật selectedOrder để modal hiển thị đầy đủ
    setSelectedOrder(fullOrder);

    message.success("Cập nhật thành công");

    // Đóng modal cập nhật
    setIsModalVisible(false);
  } catch (err: any) {
    console.error("❌ Update lỗi:", err.response?.data || err.message || err);
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
      title: "Phương Thức Thanh toán",
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
        const STATUS_MAP: Record<
          string,
          { color: string; text: string }
        > = {
          paid: { color: "green", text: "Đã thanh toán" },
          unpaid: { color: "red", text: "Chưa thanh toán" },
          failed: { color: "orange", text: "Thanh toán thất bại" },
        };

        const { color, text } = STATUS_MAP[status] || {
          color: "default",
          text: "Không xác định",
        };

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
      form.setFieldsValue({ rejectReason: undefined });
    }
  }}
>
  {Object.keys(STATUS_LABELS).map((status) => (
    <Option
      key={status}
      value={status}
      disabled={
        editingOrder &&
        (
          // trạng thái không có trong STATUS_FLOW
          !STATUS_FLOW[editingOrder.status]?.includes(status) ||
          // admin không được chuyển từ ready_to_ship sang shipped
          (localStorage.getItem("role") === "admin" &&
           editingOrder.status === "ready_to_ship" &&
           status === "shipped")
        )
      }
    >
      {STATUS_LABELS[status]}
    </Option>
  ))}
</Select>

          </Form.Item>
          <Form.Item
            name="shipperId"
            label="Chọn Shipper"
            rules={[
              { required: selectedStatus === "ready_to_ship", message: "Vui lòng chọn shipper" }
            ]}
            hidden={selectedStatus !== "ready_to_ship"}
          >
            <Select placeholder="Chọn shipper giao hàng">
              {shippers.map((shipper) => (
                <Option key={shipper._id} value={shipper._id}>
                  {shipper.full_name || shipper.email || shipper.username}
                  {" - "}
                  {shipper.phone}
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
            <Descriptions.Item label="Thông tin khách hàng">
              <>
                <div><strong>Tên:</strong> {selectedOrder.userId?.full_name || selectedOrder.userId?.email}</div>
                <div><strong>Email:</strong> {selectedOrder.userId?.email}</div>
              </>
            </Descriptions.Item>
            <Descriptions.Item label="Thông tin giao hàng">
              <>
                <div><strong>Họ tên:</strong> {selectedOrder.shippingInfo?.fullName}</div>
                <div><strong>SĐT:</strong> {selectedOrder.shippingInfo?.phone}</div>
                <div>
                  <strong>Địa chỉ:</strong>{" "}
                  {[selectedOrder.shippingInfo?.address, selectedOrder.shippingInfo?.ward, selectedOrder.shippingInfo?.district, selectedOrder.shippingInfo?.province]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              </>
            </Descriptions.Item>
            {selectedOrder.shipperId && (
              <Descriptions.Item label="Thông tin Shipper">
                <>
                  <div><strong>Họ tên:</strong> {selectedOrder.shipperId.full_name || selectedOrder.shipperId.username}</div>
                  <div><strong>SĐT:</strong> {selectedOrder.shipperId.phone}</div>
                </>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Phương thức Thanh toán">
  {selectedOrder.paymentMethod}
</Descriptions.Item>
<Descriptions.Item label="Trạng thái Thanh toán">
  <Tag color={PAYMENT_STATUS_COLORS[selectedOrder.paymentStatus]}>
    {PAYMENT_STATUS_LABELS[selectedOrder.paymentStatus] || selectedOrder.paymentStatus}
  </Tag>
</Descriptions.Item>

            <Descriptions.Item label="Trạng thái">
              <Tag color={STATUS_COLORS[selectedOrder.status]}>
                {STATUS_LABELS[selectedOrder.status]}
              </Tag>
            </Descriptions.Item>
            {selectedOrder.cancelReason && (
              <Descriptions.Item label="Lý do huỷ đơn">
                {selectedOrder.cancelReason}
              </Descriptions.Item>
            )}
            {selectedOrder.rejectReason && (
              <Descriptions.Item label="Lý do từ chối hoàn trả">
                {selectedOrder.rejectReason}
              </Descriptions.Item>
            )}
            {selectedOrder.status === "delivery_failed" && selectedOrder.failReason && (
    <Descriptions.Item label="Lý do giao hàng thất bại">
      {selectedOrder.failReason}
    </Descriptions.Item>
  )}
            {selectedOrder.returnRequest?.status && (
              <>
                <Descriptions.Item label="Trạng thái hoàn trả">
                  <Tag color={STATUS_COLORS[selectedOrder.returnRequest.status]}>
                    {STATUS_LABELS[selectedOrder.returnRequest.status]}
                  </Tag>
                </Descriptions.Item>
                {selectedOrder.returnRequest.reason && (
                  <Descriptions.Item label="Lý do hoàn trả">
                    {selectedOrder.returnRequest.reason}
                  </Descriptions.Item>
                )}
                {selectedOrder.returnRequest.requestedAt && (
                  <Descriptions.Item label="Ngày yêu cầu">
                    {new Date(selectedOrder.returnRequest.requestedAt).toLocaleString("vi-VN")}
                  </Descriptions.Item>
                )}
              </>
            )}
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