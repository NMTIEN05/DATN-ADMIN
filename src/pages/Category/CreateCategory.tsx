import React, { useState } from "react";
import { Form, Input, Button, Card, message, type UploadFile } from "antd";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import ImageUpload from "../../components/common/ImageUpload";

const CreateCategory = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageUrl, setImageUrl] = useState<string[]>([]); // mảng ảnh

  const onFinish = async (values: any) => {
    try {
      // Kiểm tra ảnh hợp lệ (không để blob)
      if (!imageUrl || imageUrl.length === 0 || imageUrl[0].startsWith("blob:")) {
        message.error("Vui lòng tải ảnh danh mục hợp lệ!");
        return;
      }

      const payload = {
        name: values.name,
        description: values.description || "",
        imageUrl: imageUrl, // ✅ gửi dưới dạng mảng
      };

      console.log("📤 Payload gửi đi:", payload);

      await axios.post(`${import.meta.env.VITE_PUBLIC_API_URL}api/category`, payload);

      toast.success("✅ Tạo danh mục thành công!");
      setTimeout(() => {
        navigate("/dashboard/category");
      }, 1500);
    } catch (err: any) {
      console.error("❌ Lỗi tạo danh mục:", err?.response?.data || err.message);
      message.error("Tạo danh mục thất bại!");
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-indigo-600 mb-5">Thêm danh mục</h2>
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Tên danh mục"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
          >
            <Input placeholder="Ví dụ: Phụ kiện Apple" />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input.TextArea rows={4} placeholder="Thông tin mô tả danh mục..." />
          </Form.Item>

          <Form.Item label="Ảnh đại diện">
            <ImageUpload
              fileList={fileList}
              setFileList={setFileList}
              setImageUrl={setImageUrl}
              maxCount={10}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Tạo danh mục
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateCategory;
