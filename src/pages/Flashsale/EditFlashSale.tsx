import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  InputNumber,
  DatePicker,
  Switch,
  Spin,
  message,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

const EditFlashSale: React.FC = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: flashSale, isLoading } = useQuery({
    queryKey: ["flashsale", id],
    queryFn: async () => {
      const { data } = await axios.get(
        `${import.meta.env.VITE_PUBLIC_API_URL}api/flashsales/${id}`
      );
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (flashSale) {
      form.setFieldsValue({
        title: flashSale.title,
        products: flashSale.products.join(","),
        discountPercent: flashSale.discountPercent,
        startTime: dayjs(flashSale.startTime),
        endTime: dayjs(flashSale.endTime),
        limitQuantity: flashSale.limitQuantity,
        isActive: flashSale.isActive,
      });
    }
  }, [flashSale]);

  const onFinish = async (values: any) => {
    try {
      const payload = {
        title: values.title,
        products: values.products
          .split(",")
          .map((id: string) => id.trim())
          .filter(Boolean),
        discountPercent: values.discountPercent,
        startTime: values.startTime.toISOString(),
        endTime: values.endTime.toISOString(),
        limitQuantity: values.limitQuantity || 0,
        isActive: values.isActive ?? true,
      };

      await axios.put(
        `${import.meta.env.VITE_PUBLIC_API_URL}api/flashsales/${id}`,
        payload
      );
      toast.success("✅ Cập nhật Flash Sale thành công!");
      setTimeout(() => {
        navigate("/dashboard/flashsale");
      }, 1000);
    } catch (err: any) {
      console.error(err?.response?.data || err.message);
      message.error("❌ Cập nhật thất bại!");
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
      <h2 className="text-3xl font-bold text-indigo-600 mb-5">Chỉnh sửa Flash Sale</h2>
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Tên Flash Sale"
            name="title"
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
          >
            <Input placeholder="Flash Sale 8.8" />
          </Form.Item>

          <Form.Item
            label="Danh sách Product ID (cách nhau bằng dấu phẩy)"
            name="products"
            rules={[{ required: true, message: "Nhập danh sách product ID" }]}
          >
            <Input.TextArea rows={3} placeholder="ID1, ID2, ID3..." />
          </Form.Item>

          <Form.Item
            label="Giảm giá (%)"
            name="discountPercent"
            rules={[{ required: true, message: "Nhập mức giảm giá" }]}
          >
            <InputNumber min={1} max={100} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Thời gian bắt đầu"
            name="startTime"
            rules={[{ required: true, message: "Chọn thời gian bắt đầu" }]}
          >
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Thời gian kết thúc"
            name="endTime"
            rules={[{ required: true, message: "Chọn thời gian kết thúc" }]}
          >
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Giới hạn số lượng"
            name="limitQuantity"
            rules={[{ required: true, message: "Nhập giới hạn số lượng" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Kích hoạt" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item className="mt-6">
            <Button type="primary" htmlType="submit" block>
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditFlashSale;
