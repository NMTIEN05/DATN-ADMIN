import React, { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Button,
  Table,
  Space,
  Modal,
  Image,
  Popconfirm,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import VariantTable from "./components/VariantTable";
import type { Product } from "../../types/product/product.type";
import type { Variant } from "../../../types/product/product.type";

const { confirm } = Modal;

const ListProduct = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State quản lý các dòng đang mở biến thể
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  const {
    data: products = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await axios.get("http://localhost:8888/api/product");
      return data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`http://localhost:8888/api/product/${id}`);
      toast.success("Xoá sản phẩm thành công!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const handleToggleExpand = (id: string) => {
    setExpandedRows((prev) =>
      prev.includes(id)
        ? prev.filter((rowId) => rowId !== id)
        : [...prev, id]
    );
  };

  // Hạn chế xoá sản phẩm còn biến thể
  const handleDelete = (record: Product) => {
    if (record.variants && record.variants.length > 0) {
      message.warning("Không thể xoá sản phẩm còn biến thể!");
      return;
    }
    confirm({
      title: "Bạn có chắc chắn muốn xoá sản phẩm này không?",
      okText: "Xoá",
      okType: "danger",
      cancelText: "Huỷ",
      onOk: () => deleteMutation.mutate(record._id),
    });
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-indigo-600 mb-5">Danh sách sản phẩm</h2>
      <div className="flex justify-between mb-5">
        <Button type="primary" onClick={() => navigate("/dashboard/product/create")}>
          Thêm mới
        </Button>
        <Button onClick={() => navigate("/dashboard/product/deleted")}>
          Xem sản phẩm đã xoá
        </Button>
      </div>

      <Table
        dataSource={products}
        rowKey="_id"
        loading={isLoading}
        pagination={{ pageSize: 5 }}
        // KHÔNG có expandable ở đây!
      >
        <Table.Column title="Tên sản phẩm" dataIndex="title" />
        <Table.Column title="Seri" dataIndex="groupId" render={(group) => group?.name} />
        <Table.Column title="Dung Lượng" dataIndex="capacity" />
        <Table.Column
          title="Ảnh"
          dataIndex="imageUrl"
          render={(urls: string[] = []) =>
            urls && urls.length > 0 ? (
              <Image src={urls[0]} width={60} height={60} />
            ) : (
              <span>Không có ảnh</span>
            )
          }
        />
        <Table.Column
          title="Giá mặc định"
          dataIndex="priceDefault"
          render={(price: number) => price?.toLocaleString() + "₫"}
        />
        <Table.Column title="Mô tả" dataIndex="description" />
        <Table.Column
          title="Chức năng"
          render={(_, record: Product) => (
            <Space>
              <Button
                type="primary"
                onClick={() => navigate(`/dashboard/product/edit/${record._id}`)}
              >
                Sửa
              </Button>
              {/* Nút Ẩn/Hiện biến thể */}
              <Button
                type={expandedRows.includes(record._id) ? "dashed" : "default"}
                onClick={() => handleToggleExpand(record._id)}
              >
                {expandedRows.includes(record._id) ? "Ẩn biến thể" : "Hiện biến thể"}
              </Button>
              <Popconfirm
                title="Bạn có chắc muốn xoá không?"
                onConfirm={() => handleDelete(record)}
                okText="Xoá"
                cancelText="Huỷ"
                placement="bottomRight"
                disabled={record.variants && record.variants.length > 0}
              >
                <Button type="link" danger disabled={record.variants && record.variants.length > 0}>
                  Xoá
                </Button>
              </Popconfirm>
            </Space>
          )}
        />
      </Table>

      {/* Render thủ công bảng biến thể dưới sản phẩm đang mở */}
      {products.map((record: Product) =>
        expandedRows.includes(record._id) ? (
          <div
            key={record._id}
            style={{
              margin: "16px 0",
              background: "#f6f8fa",
              padding: 12,
              borderRadius: 8,
              boxShadow: "0 1px 8px #ddd"
            }}
          >
            <VariantTable
              product={record}
              variants={record.variants}
              fetchProducts={refetch}
              colors={[]} editingVariant={undefined} setEditingVariant={function (v: Record<string, Variant[]>): void {
                throw new Error("Function not implemented.");
              } }            />
          </div>
        ) : null
      )}
    </div>
  );
};

export default ListProduct;
