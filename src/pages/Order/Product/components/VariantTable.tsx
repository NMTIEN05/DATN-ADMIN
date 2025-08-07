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

  import { useNavigate } from "react-router-dom";
  import { toast } from "react-toastify";
import type { Product, Variant } from "../../../../types/product/product.type";
import ImageUpload from "../../../../components/common/ImageUpload";

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
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editForm] = Form.useForm();
    const [addForm] = Form.useForm();
    const [addModalOpen, setAddModalOpen] = useState(false);

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
          toast.error(result.message || "Xoá biến thể thất bại!");
          return;
        }

        toast.success("Xoá biến thể thành công!", { position: "top-center" });
        fetchProducts();
      } catch (err) {
        console.error("❌ Lỗi khi xoá:", err);
        toast.error("Xoá biến thể thất bại!");
      }
    };

    const handleEdit = (record: Variant) => {
      setEditingId(record._id);
      setEditedData({ ...record });

      const urls = Array.isArray(record.imageUrl) ? record.imageUrl : [];

      // ✅ Convert imageUrl => UploadFile[] để hiển thị preview
      const fileListConverted: UploadFile[] = urls.map((url, index) => ({
        uid: `${index}`,
        name: `Ảnh ${index + 1}`,
        status: "done",
        url,
      }));

      setEditingImageUrl(urls);
      setEditingFileList(fileListConverted);

      editForm.setFieldsValue({
        name: record.name,
        price: record.price,
        stock: record.stock,
        color:
          record.attributes?.find(attr => attr.attributeId?.name === "Màu sắc")
            ?.attributeValueId?.value || "",
      });

      setEditModalOpen(true);
    };

    const handleCancel = () => {
      setEditingId(null);
      setEditedData({});
      setEditingFileList([]);
      setEditingImageUrl([]);
      setEditModalOpen(false);
    };

    const handleChange = (key: keyof Variant, value: any) => {
      setEditedData({ ...editedData, [key]: value });
    };

    const handleSave = async () => {
      try {
        const res = await fetch(
          `http://localhost:8888/api/variants/${editingId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...editedData,
              imageUrl: editingImageUrl,
            }),
          }
        );

        if (res.ok) {
          toast.success("Cập nhật thành công!", { position: "top-center" });
          fetchProducts();
          handleCancel();
        } else {
          toast.error("Cập nhật thất bại!", { position: "top-center" });
        }
      } catch (err) {
        console.error("Lỗi khi cập nhật:", err);
        toast.error("Đã có lỗi xảy ra!", { position: "top-center" });
      }
    };

const handleAddSubmit = async (values: any) => {
  if (!imageUrl.length) {
    message.error("Vui lòng chọn ảnh biến thể!");
    return;
  }

  try {
    const attrRes = await fetch("http://localhost:8888/api/attributes");
    const json = await attrRes.json();
    let attributes = json.data;

    let colorAttr = attributes.find((attr: any) => attr.attributeCode === "color");

    if (!colorAttr) {
      const newAttrRes = await fetch("http://localhost:8888/api/attributes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Màu sắc",
          attributeCode: "color",
        }),
      });
      const newAttrJson = await newAttrRes.json();
      colorAttr = newAttrJson.data;
    }

    const colorAttrId = colorAttr._id;

    const attrValueRes = await fetch("http://localhost:8888/api/AttributeValue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        value: values.color,
        valueCode: values.color.toLowerCase().replace(/\s+/g, "-"),
        attributeId: colorAttrId,
      }),
    });

    const attrValueData = await attrValueRes.json();
    const attributeValueId = attrValueData.data._id;

    const res = await fetch("http://localhost:8888/api/variants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${product.title} - ${values.color}`, // ✅ auto name
        price: values.price,
        stock: values.stock,
        imageUrl,
        productId: product._id,
        attributes: [
          {
            attributeId: colorAttrId,
            attributeValueId,
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
      <div
        style={{
          background: "#e6f7ff",
          border: "1px solid #91d5ff",
          borderRadius: 10,
          padding: 16,
          marginTop: 12,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Table dataSource={parsedVariants} rowKey="_id" pagination={false}>
          <Table.Column title="STT" render={(_, __, index) => index + 1} />
          <Table.Column title="Tên Sản Phẩm" dataIndex="name" />
          <Table.Column title="Màu sắc" dataIndex="color" />
          <Table.Column
            title="Ảnh biến thể"
            key="variantImage"
            render={(record: Variant) =>
              record.imageUrl && record.imageUrl.length ? (
                <Image src={record.imageUrl[0]} width={60} />
              ) : (
                <span style={{ color: "#aaa" }}>Không có ảnh</span>
              )
            }
          />
          <Table.Column
            title="Giá"
            dataIndex="price"
            render={(price: number) => price?.toLocaleString() + "₫"}
          />
          <Table.Column title="Tồn kho" dataIndex="stock" />
          <Table.Column
            title="Hành động"
            render={(_, record: Variant) => (
              <Space>
                <Button onClick={() => handleEdit(record)}>Sửa</Button>
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

        <div className="mt-4 text-right">
          <Button type="dashed" onClick={() => setAddModalOpen(true)}>
            + Thêm biến thể
          </Button>
        </div>

        {/* Modal Thêm */}
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
  rules={[
    { required: true, message: "Nhập màu sắc!" },
    {
      validator: (_, value) => {
        const lowerValue = value?.trim().toLowerCase();
        const colorExists = variants.some((variant) =>
          variant.attributes?.some(
            (attr) =>
              attr.attributeId?.name === "Màu sắc" &&
              attr.attributeValueId?.value.trim().toLowerCase() === lowerValue
          )
        );

        if (colorExists) {
          return Promise.reject("Màu này đã tồn tại!");
        }

        return Promise.resolve();
      },
    },
  ]}
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

        {/* Modal Sửa */}
        <Modal
          title="Chỉnh sửa biến thể"
          open={editModalOpen}
          onCancel={handleCancel}
          onOk={() => editForm.submit()}
          okText="Lưu"
          cancelText="Huỷ"
        >
          <Form form={editForm} layout="vertical" onFinish={handleSave}>
            <Form.Item
              label="Tên biến thể"
              name="name"
              rules={[{ required: true, message: "Nhập tên biến thể!" }]}
            >
              <Input onChange={(e) => handleChange("name", e.target.value)} />
            </Form.Item>
            <Form.Item
              label="Giá"
              name="price"
              rules={[{ required: true, message: "Nhập giá!" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                onChange={(v) => handleChange("price", v)}
              />
            </Form.Item>
            <Form.Item
              label="Tồn kho"
              name="stock"
              rules={[{ required: true, message: "Nhập tồn kho!" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                onChange={(v) => handleChange("stock", v)}
              />
            </Form.Item>
            <Form.Item
              label="Màu sắc"
              name="color"
              rules={[{ required: true, message: "Nhập màu sắc!" }]}
            >
              <Input onChange={(e) => handleChange("color", e.target.value)} />
            </Form.Item>
            <Form.Item label="Ảnh biến thể">
              <ImageUpload
                fileList={editingFileList}
                setFileList={setEditingFileList}
                setImageUrl={setEditingImageUrl}
                maxCount={5}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  };

  export default VariantTable;
