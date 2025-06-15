import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const CreateProduct = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  // Gọi API lấy danh sách danh mục
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const { data } = await axios.get("http://localhost:8888/api/category");
        setCategories(data); // Cập nhật danh mục vào state
      } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
      }
    };

    fetchCategory();
  }, []);

  // Xử lý tạo sản phẩm
  const onFinish = async (values: any) => {
    try {
      await axios.post("http://localhost:8888/api/product", values);
      toast.success("Thêm sản phẩm thành công!");
      form.resetFields();
      setTimeout(() => {
        navigate("/dashboard/product");
      }, 1500);
    } catch (err) {
      console.error(err);
      message.error("Tạo sản phẩm thất bại!");
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-indigo-600 mb-5">
        Thêm mới Sản Phẩm
      </h2>
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Tên sản phẩm"
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

          <Form.Item
            label="Danh mục"
            name="categoryId"
            rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
          >
            <Select placeholder="Chọn danh mục">
              {categories.map((cat: any) => (
                <Select.Option key={cat._id} value={cat._id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.List
            name="variants"
            rules={[
              {
                validator: async (_, value) =>
                  !value || value.length < 1
                    ? Promise.reject(new Error("Thêm ít nhất 1 biến thể!"))
                    : Promise.resolve(),
              },
            ]}
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} size="small" style={{ marginBottom: 12 }}>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                      <Form.Item
                        {...restField}
                        name={[name, "color"]}
                        label="Màu"
                        rules={[{ required: true }]}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "storage"]}
                        label="Dung lượng"
                        rules={[{ required: true }]}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "price"]}
                        label="Giá"
                        rules={[{ required: true }]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          min={0}
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                         
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "stock"]}
                        label="Tồn kho"
                        rules={[{ required: true }]}
                      >
                        <InputNumber style={{ width: "100%" }} min={0} />
                      </Form.Item>
                      <Form.Item label=" ">
                        <Button
                          danger
                          type="primary"
                          onClick={() => remove(name)}
                        >
                          Xoá
                        </Button>
                      </Form.Item>
                    </div>
                  </Card>
                ))}
                <Form.Item>
                  <Button onClick={() => add()} block>
                    + Thêm biến thể
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

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
