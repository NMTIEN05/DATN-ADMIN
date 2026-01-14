import React, { useEffect, useState } from "react";
import { Form, Input, Button, Card, message, Spin } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import type { UploadFile } from "antd/es/upload/interface";
import ImageUpload from "../../components/common/ImageUpload";

const UpdateCategory: React.FC = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageUrl, setImageUrl] = useState<string[]>([]);

  // ✅ Fetch category by ID
  const { data: category, isLoading } = useQuery({
    queryKey: ["category", id],
    queryFn: async () => {
      const { data } = await axios.get(`http://localhost:8888/api/category/${id}`);
      return data;
    },
    enabled: !!id,
  });

  // ✅ Gán dữ liệu khi load xong
  useEffect(() => {
    if (category) {
      form.setFieldsValue({
        name: category.name,
        description: category.description,
      });

      if (Array.isArray(category.imageUrl)) {
        setImageUrl(category.imageUrl);
        setFileList(
          category.imageUrl.map((url: string, index: number) => ({
            uid: String(index),
            name: `image-${index}`,
            status: "done",
            url,
          }))
        );
      } else {
        setImageUrl([category.imageUrl]);
        setFileList([
          {
            uid: "0",
            name: "image",
            status: "done",
            url: category.imageUrl,
          },
        ]);
      }
    }
  }, [category]);

  const onFinish = async (values: any) => {
    try {
      if (!imageUrl || imageUrl.length === 0 || imageUrl[0].startsWith("blob:")) {
        message.error("Vui lòng tải ít nhất 1 ảnh hợp lệ!");
        return;
      }

      const body = {
        name: values.name,
        description: values.description,
        imageUrl,
      };

      await axios.put(`http://localhost:8888/api/category/${id}`, body);
      toast.success("Cập nhật danh mục thành công!");
      setTimeout(() => {
        navigate("/dashboard/category");
      }, 1500);
    } catch (err: any) {
      console.error(err?.response?.data || err.message);
      message.error("Cập nhật danh mục thất bại!");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-indigo-600 mb-5">Chỉnh sửa Danh Mục</h2>
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Tên danh mục"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <ImageUpload
            fileList={fileList}
            setFileList={setFileList}
            setImageUrl={setImageUrl}
            maxCount={10}
          />

          <Form.Item className="mt-6">
            <Button type="primary" htmlType="submit" block>
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UpdateCategory;
