import React from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  DatePicker,
  Switch,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const CreateFlashSale = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      // ⚠️ Kiểm tra đầu vào sản phẩm
      const productIds = values.products
        .split(",")
        .map((id: string) => id.trim())
        .filter((id: string) => id.length > 0);

      if (productIds.length === 0) {
        message.error("Vui lòng nhập ít nhất 1 ID sản phẩm hợp lệ!");
        return;
      }

      const payload = {
        title: values.title,
        products: productIds,
        discountPercent: values.discountPercent,
        startTime: values.startTime.toISOString(),
        endTime: values.endTime.toISOString(),
        limitQuantity: values.limitQuantity || 0,
        isActive: values.isActive ?? true,
      };

      console.log("📤 Payload gửi đi:", payload);

      await axios.post(
        `${import.meta.env.VITE_PUBLIC_API_URL}api/flashsale`,
        payload
      );

      toast.success("✅ Tạo Flash Sale thành công!");
      setTimeout(() => {
        navigate("/dashboard/flashsale");
      }, 1500);
    } catch (err: any) {
      console.error("❌ Lỗi tạo Flash Sale:", err?.response?.data || err.message);
      message.error("Tạo Flash Sale thất bại!");
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-indigo-600 mb-5">
        Tạo Flash Sale
      </h2>
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Tên Flash Sale"
            name="title"
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
          >
            <Input placeholder="Ví dụ: Khuyến mãi cuối tuần" />
          </Form.Item>

          <Form.Item
            label="Danh sách ID sản phẩm (phân cách bằng dấu phẩy)"
            name="products"
            rules={[
              { required: true, message: "Vui lòng nhập danh sách sản phẩm!" },
            ]}
          >
            <Input.TextArea
              placeholder="68734193eb6306797d041bc5, 68627699684b50f03210f87e, ..."
              rows={3}
            />
          </Form.Item>

          <Form.Item
            label="Phần trăm giảm giá"
            name="discountPercent"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập số phần trăm giảm giá!",
              },
            ]}
          >
            <InputNumber
              min={1}
              max={100}
              style={{ width: "100%" }}
              placeholder="Ví dụ: 25"
            />
          </Form.Item>

          <Form.Item
            label="Thời gian bắt đầu"
            name="startTime"
            rules={[
              { required: true, message: "Vui lòng chọn thời gian bắt đầu!" },
            ]}
          >
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Thời gian kết thúc"
            name="endTime"
            rules={[
              { required: true, message: "Vui lòng chọn thời gian kết thúc!" },
            ]}
          >
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Giới hạn số lượng" name="limitQuantity">
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="Ví dụ: 50"
            />
          </Form.Item>

          <Form.Item
            label="Kích hoạt"
            name="isActive"
            valuePropName="checked"
          >
            <Switch defaultChecked />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Tạo Flash Sale
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateFlashSale;
