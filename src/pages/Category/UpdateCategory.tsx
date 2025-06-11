import React, { useEffect, useState } from "react";
import { Upload, message, Form, Input, Button, Card, Spin } from "antd";
import ImgCrop from "antd-img-crop";
import { PlusOutlined } from "@ant-design/icons";
import { uploadImageToCloudinary } from "../../utils/cloudinaryUpload";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import type { UploadFile } from "antd/es/upload/interface";
import { useQuery } from "@tanstack/react-query";
import ImageUpload from "../../components/common/ImageUpload";

const UpdateCategory: React.FC = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const navigate = useNavigate();

  // ✅ Fetch data bằng useQuery
  const { data: category, isLoading } = useQuery({
    queryKey: ["category", id],
    queryFn: async () => {
      const { data } = await axios.get(`http://localhost:8888/api/category/${id}`);
      return data;
    },
    enabled: !!id, // chỉ fetch khi có id
  });

  // ✅ Gán dữ liệu vào form sau khi load xong
  useEffect(() => {
    if (category) {
      form.setFieldsValue({
        name: category.name,
        description: category.description,
      });

      setFileList([
        {
          uid: "-1",
          name: "image.png",
          status: "done",
          url: category.imageUrl,
        },
      ]);
    }
  }, [category]);

  const onFinish = async (values: any) => {
    try {
      let imageUrl = fileList[0]?.url || "";

      // Nếu có ảnh mới
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
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

  const handleUploadChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList);
    const latestFile = newFileList[0];
    if (latestFile?.originFileObj) {
      setImageFile(latestFile.originFileObj as File);
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
       <h2 className="text-3xl font-bold text-indigo-600 mb-5">Chỉnh Sửa Danh Mục</h2>
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

             <Form.Item label="Ảnh đại diện">
  <ImageUpload
    fileList={fileList}
    setFileList={setFileList}
    setImageFile={setImageFile}
  />
</Form.Item>

          <Form.Item>
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
