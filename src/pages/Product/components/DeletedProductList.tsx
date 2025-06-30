import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Tag,
  Popconfirm,
  Space,
  message,
  Modal,
} from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const { confirm } = Modal;

const DeletedProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchDeletedProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_PUBLIC_API_URL}api/product`,
        {
          params: { deleted: true },
        }
      );
      console.log("📦 Dữ liệu sản phẩm đã xoá:", res.data.data);
      setProducts(res.data.data || []);
    } catch (err) {
      message.error("Không thể tải sản phẩm đã xoá");
      console.error("❌ Lỗi khi fetch sản phẩm đã xoá:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_PUBLIC_API_URL}api/product/${id}/restore`
      );
      toast.success("Khôi phục thành công");
      fetchDeletedProducts();
    } catch (err) {
      message.error("Lỗi khi khôi phục");
    }
  };

  const handleHardDelete = async (id: string) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_PUBLIC_API_URL}api/product/${id}/hard`
      );
      toast.success("Đã xoá vĩnh viễn");
      fetchDeletedProducts();
    } catch (err) {
      message.error("Xoá cứng thất bại");
    }
  };

  const handleHardDeleteAll = async () => {
    confirm({
      title: "Bạn có chắc muốn xoá tất cả sản phẩm đã xoá?",
      content: "Hành động này không thể khôi phục.",
      okText: "Xoá tất cả",
      okType: "danger",
      cancelText: "Huỷ",
      onOk: async () => {
        try {
          await axios.delete(
            `${import.meta.env.VITE_PUBLIC_API_URL}api/product/hard-all`
          );
          toast.success("Đã xoá tất cả sản phẩm bị xoá mềm");
          fetchDeletedProducts();
        } catch (err) {
          message.error("Xoá tất cả thất bại");
          console.error("❌ Lỗi khi xoá tất cả sản phẩm đã xoá:", err);
        }
      },
    });
  };

  useEffect(() => {
    fetchDeletedProducts();
  }, []);

  const columns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "title",
      key: "title",
      render: (text: string) => (
        <span className="line-through opacity-70 text-gray-500">{text}</span>
      ),
    },
    {
      title: "Danh mục",
      key: "category",
      render: (_: any, record: any) => record.categoryId?.name || "--",
    },
    {
      title: "Trạng thái",
      key: "status",
      render: () => <Tag color="red">Đã xoá</Tag>,
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button onClick={() => handleRestore(record._id)} type="link">
            Khôi phục
          </Button>
          <Popconfirm
            title="Xác nhận xoá vĩnh viễn?"
            onConfirm={() => handleHardDelete(record._id)}
          >
            <Button danger type="link">
              Xoá cứng
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-red-600 mb-5">
        Danh sách sản phẩm đã xoá
      </h2>

      <div className="flex justify-between mb-5">
        <Space>
          <Button type="primary" onClick={() => navigate("/dashboard/product")}>
            ⬅ Quay lại danh sách
          </Button>

          <Button danger onClick={handleHardDeleteAll}>
            🗑 Xoá tất cả
          </Button>
        </Space>
      </div>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={products}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default DeletedProductList;
