import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Modal,
  message,
  Select,
  Typography,
  Form,
  Image,
  Descriptions,
} from "antd";
import axios from "axios";

interface OrderListProps {
  orders: any[]; // hoặc type chính xác của order
  onSelectStatus: (status: any) => void;
}
const { Option } = Select;
const { Text } = Typography;

const STATUS_LABELS = {
  ready_to_ship: "Chờ giao hàng",
  shipped: "Đang giao",
  delivered: "Đã giao",
  delivery_failed: "Giao thất bại",
  return_to_store: "Hoàn trả về cửa hàng",   // 👈 thêm
  returned_to_store: "Đã hoàn về cửa hàng", // 👈 thêm
};

const STATUS_COLORS = {
  ready_to_ship: "cyan",
  shipped: "purple",
  delivered: "green",
  delivery_failed: "volcano",
  return_to_store: "orange",    // 👈 thêm
  returned_to_store: "magenta", // 👈 thêm
};



const ShipperOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState<string>();

  const [loading, setLoading] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [form] = Form.useForm();

  const token = localStorage.getItem("token");

const fetchOrders = async () => {
  setLoading(true);
  try {
    const res = await axios.get("http://localhost:8888/api/orders/shipper", {
      params: {
        shipperId: localStorage.getItem("shipperId"), // Lấy từ localStorage
        limit: 99999,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const allOrders = res.data.orders || [];

    // 👉 Lọc ra đơn "ready_to_ship" + "shipped" (nếu bạn chỉ muốn 2 trạng thái này)
const filteredOrders = allOrders.filter(
  (order: any) =>
     [
      "ready_to_ship",
      "shipped",
      "delivered",
      "delivery_failed",
      "return_to_store",     // 👈 thêm
      "returned_to_store",   // 👈 thêm
    ].includes(order.status)
);
setOrders(filteredOrders);


    setOrders(filteredOrders);
  } catch (error) {
    console.error(error);
    message.error("Lỗi khi tải danh sách đơn hàng");
  } finally {
    setLoading(false);
  }
};



  useEffect(() => {
    fetchOrders();
  }, []);

  const handleEdit = (order) => {
    setEditingOrder(order);
    form.setFieldsValue({ status: order.status });
    setIsModalVisible(true);
  };

const handleUpdate = async () => {
  try {
    const values = await form.validateFields();

    // Chuẩn bị payload
    const payload: any = { status: values.status };

    if (values.status === "delivery_failed") {
      payload.failReason = values.failReason; // chỉ gửi khi giao thất bại
    }

    if (values.status === "return_to_store") {
      payload.returnReason = values.returnReason; // chỉ gửi khi hoàn trả
    }

    await axios.put(
      `http://localhost:8888/api/shipper/${editingOrder._id}/status`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    message.success("Cập nhật trạng thái thành công");
    fetchOrders();
    setIsModalVisible(false);
  } catch (error: any) {
    console.error("❌ Lỗi FE:", error.response?.data);
    message.error(error?.response?.data?.message || "Cập nhật trạng thái thất bại");
  }
};




  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "_id",
      render: (id) => <Text strong>{id.slice(-6).toUpperCase()}</Text>,
    },
    {
      title: "Khách hàng",
      dataIndex: "userId",
      render: (user) => {
        if (!user) return "Không có tài khoản";
        if (!user.full_name || user.full_name.trim() === "") return "Chưa có tên";
        return user.full_name;
      },
    },
    {
      title: "SĐT",
      dataIndex: "shippingInfo",
      render: (info) => info?.phone || "Không có số",
    },
    {
      title: "Địa chỉ",
      dataIndex: "shippingInfo",
      render: (info) => {
        if (!info) return "Không có địa chỉ";
        const parts = [info.address, info.ward, info.district, info.province].filter(Boolean);
        return parts.length > 0 ? parts.join(", ") : "Không có địa chỉ";
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => (
        <Tag color={STATUS_COLORS[status] || "default"}>
          {STATUS_LABELS[status] || status}
        </Tag>
      ),
    },
{
  title: "Tiền COD",
  render: (_, record) => 
    record.paymentMethod?.toLowerCase() === "cod"
      ? `${Number(record.totalAmount || 0).toLocaleString()}₫`
      : "0₫ (Đã thanh toán online)"
},


    {
      title: "Hành động",
      render: (_, order) => (
        <>
          <Button onClick={() => {
            setEditingOrder(order);
            setIsViewModalVisible(true);
          }} className="mr-2">
            Xem
          </Button>
          <Button onClick={() => handleEdit(order)}>Cập nhật</Button>
        </>
      ),
    },
  ];

  return (
    <>
      <h2 className="text-2xl font-semibold mb-4 text-blue-600">
        📦 Danh sách đơn hàng chờ giao
      </h2>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={orders}
        loading={loading}
        pagination={{ pageSize: 99999 }}
      />

     <Modal
  title="Cập nhật trạng thái đơn hàng"
  open={isModalVisible}
  onCancel={() => setIsModalVisible(false)}
  onOk={handleUpdate}
  okText="Lưu"
  cancelText="Huỷ"
>
  <Form form={form} layout="vertical">
    <Form.Item
      label="Trạng thái mới"
      name="status"
      rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
    >
  <Select
  placeholder="Chọn trạng thái"
  onChange={(value) => {
    setSelectedStatus(value);

    if (value !== "delivery_failed") {
      form.setFieldsValue({ failReason: undefined });
    }
    if (value !== "return_to_store") {
      form.setFieldsValue({ returnReason: undefined });
    }
  }}
>
  {editingOrder?.status === "ready_to_ship" && (
    <Option value="shipped">Đang giao</Option>
  )}

  {editingOrder?.status === "shipped" && (
    <>
      <Option value="delivered">Đã giao</Option>
      <Option value="delivery_failed">Giao thất bại</Option>
      <Option value="return_to_store">Hoàn trả về cửa hàng</Option>
    </>
  )}

  {editingOrder?.status === "delivery_failed" && (
    <Option value="return_to_store">Hoàn trả về cửa hàng</Option>
  )}

  {editingOrder?.status === "return_to_store" && (
    <Option value="returned_to_store">Đã hoàn về cửa hàng</Option>
  )}
</Select>


    </Form.Item>

    {/* ✅ Hiện ô nhập lý do nếu chọn Giao thất bại */}
    {selectedStatus === "delivery_failed" && (
      <Form.Item
        label="Lý do giao hàng không thành công"
        name="failReason"
        rules={[{ required: true, message: "Vui lòng nhập lý do" }]}
      >
        <textarea
          rows={3}
          placeholder="VD: Không liên lạc được, khách từ chối nhận, sai địa chỉ..."
          className="w-full p-2 border border-gray-300 rounded"
        />
      </Form.Item>
    )}
  </Form>
</Modal>


     <Modal
  title="Chi tiết đơn hàng"
  open={isViewModalVisible}
  onCancel={() => setIsViewModalVisible(false)}
  footer={null}
  width={800}
>
  {editingOrder && (
    <>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Mã đơn">
          {editingOrder._id}
        </Descriptions.Item>
        <Descriptions.Item label="Thông tin giao hàng">
          <>
            <div><strong>Họ tên:</strong> {editingOrder.shippingInfo?.fullName}</div>
            <div><strong>SĐT:</strong> {editingOrder.shippingInfo?.phone}</div>
            <div>
              <strong>Địa chỉ:</strong>{" "}
              {[editingOrder.shippingInfo?.address, editingOrder.shippingInfo?.ward, editingOrder.shippingInfo?.district, editingOrder.shippingInfo?.province]
                .filter(Boolean)
                .join(", ")}
            </div>
          </>
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={STATUS_COLORS[editingOrder.status]}>
            {STATUS_LABELS[editingOrder.status]}
          </Tag>
        </Descriptions.Item>

      

        {/* Lý do giao hàng thất bại */}
{/* Lý do giao hàng thất bại (hiển thị cho 3 trạng thái) */}
{["delivery_failed", "return_to_store", "returned_to_store"].includes(editingOrder.status) &&
  editingOrder.deliveryFailedReason && (
    <Descriptions.Item label="Lý do giao hàng không thành công">
      {editingOrder.deliveryFailedReason}
    </Descriptions.Item>
)}


      </Descriptions>

      <h3 className="mt-4 mb-2 text-lg font-semibold">🛒 Sản phẩm</h3>
      <Table
        dataSource={editingOrder.items}
        rowKey="_id"
        size="small"
        pagination={false}
        bordered
      >
        <Table.Column
          title="Ảnh"
          dataIndex="variantId"
          render={(variant) =>
            variant?.imageUrl?.[0] ? (
              <Image src={variant.imageUrl[0]} width={50} />
            ) : (
              <div style={{ width: 50, height: 50, background: "#eee" }} />
            )
          }
        />
        <Table.Column
          title="Tên"
          dataIndex="variantId"
          render={(variant) => variant?.name || "Không rõ"}
        />
        <Table.Column title="Số lượng" dataIndex="quantity" />
        <Table.Column
          title="Đơn giá"
          dataIndex="price"
          render={(price) => `${Number(price || 0).toLocaleString()}₫`}
        />
        <Table.Column
          title="Thành tiền"
          render={(_, item) =>
            `${Number((item?.price || 0) * (item?.quantity || 0)).toLocaleString()}₫`
          }
        />
      </Table>

      <div style={{ marginTop: 16 }}>
        {/* Tạm tính */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span><strong>Tạm tính:</strong></span>
          <span>
            {Number(
              editingOrder.items?.reduce(
                (sum, item) => sum + (item?.price || 0) * (item?.quantity || 0),
                0
              ) || 0
            ).toLocaleString()}₫
          </span>
        </div>

        {/* Giảm giá */}
        <div style={{ display: "flex", justifyContent: "space-between", color: "red" }}>
          <span><strong>Giảm giá:</strong></span>
          <span>-{Number(editingOrder.discount || 0).toLocaleString()}₫</span>
        </div>

        {/* Thành tiền */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span><strong>Thành tiền (đã giảm):</strong></span>
          <span>{Number(editingOrder.totalAmount || 0).toLocaleString()}₫</span>
        </div>

        {/* Phương thức thanh toán */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span><strong>Phương thức thanh toán:</strong></span>
          <span>
            {editingOrder.paymentMethod === "COD"
              ? "Thanh toán khi nhận hàng (COD)"
              : "Thanh toán online"}
          </span>
        </div>

        {/* Tổng tiền shipper phải thu */}
        <div style={{ display: "flex", justifyContent: "space-between", color: "blue", marginTop: 8 }}>
          <span><strong>Tổng tiền shipper phải thu:</strong></span>
          <span>
            {editingOrder.paymentMethod === "COD"
              ? `${Number(editingOrder.totalAmount || 0).toLocaleString()}₫`
              : "0₫ (Đã thanh toán online)"}
          </span>
        </div>

      {editingOrder.status === "delivery_failed" && !editingOrder.deliveryFailedReason && (
  <Form.Item
    label="Lý do giao hàng không thành công"
    name="failReason"
    rules={[{ required: true, message: "Vui lòng nhập lý do" }]}
  >
    <textarea
      rows={3}
      placeholder="VD: Không liên lạc được, khách từ chối nhận, sai địa chỉ..."
      className="w-full p-2 border border-gray-300 rounded"
    />
  </Form.Item>
)}


      </div>
    </>
  )}
</Modal>

    </>
  );
};

export default ShipperOrderList;
