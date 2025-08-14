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
// import { title } from "process";

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
  discount:string;
   returnRequest?: {
    status?: string;
    reason?: string;
    requestedAt?: string;
    
  }; // ✅ sửa đúng ở đây

}

const AdminOrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [shippers, setShippers] = useState<{ _id: string; full_name: string }[]>([]);
const [selectedShipperId, setSelectedShipperId] = useState<string | undefined>(undefined)
const rejectReason = Form.useWatch("rejectReason", form);


const [selectedStatus, setSelectedStatus] = useState<string>();
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/orders?limit=100");
      console.log("🔎 First Order:", res.data.data?.[0]);
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
    const res = await axiosInstance.get("http://localhost:8888/api/auth/shipper");
    console.log("🔎 Shippers:", res.data);
    if (res.data.success && Array.isArray(res.data.data)) {
      setShippers(res.data.data);
    } else {
      message.error("Dữ liệu shipper không hợp lệ");
    }
  } catch (err) {
    message.error("Lỗi khi tải danh sách shipper");
  }
};


const handleEditClick = (order: Order) => {
  setEditingOrder(order);
  form.setFieldsValue({ status: order.status });

  // Nếu trạng thái đơn là ready_to_ship thì lấy shipper hiện tại (nếu có)
  if (order.status === "ready_to_ship") {
    setSelectedShipperId(order.shipperId || undefined);
    fetchShippers();
  } else {
    setSelectedShipperId(undefined);
  }

  setSelectedStatus(order.status);
  setIsModalVisible(true);
};
  useEffect(() => {
    fetchOrders();
  }, []);

 

const handleUpdateOrder = async () => {
  try {
    const values = await form.validateFields();

    // Kiểm tra trạng thái mới khác trạng thái hiện tại không
    if (values.status === editingOrder?.status) {
      message.warning("Đã chọn shipper thành công");
      return; // dừng xử lý nếu trạng thái không đổi
    }

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

    // Nếu trạng thái mới là "ready_to_ship", bắt buộc chọn shipper
    if (values.status === "ready_to_ship") {
      if (!selectedShipperId) {
        message.error("Vui lòng chọn shipper để giao hàng");
        return;
      }
      payload.shipperId = selectedShipperId;
    }

    await axiosInstance.put(`/orders/${editingOrder?._id}/status`, payload);
    message.success("Cập nhật thành công");
    fetchOrders();
    setIsModalVisible(false);
  } catch (err: any) {
    console.error("❌ Update lỗi:", err.response?.data);
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
      title :"Shipper",
      dataIndex: "shipperId",
      render: (shipper: User) => (
        <div>
          {shipper ? (
            <>
              <div>{shipper.full_name || shipper.email || shipper.username}</div>
              <div>{shipper.phone}</div>
            </>
          ) : (
            "Chưa có shipper"
          )}
        </div>
      ),
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
     <Select
  onChange={(value) => {
    setSelectedStatus(value); // ✅ cập nhật trạng thái chọn
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
              !STATUS_FLOW[editingOrder.status]?.includes(status)
            }
          >
            {STATUS_LABELS[status]}
          </Option>
        ))}
      </Select>
    </Form.Item>
<Form.Item
  label="Chọn Shipper"
  name="shipperId"
  rules={[
    { 
      required: selectedStatus === "ready_to_ship", 
      message: "Vui lòng chọn shipper để giao hàng" 
    }
  ]}
  hidden={selectedStatus !== "ready_to_ship"}
>
  <Select
    placeholder="Chọn shipper giao hàng"
    onChange={(value) => setSelectedShipperId(value)}
    value={selectedShipperId}
  >
    {shippers.map((shipper) => (
      <Option key={shipper._id} value={shipper._id}>
        {shipper.full_name || shipper.email || shipper.username}
      </Option>
    ))}
  </Select>
</Form.Item>


    {/* Hiện lý do từ chối nếu đang từ "return_requested" -> "delivered" */}
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


      <Descriptions.Item label="Trạng thái">
        <Tag color={STATUS_COLORS[selectedOrder.status]}>
          {STATUS_LABELS[selectedOrder.status]}
        </Tag>
      </Descriptions.Item>
      {/* Nếu đơn hàng có yêu cầu trả hàng */}
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
            render={(variant) =>
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
            render={(variant) => variant?.name}
          />
          <Table.Column title="Số lượng" dataIndex="quantity" />
          <Table.Column
            title="Đơn giá"
            dataIndex="price"
            render={(price) => `${price?.toLocaleString?.() || 0}₫`}
          />
          <Table.Column
            title="Thành tiền"
            render={(_, item) =>
              `${(item.price * item.quantity).toLocaleString()}₫`
            }
          />
        </Table>

        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span><strong>Tạm tính:</strong></span>
            <span>
              {Number(
                selectedOrder.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0
              ).toLocaleString()}₫
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", color: "red" }}>
            <span><strong>Giảm giá:</strong></span>
            <span>-{Number(selectedOrder.discount || 0).toLocaleString()}₫</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span><strong>Thành tiền (đã giảm):</strong></span>
            <span>{Number(selectedOrder.totalAmount || 0).toLocaleString()}₫</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
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
