import React, { useEffect, useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import ImageUpload from "../../components/common/ImageUpload";
import type { UploadFile } from "antd/es/upload/interface";

const CreateProductGroup = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageFile, setImageFile] = useState<string>("");

  useEffect(() => {
    if (imageFile) {
      form.setFieldsValue({ imageUrl: imageFile });
    }
  }, [imageFile]);

  const onFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        imageUrl: imageFile,
      };

      await axios.post("http://localhost:8888/api/productGroup", payload);
      toast.success("Tạo dòng sản phẩm thành công!");
      setTimeout(() => {
        navigate("/dashboard/product-groups");
      }, 1500);
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

<Form.Item name="imageUrl" rules={[{ required: true, message: "Chọn ảnh!" }]}>
  <ImageUpload
    fileList={fileList}
    setFileList={setFileList}
    setImageFile={setImageFile}
  />
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
