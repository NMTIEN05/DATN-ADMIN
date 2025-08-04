import React, { useState } from "react";
import { Form, Input, Button, Card, DatePicker, InputNumber, Switch, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const CreateFlashSale = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      const payload = {
        title: values.title,
        products: values.products.split(",").map((id: string) => id.trim()), // giả sử nhập ID bằng dấu phẩy
        discountPercent: values.discountPercent,
        startTime: values.startTime.toISOString(),
        endTime: values.endTime.toISOString(),
        limitQuantity: values.limitQuantity || 0,
        isActive: values.isActive ?? true,
      };

      await axios.post(`${import.meta.env.VITE_PUBLIC_API_URL}api/flashsales`, payload);
      toast.success("✅ Tạo Flash Sale thành công!");
      navigate("/admin/flashsale");
    } catch (err: any) {
      console.error(err);
      message.error("Tạo Flash Sale thất bại!");
    }
  };

  return (
    <Card title="Tạo Flash Sale">
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item name="title" label="Tên Flash Sale" rules={[{ required: true }]}>
          <Input placeholder="VD: Flash Sale cuối tuần" />
        </Form.Item>

        <Form.Item
          name="products"
          label="Danh sách Product ID (phân cách bằng dấu phẩy)"
          rules={[{ required: true }]}
        >
          <Input.TextArea placeholder="Ví dụ: 64a5fd2e4b...,64a5fd2e4c..." rows={3} />
        </Form.Item>

        <Form.Item name="discountPercent" label="Giảm giá (%)" rules={[{ required: true }]}>
          <InputNumber min={1} max={100} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="startTime" label="Bắt đầu" rules={[{ required: true }]}>
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="endTime" label="Kết thúc" rules={[{ required: true }]}>
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="limitQuantity" label="Giới hạn số lượng">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
          <Switch defaultChecked />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Tạo mới
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateFlashSale;
