import React, { useEffect, useState } from "react";
import {
  Form,
  InputNumber,
  Button,
  Card,
  DatePicker,
  Switch,
  message,
  Select,
  Spin,
} from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const CreateFlashSale = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [productOptions, setProductOptions] = useState<any[]>([]);
  const [variantOptions, setVariantOptions] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);

  // ✅ Gọi API lấy danh sách sản phẩm
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const { data } = await axios.get(
          `${import.meta.env.VITE_PUBLIC_API_URL}api/product?limit=9999`
        );
        setProductOptions(data.data || []);
      } catch (error) {
        message.error("Không thể tải danh sách sản phẩm");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // ✅ Khi chọn sản phẩm -> load danh sách biến thể
  const handleProductChange = async (productId: string) => {
  // Reset variant khi đổi sản phẩm
  form.setFieldsValue({ variant: undefined });
  if (!productId) return;

  try {
    console.log("🔹 Selected productId:", productId);
    setLoadingVariants(true);
    console.log("⏳ Đang gọi API lấy biến thể...");

    const { data } = await axios.get(
      `${import.meta.env.VITE_PUBLIC_API_URL}api/variants/product/${productId}/variant`
    );

    console.log("✅ API trả về:", data);

    // Nếu API trả về trực tiếp mảng variant, dùng data
    const variants = Array.isArray(data) ? data : data.data || [];
    setVariantOptions(variants);

    console.log("🔹 Variant options set:", variants);
  } catch (error) {
    console.error("❌ Lỗi khi gọi API biến thể:", error);
    message.error("Không thể tải biến thể sản phẩm");
  } finally {
    setLoadingVariants(false);
    console.log("⏹️ Loading variants kết thúc");
  }
};
  
  // ✅ Submit form
  const onFinish = async (values: any) => {
    try {
      const payload = {
        product: values.product,
        variant: values.variant,
        salePrice: values.salePrice,
        quantity: values.quantity,
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
      message.error(err?.response?.data?.message || "Tạo Flash Sale thất bại!");
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-indigo-600 mb-5">
        Tạo Flash Sale
      </h2>
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {/* Chọn sản phẩm */}
          <Form.Item
            label="Chọn sản phẩm"
            name="product"
            rules={[{ required: true, message: "Vui lòng chọn sản phẩm!" }]}
          >
            <Select
              loading={loadingProducts}
              placeholder="Chọn sản phẩm"
              showSearch
              optionFilterProp="label"
              onChange={handleProductChange}
              options={productOptions.map((product: any) => ({
                label: product.title,
                value: product._id,
              }))}
            />
          </Form.Item>

          {/* Chọn biến thể */}
          <Form.Item
            label="Chọn biến thể"
            name="variant"
            rules={[{ required: true, message: "Vui lòng chọn biến thể!" }]}
          >
            <Select
              loading={loadingVariants}
              placeholder="Chọn biến thể"
              showSearch
              optionFilterProp="label"
              options={variantOptions.map((variant: any) => ({
                label: `${variant.name} - ${variant.price.toLocaleString()}đ`,
                value: variant._id,
              }))}
            />
          </Form.Item>

          {/* Giá flash sale */}
          <Form.Item
            label="Giá khuyến mãi"
            name="salePrice"
            rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          {/* Số lượng */}
          <Form.Item
            label="Số lượng"
            name="quantity"
            rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          {/* % giảm */}
          <Form.Item
            label="Phần trăm giảm giá"
            name="discountPercent"
            rules={[{ required: true, message: "Vui lòng nhập phần trăm!" }]}
          >
            <InputNumber min={1} max={100} style={{ width: "100%" }} />
          </Form.Item>

          {/* Thời gian */}
          <Form.Item
            label="Thời gian bắt đầu"
            name="startTime"
            rules={[{ required: true, message: "Vui lòng chọn thời gian!" }]}
          >
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Thời gian kết thúc"
            name="endTime"
            rules={[{ required: true, message: "Vui lòng chọn thời gian!" }]}
          >
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>

          {/* Giới hạn số lượng */}
          <Form.Item label="Giới hạn số lượng" name="limitQuantity">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          {/* Active */}
          <Form.Item label="Kích hoạt" name="isActive" valuePropName="checked">
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
