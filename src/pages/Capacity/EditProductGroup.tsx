import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, message, Spin } from "antd";
import axios from "axios";
import { toast } from "react-toastify";
import ImageUpload from "../../components/common/ImageUpload";
import type { UploadFile } from "antd/es/upload/interface";

const EditProductGroup = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  // const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<string>("");

  // Fetch dữ liệu dòng sản phẩm
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`http://localhost:8888/api/productGroup/${id}`);
        form.setFieldsValue(data);

        // Gán ảnh vào fileList hiển thị trước
        if (data.imageUrl) {
          setFileList([
            {
              uid: "-1",
              name: "Ảnh hiện tại",
              status: "done",
              url: data.imageUrl,
            },
          ]);
        }

        setLoading(false);
      } catch (error) {
        message.error("Lỗi tải dữ liệu sản phẩm");
        setLoading(false);
      }
    };

    fetchData();
  }, [id, form]);

  const onFinish = async (values: any) => {
    try {
      let imageUrl = values.imageUrl;
      if (imageFile) {
        // Gửi ảnh mới lên Cloudinary (giả lập)
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", "your_preset_here");

        const res = await axios.post("https://api.cloudinary.com/v1_1/your_cloud_name/image/upload", formData);
        imageUrl = res.data.secure_url;
      }

      const payload = { ...values, imageUrl };
      await axios.put(`http://localhost:8888/api/productGroup/${id}`, payload);

      toast.success("Cập nhật dòng sản phẩm thành công!");
      navigate("/dashboard/product-groups");
    } catch (error) {
      message.error("Cập nhật thất bại!");
    }
  };

  if (loading) return <Spin />;

  return (
    <div>
      <h2 className="text-3xl font-bold text-indigo-600 mb-5">Chỉnh sửa dòng sản phẩm</h2>
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Tên dòng sản phẩm" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Slug" name="slug" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="imageUrl" rules={[{ required: true, message: "Vui lòng chọn ảnh!" }]}>
            <ImageUpload
              fileList={fileList}
              setFileList={setFileList}
              setImageFile={setImageFile}
            />
          </Form.Item>

          <Form.Item label="Mô tả ngắn" name="shortDescription">
            <Input />
          </Form.Item>

          <Form.Item label="Mô tả chi tiết" name="description">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item label="Thương hiệu" name="brand">
            <Input />
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

export default EditProductGroup;
