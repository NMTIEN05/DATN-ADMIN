import React, { useState } from "react";
import { Upload, message, Form, Input, Button, Card } from "antd";
import ImgCrop from "antd-img-crop";
import { PlusOutlined } from "@ant-design/icons";
import { uploadImageToCloudinary } from "../../utils/cloudinaryUpload";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import type { UploadFile } from "antd/es/upload/interface";
import ImageUpload from "../../components/common/ImageUpload";

const CreateCategory = () => {
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    if (!imageFile) {
      message.error("Vui lòng chọn ảnh!");
      return;
    }

    try {
      const imageUrl = await uploadImageToCloudinary(imageFile);
      const body = {
        name: values.name,
        description: values.description,
        imageUrl,
      };

      await axios.post("http://localhost:8888/api/category", body);
      toast.success("Thêm danh mục thành công!");
      setTimeout(() => {
        navigate("/dashboard/category");
      }, 1500);
    } catch (err: any) {
      console.error(err?.response?.data || err.message);
      message.error("Tạo danh mục thất bại!");
    }
  };

  const handleUploadChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList);
    const latestFile = newFileList[0];
    if (latestFile?.originFileObj) {
      setImageFile(latestFile.originFileObj as File);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-indigo-600 mb-5">Thêm mới Danh Mục</h2>
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
              Tạo danh mục
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateCategory;
