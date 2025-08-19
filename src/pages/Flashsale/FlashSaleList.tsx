import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Space, Modal, Tag, Spin, message } from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast } from "react-toastify";

const { confirm } = Modal;

interface Product {
  _id: string;
  title: string;
  slug: string;
  capacity: string;
  imageUrl: string[];
}

interface FlashSale {
  _id: string;
  product: Product;
  salePrice: number;
  quantity: number;
  discountPercent: number;
  startTime: string;
  endTime: string;
  limitQuantity: number;
  isActive: boolean;
}

const FlashSaleList: React.FC = () => {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const fetchFlashSales = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token"); // Lấy token từ localStorage
      const res = await axios.get("http://localhost:8888/api/flashsale", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFlashSales(res.data.data || []);
    } catch (error: any) {
      console.error("Lỗi khi fetch flash sale:", error);
      toast.error(
        error.response?.data?.message || "Không thể lấy dữ liệu Flash Sale"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    confirm({
      title: "Bạn có chắc chắn muốn xoá Flash Sale này không?",
      okText: "Xoá",
      okType: "danger",
      cancelText: "Huỷ",
      onOk: async () => {
        try {
          const token = localStorage.getItem("accessToken");
          await axios.delete(`http://localhost:8888/api/flashsale/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          toast.success("✅ Xoá Flash Sale thành công!");
          fetchFlashSales(); // reload lại danh sách
        } catch (error: any) {
          console.error("Lỗi xoá flash sale:", error);
          toast.error(
            error.response?.data?.message || "Xoá Flash Sale thất bại!"
          );
        }
      },
    });
  };

  useEffect(() => {
    fetchFlashSales();
  }, []);

  if (loading) return <Spin tip="Đang tải danh sách Flash Sale..." />;

  return (
    <div>
      <h2 className="text-3xl font-bold text-indigo-600 mb-5">
        Danh Sách Flash Sale
      </h2>

      <div className="flex justify-between mb-5">
        <Button type="primary" onClick={() => navigate("/dashboard/flashsale/create")}>
          Thêm mới
        </Button>
      </div>

      <Table
        dataSource={flashSales}
        rowKey="_id"
        pagination={{ pageSize: 5 }}
      >
        <Table.Column
          title="STT"
          render={(_, __, index) => index + 1}
        />
        <Table.Column
          title="Ảnh"
          dataIndex="product"
          render={(product: Product) => (
            <img
              src={product.imageUrl[0]}
              alt={product.title}
              style={{ width: 60, height: 60, objectFit: "cover" }}
            />
          )}
        />
        <Table.Column
          title="Sản phẩm"
          dataIndex="product"
          render={(product: Product) => product.title}
        />
        <Table.Column
          title="Giá sale"
          dataIndex="salePrice"
          render={(val: number) => val.toLocaleString() + " ₫"}
        />
        <Table.Column
          title="Giảm giá (%)"
          dataIndex="discountPercent"
        />
        <Table.Column
          title="Số lượng"
          dataIndex="quantity"
        />
        <Table.Column
          title="Bắt đầu"
          dataIndex="startTime"
          render={(val: string) => dayjs(val).format("DD/MM/YYYY HH:mm")}
        />
        <Table.Column
          title="Kết thúc"
          dataIndex="endTime"
          render={(val: string) => dayjs(val).format("DD/MM/YYYY HH:mm")}
        />
        <Table.Column
          title="Giới hạn"
          dataIndex="limitQuantity"
        />
        <Table.Column
          title="Trạng thái"
          dataIndex="isActive"
          render={(active: boolean) => (
            <Tag color={active ? "green" : "red"}>
              {active ? "Kích hoạt" : "Vô hiệu hóa"}
            </Tag>
          )}
        />
        <Table.Column
          title="Chức năng"
          render={(_, record: FlashSale) => (
            <Space>
              <Button
                type="primary"
                onClick={() => navigate(`/dashboard/flashsale/edit/${record._id}`)}
              >
                Sửa
              </Button>
              <Button
                type="default"
                danger
                onClick={() => handleDelete(record._id)}
              >
                Xoá
              </Button>
            </Space>
          )}
        />
      </Table>
    </div>
  );
};

export default FlashSaleList;
