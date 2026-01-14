import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  message,
  Select,
} from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import type { UploadFile } from "antd/es/upload/interface";
import ImageUpload from "../../components/common/ImageUpload";

const CreateProduct = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageUrl, setImageUrl] = useState<string[]>([]);

  const [categories, setCategories] = useState<any[]>([]);
  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<any[]>([]);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [catRes, groupRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_PUBLIC_API_URL}api/category`),
          axios.get(`${import.meta.env.VITE_PUBLIC_API_URL}api/productGroup`),
        ]);

        setCategories(catRes.data.data);
        setAllGroups(groupRes.data.data);
      } catch (err) {
        console.error("❌ Lỗi fetch dữ liệu:", err);
        message.error("Không thể tải dữ liệu ban đầu");
      }
    };
    fetchInitial();
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    const filtered = allGroups.filter((group) => group.categoryId?._id === categoryId);
    setFilteredGroups(filtered);
    form.setFieldValue("groupId", undefined);
  };

  const onFinish = async (values: any) => {
    console.log("🖼️ imageUrl hiện tại:", imageUrl);

    if (!imageUrl || imageUrl.length === 0 || imageUrl[0].startsWith("blob:")) {
      message.error("❌ Vui lòng tải ít nhất 1 ảnh sản phẩm hợp lệ!");
      return;
    }

    // 💡 Check thêm các trường bắt buộc
    const requiredFields = ["title", "slug", "capacity", "priceDefault", "groupId", "categoryId"];
    for (const field of requiredFields) {
      if (!values[field]) {
        message.error(`Trường "${field}" là bắt buộc`);
        return;
      }
    }

    const payload = {
      title: values.title,
      slug: values.slug,
      capacity: values.capacity,
      description: values.description || "",
      shortDescription: values.shortDescription || "",
      imageUrl,
      priceDefault: values.priceDefault,
      categoryId: values.categoryId,
      groupId: values.groupId,
    };

    try {
      console.log("📦 Payload gửi lên:", payload);
      await axios.post(`${import.meta.env.VITE_PUBLIC_API_URL}api/product`, payload);

      toast.success("✅ Tạo sản phẩm thành công!");
      setTimeout(() => navigate("/dashboard/product"), 1500);
    } catch (err: any) {
      console.error("❌ Lỗi tạo sản phẩm:", err.response?.data || err.message);
      message.error("Tạo sản phẩm thất bại!");
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-indigo-600 mb-5">Thêm sản phẩm</h2>
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Tên sản phẩm" name="title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Slug" name="slug" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <ImageUpload
            fileList={fileList}
            setFileList={setFileList}
            setImageUrl={(urls) => {
              console.log("✅ Đã set ảnh từ ImageUpload:", urls);
              setImageUrl(urls);
            }}
            maxCount={5}
          />

          <Form.Item label="Danh mục" name="categoryId" rules={[{ required: true }]}>
            <Select placeholder="Chọn danh mục" onChange={handleCategoryChange}>
              {categories.map((cat) => (
                <Select.Option key={cat._id} value={cat._id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Dòng sản phẩm (seri)" name="groupId" rules={[{ required: true }]}>
            <Select placeholder="Chọn dòng sản phẩm">
              {filteredGroups.map((g) => (
                <Select.Option key={g._id} value={g._id}>
                  {g.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Dung lượng" name="capacity" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Giá sản phẩm" name="priceDefault" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>

          <Form.Item label="Mô tả ngắn" name="shortDescription">
            <Input />
          </Form.Item>

          <Form.Item label="Mô tả chi tiết" name="description">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Tạo sản phẩm
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateProduct;
