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

const DeletedCategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const fetchDeletedCategories = async () => {
  try {
    setLoading(true);
    const res = await axios.get(
      `${import.meta.env.VITE_PUBLIC_API_URL}api/category/deleted`
    );
    console.log("✅ RESPONSE FULL:", res.data); // 👉 log đầy đủ response
    console.log("📦 Deleted categories:", res.data.data); // 👉 log riêng mảng danh mục

    // đảm bảo setCategories luôn là mảng
    setCategories(Array.isArray(res.data.data) ? res.data.data : []);
  } catch (err) {
    console.error("❌ Lỗi khi fetch danh mục đã xoá:", err);
    message.error("Không thể tải danh mục đã xoá");
  } finally {
    setLoading(false);
  }
};


  const handleRestore = async (id: string) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_PUBLIC_API_URL}api/category/${id}/restore`
      );
      toast.success("Khôi phục thành công");
      fetchDeletedCategories();
    } catch (err) {
      message.error("Lỗi khi khôi phục");
    }
  };

  const handleHardDelete = async (id: string) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_PUBLIC_API_URL}api/category/${id}/force`
      );
      toast.success("Đã xoá vĩnh viễn");
      fetchDeletedCategories();
    } catch (err) {
      message.error("Xoá cứng thất bại");
    }
  };

  const handleHardDeleteAll = async () => {
    confirm({
      title: "Bạn có chắc muốn xoá tất cả danh mục đã xoá?",
      content: "Hành động này không thể khôi phục.",
      okText: "Xoá tất cả",
      okType: "danger",
      cancelText: "Huỷ",
      onOk: async () => {
        try {
          await axios.delete(
            `${import.meta.env.VITE_PUBLIC_API_URL}api/category/force-all`
          );
          toast.success("Đã xoá tất cả danh mục bị xoá mềm");
          fetchDeletedCategories();
        } catch (err) {
          message.error("Xoá tất cả thất bại");
        }
      },
    });
  };

  useEffect(() => {
    fetchDeletedCategories();
  }, []);

  const columns = [
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <span className="line-through opacity-70 text-gray-500">{text}</span>
      ),
    },
    {
      title: "Thời gian xoá",
      dataIndex: "deletedAt",
      key: "deletedAt",
      render: (date: string) => new Date(date).toLocaleString(),
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
            ♻️ Khôi phục
          </Button>
          <Popconfirm
            title="Xác nhận xoá vĩnh viễn?"
            onConfirm={() => handleHardDelete(record._id)}
          >
            <Button danger type="link">
              🗑️ Xoá cứng
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-red-600 mb-5">
        Danh sách danh mục đã xoá
      </h2>

      <div className="flex justify-between mb-5">
        <Space>
          <Button type="primary" onClick={() => navigate("/dashboard/category")}>
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
        dataSource={categories}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default DeletedCategoryList;
