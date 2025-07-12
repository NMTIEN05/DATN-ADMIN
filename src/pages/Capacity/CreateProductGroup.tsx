import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Select,
} from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import ImageUpload from "../../components/common/ImageUpload";
import type { UploadFile } from "antd/es/upload/interface";

const CreateProductGroup = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [categories, setCategories] = useState<any[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageUrl, setImageUrl] = useState<string[]>([]);

  // 👉 Lấy danh sách danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:8888/api/category");
        setCategories(res.data?.data || []);
      } catch (err) {
        console.error("Lỗi lấy danh mục:", err);
      }
    };

    fetchCategories();
  }, []);

  const onFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        imageUrl,
      };

      await axios.post("http://localhost:8888/api/productGroup", payload);
      toast.success("Tạo dòng sản phẩm thành công!");
      setTimeout(() => {
        navigate("/dashboard/capacity");
      }, 1200);
    } catch (error: any) {
      console.error(error?.response?.data || error.message);
      message.error("Tạo dòng sản phẩm thất bại!");
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-indigo-600 mb-5">Thêm dòng sản phẩm</h2>
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Tên dòng sản phẩm"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
          >
            <Input placeholder="Ví dụ: iPhone 16" />
          </Form.Item>

          <Form.Item
            label="Slug"
            name="slug"
            rules={[{ required: true, message: "Vui lòng nhập slug!" }]}
          >
            <Input placeholder="Ví dụ: iphone-16" />
          </Form.Item>
         
          

          {/* Ảnh */}
          <ImageUpload
            fileList={fileList}
            setFileList={setFileList}
            setImageUrl={setImageUrl}
            maxCount={5}
          />
       

          <Form.Item
            label="Danh mục"
            name="categoryId"
            rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
          >
            <Select placeholder="Chọn danh mục" allowClear>
              {categories.map((cat) => (
                <Select.Option key={cat._id} value={cat._id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Mô tả ngắn" name="shortDescription">
            <Input placeholder="Mô tả ngắn dòng sản phẩm" />
          </Form.Item>

          <Form.Item label="Mô tả chi tiết" name="description">
            <Input.TextArea rows={4} placeholder="Thông tin chi tiết..." />
          </Form.Item>

          <Form.Item label="Thương hiệu" name="brand" initialValue="Apple">
            <Input placeholder="Apple, Samsung..." />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Tạo dòng sản phẩm
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateProductGroup;
