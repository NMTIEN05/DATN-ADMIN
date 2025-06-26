import React, { useEffect, useState } from "react";
import { Form, Input, Button, Card, message, Select } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import ImageUpload from "../../components/common/ImageUpload";
import type { UploadFile } from "antd/es/upload/interface";

const EditProductGroup = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // lấy id từ URL
  const [form] = Form.useForm();

  const [categories, setCategories] = useState<any[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageUrl, setImageUrl] = useState<string[]>([]);

  // Lấy categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:8888/api/category");
        setCategories(res.data);
      } catch (err) {
        console.error("Lỗi lấy danh mục:", err);
      }
    };
    fetchCategories();
  }, []);

  // Lấy thông tin nhóm sản phẩm theo ID
useEffect(() => {
  const fetchGroup = async () => {
    try {
      const res = await axios.get(`http://localhost:8888/api/productGroup/${id}`);
     
      const group = res.data;
      

      setImageUrl(Array.isArray(group.imageUrl) ? group.imageUrl : [group.imageUrl]);
      setFileList(
        (Array.isArray(group.imageUrl) ? group.imageUrl : [group.imageUrl]).map((url: string, idx: number) => ({
          uid: String(idx),
          name: `image-${idx}`,
          url,
          status: "done",
        }))
      );
      form.setFieldsValue(group);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        message.error("Không tìm thấy dòng sản phẩm");
        navigate("/dashboard/capacity"); // đúng route cần chuyển hướng về

      } else {
        message.error("Lỗi khi tải dữ liệu nhóm sản phẩm");
      }
    }
  };

  if (id) fetchGroup();
}, [id]);


  const onFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        imageUrl,
      };

      await axios.put(`http://localhost:8888/api/productGroup/${id}`, payload);
      toast.success("Cập nhật dòng sản phẩm thành công!");
      navigate("/dashboard/capacity");

    } catch (error: any) {
      console.error(error?.response?.data || error.message);
      message.error("Cập nhật dòng sản phẩm thất bại!");
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-indigo-600 mb-5">Chỉnh sửa dòng sản phẩm</h2>
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
            <Select placeholder="Chọn danh mục">
              {categories.map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>
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

          <Form.Item label="Thương hiệu" name="brand">
            <Input placeholder="Apple, Samsung..." />
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
