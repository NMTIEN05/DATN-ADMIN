import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, InputNumber, Button, DatePicker, Switch, Card, message } from "antd";
import axios from "axios";
import dayjs from "dayjs";

const EditFlashSale = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const fetchFlashSale = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_PUBLIC_API_URL}api/flashsales/${id}`);
      form.setFieldsValue({
        ...data,
        products: data.products.join(","),
        startTime: dayjs(data.startTime),
        endTime: dayjs(data.endTime),
      });
      setLoading(false);
    } catch (err) {
      message.error("Không thể tải dữ liệu Flash Sale");
    }
  };

  const onFinish = async (values: any) => {
    try {
      const payload = {
        title: values.title,
        products: values.products.split(",").map((id: string) => id.trim()),
        discountPercent: values.discountPercent,
        startTime: values.startTime.toISOString(),
        endTime: values.endTime.toISOString(),
        limitQuantity: values.limitQuantity || 0,
        isActive: values.isActive ?? true,
      };

      await axios.put(`${import.meta.env.VITE_PUBLIC_API_URL}api/flashsales/${id}`, payload);
      message.success("Cập nhật thành công!");
      navigate("/admin/flashsale");
    } catch (err) {
      message.error("Cập nhật thất bại!");
    }
  };

  useEffect(() => {
    fetchFlashSale();
  }, []);

  if (loading) return <p>Đang tải dữ liệu...</p>;

  return (
    <Card title="Chỉnh sửa Flash Sale">
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item name="title" label="Tên Flash Sale" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item
          name="products"
          label="Danh sách Product ID (phân cách bằng dấu phẩy)"
          rules={[{ required: true }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item name="discountPercent" label="Giảm giá (%)" rules={[{ required: true }]}>
          <InputNumber min={1} max={100} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="startTime" label="Thời gian bắt đầu" rules={[{ required: true }]}>
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="endTime" label="Thời gian kết thúc" rules={[{ required: true }]}>
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="limitQuantity" label="Giới hạn số lượng">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default EditFlashSale;
