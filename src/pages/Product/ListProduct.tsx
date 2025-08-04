import React from "react";
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
} from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import VariantTable from "./components/VariantTable";
import type { Product } from "../../types/product/product.type";

const { confirm } = Modal;

const ListProduct = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ✅ Lấy danh sách sản phẩm
const {
  data: products = [],
  isLoading,
  refetch, // 👈 lấy refetch ở đây
} = useQuery({
  queryKey: ["products"],
  queryFn: async () => {
    const { data } = await axios.get("http://localhost:8888/api/product", {
  params: {
    limit: 1000, // 👈 giới hạn số lượng sản phẩm
  },
});
    return data.data;
  },
});


  // ✅ Xoá sản phẩm
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`http://localhost:8888/api/product/${id}`);
      toast.success("Xoá sản phẩm thành công!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const handleDelete = (id: string) => {
    confirm({
      title: "Bạn có chắc chắn muốn xoá sản phẩm này không?",
      okText: "Xoá",
      okType: "danger",
      cancelText: "Huỷ",
      onOk: () => deleteMutation.mutate(id),
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
        expandable={{
          expandedRowRender: (record: Product) => (
            <VariantTable
              product={record}
              variants={record.variants}
              editingVariant={{}}
              setEditingVariant={() => {}}
              fetchProducts={refetch} // ✅ truyền hàm để load lại khi xoá/sửa
              colors={[]} // nếu cần lọc màu thì truyền danh sách
            />
          ),
          defaultExpandAllRows: false,
        }}
        pagination={{ pageSize: 5 }}
      >
        <Table.Column title="Tên sản phẩm" dataIndex="title" />
        <Table.Column title="Seri" dataIndex="groupId" render={(group) => group?.name} />
        <Table.Column title="Dung Lượng" dataIndex="capacity" />
        
       <Table.Column
  title="Ảnh"
  dataIndex="imageUrl"
  render={(urls: string[] = []) =>
    urls.length > 0 ? (
      <Image src={urls[0]} width={60} height={60} />
    ) : (
      <span>Không có ảnh</span>
    )
  }
/>

        <Table.Column
          title="Giá mặc định"
          dataIndex="priceDefault"
          render={(price: number) => price.toLocaleString() + "₫"}
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
              <Popconfirm
                title="Bạn có chắc muốn xoá không?"
                onConfirm={() => handleDelete(record._id)}
                okText="Xoá"
                cancelText="Huỷ"
                placement="bottomRight"
              >
                <Button type="link" danger>
                  Xoá
                </Button>
              </Popconfirm>
            </Space>
          )}
        />
      </Table>
    </div>
  );
};

export default ListProduct;
