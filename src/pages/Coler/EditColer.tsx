import React, { useEffect, useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const EditColor = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const fetchColor = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8888/api/colors/${id}`);
      form.setFieldsValue(res.data);
    } catch (err) {
      message.error("Không lấy được thông tin màu!");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    try {
      await axios.put(`http://localhost:8888/api/colors/${id}`, values);
      toast.success("Cập nhật màu thành công!");
      setTimeout(() => navigate("/dashboard/colors"), 1500);
    } catch (err) {
      message.error("Cập nhật thất bại!");
    }
  };

  useEffect(() => {
    fetchColor();
  }, [id]);

  return (
    <div>
      <h2 className="text-3xl font-bold text-green-600 mb-5">Chỉnh sửa Màu</h2>
      <Card loading={loading}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Tên màu"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên màu!" }]}
          >
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

export default EditColor;
