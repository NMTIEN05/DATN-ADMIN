import React from "react";
import { Table, Button, Popconfirm, Image } from "antd";
import type { Product, Variant } from "../../../types/product/product.type";
import VariantTable from "./VariantTable";
import type { NavigateFunction } from "react-router-dom";

interface Props {
  products: Product[];
  navigate: NavigateFunction;
  onDeleteProduct: (id: string) => Promise<void>;
  expandedRowKeys: string[];
  setExpandedRowKeys: React.Dispatch<React.SetStateAction<string[]>>;
  editingVariant: Record<string, Variant[]>;
  setEditingVariant: React.Dispatch<React.SetStateAction<Record<string, Variant[]>>>;
  fetchProducts: () => Promise<void>;
  colors: any[];
  storages?: any[];
}

const ProductTable: React.FC<Props> = ({
  products,
  navigate,
  onDeleteProduct,
  expandedRowKeys,
  setExpandedRowKeys,
  editingVariant,
  setEditingVariant,
  fetchProducts,
  colors,
}) => {
  return (
    <Table
      dataSource={products}
      rowKey="_id"
      expandable={{
        expandedRowRender: (record) => (
          <VariantTable
            product={record}
            variants={record.variants}
            editingVariant={editingVariant}
            setEditingVariant={setEditingVariant}
            fetchProducts={fetchProducts}
            colors={colors}
          />
        ),
        expandedRowKeys,
        onExpandedRowsChange: (expanded) => setExpandedRowKeys(expanded as string[]),
      }}
      columns={[
        {
          title: "Slug",
          dataIndex: "slug",
          key: "slug",
        },
        {
          title: "Giá mặc định",
          dataIndex: "priceDefault",
          key: "priceDefault",
          render: (price) => price?.toLocaleString() + "₫",
        },
        {
          title: "Ảnh",
          dataIndex: "imageUrl",
          key: "imageUrl",
          render: (url) => <Image src={url} alt="" width={60} />,
        },
        {
          title: "Hành động",
          render: (_, record) => (
            <>
              <Button onClick={() => navigate(`/dashboard/product/edit/${record._id}`)}>Sửa</Button>
              <Popconfirm
                title="Bạn có chắc muốn xoá không?"
                onConfirm={() => onDeleteProduct(record._id)}
                okText="Xoá"
                cancelText="Huỷ"
                placement="bottomRight"
              >
                <Button type="link" danger>
                  Xoá
                </Button>
              </Popconfirm>
            </>
          ),
        },
      ]}
    />
  );
};

export default ProductTable;
