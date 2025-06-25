import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  Input,
  InputNumber,
  message,
  Modal,
  Form,
  Image,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import type { Variant, Product } from "../../../types/product/product.type";
import { useNavigate } from "react-router-dom";
import ImageUpload from "../../../components/common/ImageUpload";
import { toast } from "react-toastify";

interface Props {
  product: Product;
  variants: Variant[];
  editingVariant: Record<string, Variant[]>;
  setEditingVariant: (v: Record<string, Variant[]>) => void;
  fetchProducts: () => void;
  colors: any[];
}

const VariantTable: React.FC<Props> = ({
  product,
  variants,
  fetchProducts,
}) => {
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Partial<Variant>>({});
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm] = Form.useForm();

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageUrl, setImageUrl] = useState<string[]>([]);
  const [editingFileList, setEditingFileList] = useState<UploadFile[]>([]);
  const [editingImageUrl, setEditingImageUrl] = useState<string[]>([]);

  const parsedVariants = variants.map((variant) => {
    const colorAttr = variant.attributes?.find(
      (attr) => attr.attributeId?.name === "Màu sắc"
    );
    return {
      ...variant,
      color: colorAttr?.attributeValueId?.value || "Không xác định",
    };
  });

const handleDelete = async (_id: string) => {
  try {
    const res = await fetch(`http://localhost:8888/api/variants/${_id}`, {
      method: "DELETE",
    });

    const result = await res.json();

    if (!res.ok) {
      // ✅ Hiển thị toast lỗi cụ thể từ server (nếu có)
      toast.error(result.message || "Xoá biến thể thất bại!");
      return;
    }

    toast.success("Xoá biến thể thành công!");
    fetchProducts(); // Cập nhật lại danh sách
  } catch (err) {
    console.error("❌ Lỗi khi xoá:", err);
    toast.error("Xoá biến thể thất bại!");
  }
};


  const handleEdit = (record: Variant) => {
    setEditingId(record._id);
    setEditedData({ ...record });
    setEditingImageUrl(Array.isArray(record.imageUrl) ? record.imageUrl : []);
    setEditingFileList([]);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedData({});
    setEditingFileList([]);
    setEditingImageUrl([]);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`http://localhost:8888/api/variants/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editedData,
          imageUrl: editingImageUrl,
        }),
      });

      if (res.ok) {
        message.success("Cập nhật thành công");
        fetchProducts();
        handleCancel();
      } else {
        message.error("Cập nhật thất bại");
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
    }
  };

  const handleChange = (key: keyof Variant, value: any) => {
    setEditedData({ ...editedData, [key]: value });
  };

  const handleAddSubmit = async (values: any) => {
    if (!imageUrl.length) {
      message.error("Vui lòng chọn ảnh biến thể!");
      return;
    }

    try {
      const res = await fetch("http://localhost:8888/api/variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          price: values.price,
          stock: values.stock,
          imageUrl,
          productId: product._id,
          attributes: [
            {
              attributeName: "Màu sắc",
              value: values.color,
            },
          ],
        }),
      });

      if (!res.ok) throw new Error("Tạo biến thể thất bại");

      message.success("Tạo biến thể thành công!");
      fetchProducts();
      setAddModalOpen(false);
      addForm.resetFields();
      setFileList([]);
      setImageUrl([]);
    } catch (err) {
      console.error("❌ Lỗi khi thêm biến thể:", err);
      message.error("Thêm biến thể thất bại!");
    }
  };

  return (
    <div style={{ background: "#e6f7ff", border: "1px solid #91d5ff", borderRadius: 10, padding: 16, marginTop: 12, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)" }}>
      <Table dataSource={parsedVariants} rowKey="_id" pagination={false}>
        <Table.Column title="STT" render={(_, __, index) => index + 1} />
        <Table.Column
          title="Tên Sản Phẩm"
          dataIndex="name"
          render={(_, record: Variant) =>
            editingId === record._id ? (
              <Input value={editedData.name} onChange={(e) => handleChange("name", e.target.value)} />
            ) : (
              record.name
            )
          }
        />
        <Table.Column title="Màu sắc" dataIndex="color" />
        <Table.Column
          title="Ảnh biến thể"
          key="variantImage"
          render={(record: Variant) =>
            editingId === record._id ? (
              <ImageUpload fileList={editingFileList} setFileList={setEditingFileList} setImageUrl={setEditingImageUrl} maxCount={5} />
            ) : record.imageUrl && record.imageUrl.length ? (
              <Image src={record.imageUrl[0]} width={60} />
            ) : (
              <span style={{ color: "#aaa" }}>Không có ảnh</span>
            )
          }
        />
        <Table.Column
          title="Giá"
          dataIndex="price"
          render={(_, record: Variant) =>
            editingId === record._id ? (
              <InputNumber value={editedData.price} onChange={(value) => handleChange("price", value)} />
            ) : (
              record.price?.toLocaleString() + "₫"
            )
          }
        />
        <Table.Column
          title="Tồn kho"
          dataIndex="stock"
          render={(_, record: Variant) =>
            editingId === record._id ? (
              <InputNumber value={editedData.stock} onChange={(value) => handleChange("stock", value)} />
            ) : (
              record.stock
            )
          }
        />
        <Table.Column
          title="Hành động"
          render={(_, record: Variant) =>
            editingId === record._id ? (
              <Space>
                <Button type="primary" onClick={handleSave}>Lưu</Button>
                <Button onClick={handleCancel}>Huỷ</Button>
              </Space>
            ) : (
              <Space>
                <Button onClick={() => handleEdit(record)}>Sửa</Button>
                <Popconfirm
                  title="Bạn có chắc muốn xoá không?"
                  onConfirm={() => handleDelete(record._id)}
                  okText="Xoá"
                  cancelText="Huỷ"
                  placement="bottomRight"
                >
                  <Button type="link" danger>Xoá</Button>
                </Popconfirm>
              </Space>
            )
          }
        />
      </Table>

      <div className="mt-4 text-right">
        <Button type="dashed" onClick={() => setAddModalOpen(true)}>
          + Thêm biến thể
        </Button>
      </div>

      <Modal
        title="Thêm biến thể mới"
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        onOk={() => addForm.submit()}
        okText="Tạo"
        cancelText="Huỷ"
      >
        <Form form={addForm} layout="vertical" onFinish={handleAddSubmit}>
          <Form.Item
            label="Tên biến thể"
            name="name"
            rules={[{ required: true, message: "Nhập tên biến thể!" }]}
          >
            <Input placeholder="VD: iPhone 15 - Xanh" />
          </Form.Item>

          <Form.Item
            label="Giá"
            name="price"
            rules={[{ required: true, message: "Nhập giá!" }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>

          <Form.Item
            label="Tồn kho"
            name="stock"
            rules={[{ required: true, message: "Nhập tồn kho!" }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>

          <Form.Item
            label="Màu sắc"
            name="color"
            rules={[{ required: true, message: "Nhập màu sắc!" }]}
          >
            <Input placeholder="VD: Đỏ, Xanh, Đen" />
          </Form.Item>

          <Form.Item label="Ảnh biến thể" required>
            <ImageUpload
              fileList={fileList}
              setFileList={setFileList}
              setImageUrl={setImageUrl}
              maxCount={5}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VariantTable;
