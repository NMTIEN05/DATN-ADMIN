import React, { useMemo, useState } from "react";
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
  Tag,
  Switch,
  Tooltip,
  Drawer,
  List,
  Badge,
  Empty,
  Divider,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import type { Variant, Product } from "../../../types/product/product.type";
import ImageUpload from "../../../components/common/ImageUpload";
import { toast } from "react-toastify";

interface Props {
  product: Product;
  variants: Variant[];
  fetchProducts: () => void;
  colors: any[];
}

const VariantTable: React.FC<Props> = ({ product, variants, fetchProducts }) => {
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

  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [showHidden, setShowHidden] = useState(false);

  const [hiddenDrawerOpen, setHiddenDrawerOpen] = useState(false);

  const toggleHidden = (id: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const unhideAll = () => setHiddenIds(new Set());

  const parsedVariants = useMemo(
    () =>
      variants.map((variant) => {
        const colorAttr = variant.attributes?.find(
          (attr) => attr.attributeId?.name === "Màu sắc"
        );
        return {
          ...variant,
          color: colorAttr?.attributeValueId?.value || "Không xác định",
        };
      }),
    [variants]
  );

  const dataSource = useMemo(
    () => parsedVariants.filter((v) => showHidden || !hiddenIds.has(v._id)),
    [parsedVariants, showHidden, hiddenIds]
  );

  const hiddenList = useMemo(
    () => parsedVariants.filter((v) => hiddenIds.has(v._id)),
    [parsedVariants, hiddenIds]
  );

  // Xoá biến thể
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
      setHiddenIds((prev) => {
        const next = new Set(prev);
        next.delete(_id);
        return next;
      });
      fetchProducts();
    } catch (err) {
      console.error("❌ Lỗi khi xoá:", err);
      toast.error("Xoá biến thể thất bại!");
    }
  };

  // Bắt đầu sửa
  const handleEdit = (record: Variant) => {
    setEditingId(record._id);
    setEditedData({ ...record });

    const urls = Array.isArray(record.imageUrl) ? record.imageUrl : [];
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
        record.attributes?.find((attr) => attr.attributeId?.name === "Màu sắc")
          ?.attributeValueId?.value || "",
    });

    setEditModalOpen(true);
  };

  // Hủy sửa
  const handleCancel = () => {
    setEditingId(null);
    setEditedData({});
    setEditingFileList([]);
    setEditingImageUrl([]);
    setEditModalOpen(false);
  };

  // Cập nhật dữ liệu khi sửa
  const handleChange = (key: keyof Variant, value: any) => {
    setEditedData({ ...editedData, [key]: value });
  };

  // Lưu chỉnh sửa biến thể
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

  // Thêm mới biến thể
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
          name: `${product.title} - ${values.color}`,
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

  const header = (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <strong>Biến thể sản phẩm</strong>
      <Tag color="blue">{parsedVariants.length}</Tag>
      <span style={{ color: "#888" }}>{product?.title}</span>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
        <Tooltip title="Bật để hiển thị cả những biến thể đang bị ẩn trong bảng">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#666" }}>Hiện trong bảng</span>
            <Switch checked={showHidden} onChange={setShowHidden} />
          </div>
        </Tooltip>

        {/* Nút mở Drawer xem & khôi phục đã ẩn */}
        <Badge count={hiddenList.length} size="small">
          <Button onClick={() => setHiddenDrawerOpen(true)}>Đã ẩn</Button>
        </Badge>

        <Button onClick={unhideAll} disabled={!hiddenIds.size}>
          Hiện tất cả
        </Button>
      </div>
    </div>
  );

  return (
    <div
      style={{
        background: "#e6f7ff",
        border: "1px solid #91d5ff",
        borderRadius: 10,
        padding: 12,
        marginTop: 12,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* Header */}
      {header}

      {/* Bảng */}
      <Table
        dataSource={dataSource}
        rowKey="_id"
        pagination={false}
        rowClassName={(record: Variant) => (hiddenIds.has(record._id) ? "vt-hidden-row" : "")}
        style={{ marginTop: 12 }}
      >
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
          render={(price: number) => (price ?? 0).toLocaleString() + "₫"}
        />
        <Table.Column title="Tồn kho" dataIndex="stock" />
        <Table.Column
          title="Hành động"
          render={(_, record: Variant) => {
            const isHidden = hiddenIds.has(record._id);
            return (
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
                <Button type="default" onClick={() => toggleHidden(record._id)}>
                  {isHidden ? "Hiện" : "Ẩn"}
                </Button>
              </Space>
            );
          }}
        />
      </Table>

      <div className="mt-4 text-right" style={{ marginTop: 12, textAlign: "right" }}>
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

      {/* Modal Sửa biến thể */}
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

      {/* Drawer: Biến thể đã ẩn */}
      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>Biến thể đã ẩn</span>
            <Tag color="red">{hiddenList.length}</Tag>
          </div>
        }
        placement="right"
        width={420}
        open={hiddenDrawerOpen}
        onClose={() => setHiddenDrawerOpen(false)}
        extra={
          <Space>
            <Button onClick={unhideAll} disabled={!hiddenIds.size}>
              Khôi phục tất cả
            </Button>
          </Space>
        }
      >
        {hiddenList.length === 0 ? (
          <Empty description="Không có biến thể nào đang ẩn" />
        ) : (
          <>
            <List
              itemLayout="horizontal"
              dataSource={hiddenList}
              renderItem={(item) => {
                const thumb = item.imageUrl?.[0];
                return (
                  <List.Item
                    actions={[
                      <Button key="restore" type="link" onClick={() => toggleHidden(item._id)}>
                        Khôi phục
                      </Button>,
                      <Popconfirm
                        key="delete"
                        title="Xoá biến thể này?"
                        onConfirm={() => handleDelete(item._id)}
                        okText="Xoá"
                        cancelText="Huỷ"
                        placement="left"
                      >
                        <Button type="link" danger>
                          Xoá
                        </Button>
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        thumb ? (
                          <Image src={thumb} width={48} height={48} style={{ objectFit: "cover" }} />
                        ) : (
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              background: "#f0f0f0",
                              borderRadius: 6,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#999",
                              fontSize: 10,
                            }}
                          >
                            No img
                          </div>
                        )
                      }
                      title={
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span>{item.name}</span>
                          <Tag>{item.color}</Tag>
                        </div>
                      }
                      description={
                        <div style={{ display: "flex", gap: 12, color: "#666" }}>
                          <span>Giá: {(item.price ?? 0).toLocaleString()}₫</span>
                          <span>Tồn: {item.stock}</span>
                        </div>
                      }
                    />
                  </List.Item>
                );
              }}
            />
            <Divider />
            <div style={{ textAlign: "right" }}>
              <Button onClick={() => setHiddenDrawerOpen(false)}>Đóng</Button>
            </div>
          </>
        )}
      </Drawer>


      <style>
        {`
          .vt-hidden-row {
            opacity: 0.5;
          }
        `}
      </style>
    </div>
  );
};

export default VariantTable;
