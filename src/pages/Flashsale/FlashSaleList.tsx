import React, { useEffect, useState } from "react";
import { Table, Button, Popconfirm, message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";

const FlashSaleList = () => {
  const [flashSales, setFlashSales] = useState([]);
  const navigate = useNavigate();

  const fetchFlashSales = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_PUBLIC_API_URL}api/flashsales`);
      setFlashSales(data);
    } catch (err) {
      message.error("Không thể tải danh sách Flash Sale");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${import.meta.env.VITE_PUBLIC_API_URL}api/flashsales/${id}`);
      message.success("Đã xoá Flash Sale");
      fetchFlashSales();
    } catch (err) {
      message.error("Lỗi xoá Flash Sale");
    }
  };

  useEffect(() => {
    fetchFlashSales();
  }, []);

  const columns = [
    { title: "Tên", dataIndex: "title", key: "title" },
    {
      title: "Giảm (%)",
      dataIndex: "discountPercent",
      key: "discountPercent",
    },
    {
      title: "Bắt đầu",
      dataIndex: "startTime",
      render: (time: string) => dayjs(time).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Kết thúc",
      dataIndex: "endTime",
      render: (time: string) => dayjs(time).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Hành động",
      render: (_: any, record: any) => (
        <>
          <Button onClick={() => navigate(`/admin/flashsale/edit/${record._id}`)}>Sửa</Button>
          <Popconfirm
            title="Bạn chắc chắn muốn xoá?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button danger>Xoá</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">Quản lý Flash Sale</h2>
      <Button
        type="primary"
        onClick={() => navigate("/admin/flashsale/create")}
        style={{ marginBottom: 16 }}
      >
        + Thêm Flash Sale
      </Button>
      <Table dataSource={flashSales} columns={columns} rowKey="_id" />
    </div>
  );
};

export default FlashSaleList;
