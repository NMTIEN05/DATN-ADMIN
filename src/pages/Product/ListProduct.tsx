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
  message,
} from "antd";
import { EditOutlined, DeleteOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import VariantTable from "./components/VariantTable";
import type { Product } from "../../types/product/product.type";

const ListProduct = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Quản lý trạng thái mở/ẩn biến thể
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  // Trạng thái xác nhận xoá (modal)
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    data: products = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await axios.get("http://localhost:8888/api/product", {
        params: { limit: 1000 },
      });
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

  // Nút xoá luôn sáng, chỉ cho xoá khi KHÔNG còn biến thể
  const handleDeleteClick = (record: Product) => {
    if (record.variants && record.variants.length > 0) {
      message.warning("Không thể xoá sản phẩm còn biến thể!");
      return;
    }
    setDeleteId(record._id);
  };

  const handleConfirmDelete = (id: string) => {
    deleteMutation.mutate(id);
    setDeleteId(null);
  };

  const handleCancelDelete = () => {
    setDeleteId(null);
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
        expandable={{
          expandedRowRender: (record: Product) => (
            <VariantTable
              product={record}
              variants={record.variants}
              fetchProducts={refetch}
              colors={[]}
            />
          ),
          expandedRowKeys: expandedRows,
          onExpand: (expanded, record: Product) => handleToggleExpand(record._id),
          showExpandColumn: false, // ẨN icon expand mặc định
        }}
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
                icon={<EditOutlined />}
                type="primary"
                onClick={() => navigate(`/dashboard/product/edit/${record._id}`)}
              >
                Sửa
              </Button>
              <Button
                icon={<UnorderedListOutlined />}
                type={expandedRows.includes(record._id) ? "dashed" : "default"}
                onClick={() => handleToggleExpand(record._id)}
              >
                {expandedRows.includes(record._id) ? "Ẩn biến thể" : "Hiện biến thể"}
              </Button>
              <Button
                icon={<DeleteOutlined />}
                danger
                onClick={() => handleDeleteClick(record)}
              >
                Xoá
              </Button>
              {/* Modal xác nhận xoá */}
              {deleteId === record._id && (
                <Modal
                  title="Xác nhận xoá sản phẩm"
                  open={true}
                  onOk={() => handleConfirmDelete(record._id)}
                  onCancel={handleCancelDelete}
                  okText="Xoá"
                  okType="danger"
                  cancelText="Huỷ"
                >
                  Bạn có chắc chắn muốn xoá sản phẩm này không?
                </Modal>
              )}
            </Space>
          )}
        />
      </Table>

      {/* CSS để ẩn cột expand-icon của Table nếu vẫn còn */}
      <style>{`
        .ant-table-row-expand-icon-cell {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default ListProduct;
