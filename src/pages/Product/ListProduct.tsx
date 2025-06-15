import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Popconfirm,
  message,
  Card,
  Input,
  InputNumber,
  Space,
} from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Variant {
  color: string;
  storage: string;
  price: number;
  stock: number;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  categoryId: {
    name: string;
  };
  variants: Variant[];
}

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingVariant, setEditingVariant] = useState<Record<string, Variant[]>>({});
  const [expandedRowKeys, setExpandedRowKeys] = useState<readonly string[]>([]);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("http://localhost:8888/api/product");
      setProducts(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteProduct = async (id: string) => {
    try {
      await axios.delete(`http://localhost:8888/api/product/${id}`);
      message.success("Xoá sản phẩm thành công!");
      fetchProducts();
    } catch (error) {
      message.error("Xoá thất bại!");
    }
  };

  const handleVariantChange = (
    productId: string,
    index: number,
    field: keyof Variant,
    value: any
  ) => {
    setEditingVariant((prev) => {
      const newVariants = [...(prev[productId] || [])];
      newVariants[index] = { ...newVariants[index], [field]: value };
      return { ...prev, [productId]: newVariants };
    });
  };

  const handleEditClick = (productId: string, variants: Variant[]) => {
    setEditingVariant((prev) => ({
      ...prev,
      [productId]: [...variants],
    }));
    setExpandedRowKeys((prev) => [...new Set([...prev, productId])]);
  };

  const handleSaveVariants = async (productId: string) => {
    try {
      const newVariants = editingVariant[productId];
      await axios.patch(`http://localhost:8888/api/product/${productId}`, {
        variants: newVariants,
      });
      message.success("Cập nhật biến thể thành công!");
      setEditingVariant((prev) => {
        const clone = { ...prev };
        delete clone[productId];
        return clone;
      });
      fetchProducts();
    } catch (err) {
      message.error("Cập nhật thất bại!");
    }
  };

  const handleDeleteVariant = async (productId: string, index: number) => {
    try {
      const currentVariants = editingVariant[productId] ||
        products.find((p) => p._id === productId)?.variants || [];

      if (currentVariants.length <= 1) {
        message.warning("Sản phẩm phải có ít nhất 1 biến thể!");
        return;
      }

      const newVariants = currentVariants.filter((_, i) => i !== index);

      if (editingVariant[productId]) {
        setEditingVariant((prev) => ({
          ...prev,
          [productId]: newVariants,
        }));
      } else {
        await axios.patch(`http://localhost:8888/api/product/${productId}`, {
          variants: newVariants,
        });
        message.success("Xoá biến thể thành công!");
        fetchProducts();
      }
    } catch (error) {
      message.error("Xoá biến thể thất bại!");
    }
  };

  const handleAddVariant = (productId: string) => {
    const currentVariants = editingVariant[productId] ||
      products.find((p) => p._id === productId)?.variants || [];

    const newVariant: Variant = {
      color: "",
      storage: "",
      price: 0,
      stock: 0,
    };

    const newVariants = [...currentVariants, newVariant];

    setEditingVariant((prev) => ({
      ...prev,
      [productId]: newVariants,
    }));
    setExpandedRowKeys((prev) => [...new Set([...prev, productId])]);
  };

  const expandedRowRender = (record: Product) => {
    const variants = editingVariant[record._id] || record.variants;
    const isEditing = !!editingVariant[record._id];

    return (
      <>
        <Table
          dataSource={variants}
          pagination={false}
          rowKey={(_, index) => `${record._id}-${index}`}
          columns={[
            {
              title: "Màu",
              dataIndex: "color",
              render: (text, _, index) => (
                <Input
                  value={text}
                  placeholder="Nhập màu sắc"
                  onChange={(e) =>
                    handleVariantChange(record._id, index, "color", e.target.value)
                  }
                  disabled={!isEditing}
                />
              ),
            },
            {
              title: "Dung lượng",
              dataIndex: "storage",
              render: (text, _, index) => (
                <Input
                  value={text}
                  placeholder="Nhập dung lượng"
                  onChange={(e) =>
                    handleVariantChange(record._id, index, "storage", e.target.value)
                  }
                  disabled={!isEditing}
                />
              ),
            },
            {
              title: "Giá",
              dataIndex: "price",
              render: (text, _, index) => (
                <InputNumber
                  value={text}
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                  onChange={(value) =>
                    handleVariantChange(record._id, index, "price", value)
                  }
                  disabled={!isEditing}
                  style={{ width: '100%' }}
                />
              ),
            },
            {
              title: "Tồn kho",
              dataIndex: "stock",
              render: (text, _, index) => (
                <InputNumber
                  value={text}
                  min={0}
                  onChange={(value) =>
                    handleVariantChange(record._id, index, "stock", value)
                  }
                  disabled={!isEditing}
                  style={{ width: '100%' }}
                />
              ),
            },
            {
              title: "Hành động",
              key: "variantActions",
              render: (_, __, index) => (
                <Space>
                  <Popconfirm
                    title="Bạn có chắc muốn xoá biến thể này?"
                    onConfirm={() => handleDeleteVariant(record._id, index)}
                    okText="Xoá"
                    cancelText="Huỷ"
                    okType="danger"
                  >
                    <Button danger size="small" disabled={variants.length <= 1}>
                      🗑️ Xoá
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
        <div className="mt-3">
          <Space>
            {isEditing ? (
              <>
                <Button type="primary" onClick={() => handleSaveVariants(record._id)}>
                  💾 Lưu biến thể
                </Button>
                <Button
                  onClick={() =>
                    setEditingVariant((prev) => {
                      const clone = { ...prev };
                      delete clone[record._id];
                      return clone;
                    })
                  }
                >
                  ❌ Hủy
                </Button>
                <Button type="dashed" onClick={() => handleAddVariant(record._id)}>
                  ➕ Thêm biến thể
                </Button>
              </>
            ) : (
              <Button onClick={() => handleEditClick(record._id, record.variants)}>
                ✏️ Chỉnh sửa biến thể
              </Button>
            )}
          </Space>
        </div>
      </>
    );
  };

  const columns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      render: (text: string) => (
        <span title={text}>
          {text ? text.slice(0, 50) + (text.length > 50 ? '...' : '') : 'Chưa có mô tả'}
        </span>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "categoryId",
      render: (category: any) => category?.name || "Không rõ",
    },
    {
      title: "Số biến thể",
      render: ( record: Product) => (
        <span className="font-semibold text-blue-600">
          {record.variants?.length || 0}
        </span>
      ),
    },
    {
      title: "Hành động",
      render: ( record: Product) => (
        <Space>
          <Button type="link" onClick={() => navigate(`/dashboard/product/edit/${record._id}`)}>
            ✏️ Sửa
          </Button>
          <Popconfirm
            title="Xoá sản phẩm"
            onConfirm={() => handleDeleteProduct(record._id)}
            okText="Xoá"
            cancelText="Huỷ"
            okType="danger"
          >
            <Button type="link" danger>
              🗑️ Xoá
            </Button>
          </Popconfirm>
          <Button type="link" onClick={() => navigate(`/product/${record._id}`)}>
            👁️ Xem
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-indigo-600 mb-5">Danh sách sản phẩm</h2>
      <Card>
        <div className="mb-4 flex justify-between items-center">
          <Button type="primary" size="large" onClick={() => navigate("/dashboard/product/create")}>➕ Thêm sản phẩm</Button>
          <div className="text-gray-500">
            Tổng: <span className="font-semibold">{products.length}</span> sản phẩm
          </div>
        </div>

        <Table
          rowKey="_id"
          dataSource={products}
          columns={columns}
          expandable={{
            expandedRowRender,
            expandedRowKeys,
            onExpandedRowsChange: (keys) => setExpandedRowKeys(keys as string[]),
            rowExpandable: (record) => record.variants?.length > 0,
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default ProductList;
