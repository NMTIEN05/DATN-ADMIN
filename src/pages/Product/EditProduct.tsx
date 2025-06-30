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
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import type { UploadFile } from "antd/es/upload/interface";
import ImageUpload from "../../components/common/ImageUpload";
import { toast } from "react-toastify";

const EditProduct = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams(); // 👈 lấy productId từ URL

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageUrl, setImageUrl] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

useEffect(() => {
  const fetchInitial = async () => {
    try {
      const [catRes, groupRes, productRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_PUBLIC_API_URL}api/category`),
        axios.get(`${import.meta.env.VITE_PUBLIC_API_URL}api/productGroup`),
        axios.get(`${import.meta.env.VITE_PUBLIC_API_URL}api/product/${id}`),
      ]);

      setCategories(catRes.data);
      setGroups(groupRes.data);

      const product = productRes.data;
      setImageUrl(product.imageUrl);

      // ✅ Convert imageUrl -> fileList để preview ảnh
      const convertedFileList: UploadFile[] = (product.imageUrl || []).map(
        (url: string, index: number) => ({
          uid: `${index}`,
          name: `Ảnh ${index + 1}`,
          status: "done",
          url,
        })
      );
      setFileList(convertedFileList);

      form.setFieldsValue({
        title: product.title,
        slug: product.slug,
        shortDescription: product.shortDescription,
        description: product.description,
        capacity: product.capacity,
        categoryId: product.categoryId?._id,
        groupId: product.groupId?._id,
      });
    } catch (err) {
      message.error("Không thể tải dữ liệu sản phẩm");
      console.error(err);
    }
  };

  fetchInitial();
}, [id]);


  const onFinish = async (values: any) => {
    try {
      if (
        !imageUrl ||
        imageUrl.length === 0 ||
        imageUrl[0].startsWith("blob:")
      ) {
        message.error("Vui lòng tải ít nhất 1 ảnh sản phẩm hợp lệ!");
        return;
      }

      const payload = {
        title: values.title,
        slug: values.slug,
        description: values.description,
        shortDescription: values.shortDescription,
        imageUrl: imageUrl,
        capacity: values.capacity,
        categoryId: values.categoryId,
        groupId: values.groupId,
        price: values.price,
      };

      await axios.put(
        `${import.meta.env.VITE_PUBLIC_API_URL}api/product/${id}`,
        payload
      );

      toast.success("Cập nhật sản phẩm thành công!");
      setTimeout(() => navigate("/dashboard/product"), 1500);
    } catch (err: any) {
      console.error(
        "❌ Lỗi cập nhật sản phẩm: ",
        err.response?.data || err.message
      );
      message.error("Cập nhật thất bại!");
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-indigo-600 mb-5">
        Chỉnh sửa sản phẩm
      </h2>
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Tên sản phẩm"
            name="title"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Slug"
            name="slug"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <ImageUpload
            fileList={fileList}
            setFileList={setFileList}
            setImageUrl={setImageUrl}
            maxCount={5}
          />

          <Form.Item
            label="Giá"
            name="price"
            rules={[{ required: true, message: "Vui lòng nhập giá sản phẩm" }]}
          >
            <InputNumber
              className="w-full"
              min={0}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>

          <Form.Item
            label="Danh mục"
            name="categoryId"
            rules={[{ required: true }]}
          >
            <Select placeholder="Chọn danh mục">
              {categories.map((cat) => (
                <Select.Option key={cat._id} value={cat._id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Dòng sản phẩm"
            name="groupId"
            rules={[{ required: true }]}
          >
            <Select placeholder="Chọn dòng sản phẩm">
              {groups.map((g) => (
                <Select.Option key={g._id} value={g._id}>
                  {g.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Mô tả ngắn" name="shortDescription">
            <Input />
          </Form.Item>

          <Form.Item label="Mô tả chi tiết" name="description">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item label="Dung lượng" name="capacity">
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Cập nhật sản phẩm
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditProduct;
