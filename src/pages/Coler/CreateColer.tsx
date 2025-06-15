import React from "react";
import { Form, Input, Button, Card, message } from "antd";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const CreateColor = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: { name: string }) => {
    try {
      await axios.post("http://localhost:8888/api/color", values);
      toast.success("Thêm màu thành công!");
      form.resetFields();
      setTimeout(() => navigate("/dashboard/color"), 1500);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Thêm màu thất bại!");
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-green-600 mb-5">Thêm mới Màu</h2>
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Tên màu"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên màu!" }]}
          >
            <Input placeholder="VD: Đỏ, Xanh, Tím..." />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Tạo màu
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateColor;
