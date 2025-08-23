import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  InputNumber,
  DatePicker,
  Switch,
  Select,
  Spin,
  message,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const EditFlashSale: React.FC = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();

  const [productOptions, setProductOptions] = useState<any[]>([]);
  const [variantOptions, setVariantOptions] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);

  // ✅ Fetch flash sale theo ID
  const { data: flashSale, isLoading } = useQuery({
    queryKey: ["flashsale", id],
    queryFn: async () => {
      const { data } = await axios.get(`${import.meta.env.VITE_PUBLIC_API_URL}api/flashsale/${id}`);
      return data.data; // trả về thẳng object flashSale
    },
    enabled: !!id,
  });

  // ✅ Fetch all products
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const { data } = await axios.get(`${import.meta.env.VITE_PUBLIC_API_URL}api/product?limit=9999`);
      setProductOptions(data.data || []);
    } catch (err) {
      message.error("Không thể tải sản phẩm");
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ Fetch variants khi chọn product
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
  

  // ✅ Set form khi có flashSale
  useEffect(() => {
    if (flashSale) {
      form.setFieldsValue({
        product: flashSale.product?._id,
        variant: flashSale.variant?._id,
        salePrice: flashSale.salePrice,
        quantity: flashSale.quantity,
        discountPercent: flashSale.discountPercent,
        startTime: flashSale.startTime ? dayjs(flashSale.startTime) : null,
        endTime: flashSale.endTime ? dayjs(flashSale.endTime) : null,
        limitQuantity: flashSale.limitQuantity ?? 0,
        isActive: flashSale.isActive ?? true,
      });

      // Load variant options cho product hiện tại
      if (flashSale.product?._id) handleProductChange(flashSale.product._id);
    }
  }, [flashSale]);

  // ✅ Submit
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

      await axios.put(`${import.meta.env.VITE_PUBLIC_API_URL}api/flashsale/${id}`, payload);
      toast.success("✅ Cập nhật Flash Sale thành công!");
      navigate("/dashboard/flashsale");
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
          {/* Chọn sản phẩm */}
          <Form.Item label="Sản phẩm" name="product" rules={[{ required: true }]}>
            <Select
              placeholder="Chọn sản phẩm"
              loading={loadingProducts}
              onChange={handleProductChange}
              options={productOptions.map(p => ({ label: p.title, value: p._id }))}
            />
          </Form.Item>

          {/* Chọn biến thể */}
          <Form.Item label="Biến thể" name="variant" rules={[{ required: true }]}>
            <Select
              placeholder="Chọn biến thể"
              loading={loadingVariants}
              options={variantOptions.map(v => ({ label: `${v.name} - ${v.price.toLocaleString()}đ`, value: v._id }))}
            />
          </Form.Item>

          {/* Giá sale */}
          <Form.Item label="Giá Sale" name="salePrice" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          {/* Số lượng */}
          <Form.Item label="Số lượng" name="quantity" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          {/* Discount */}
          <Form.Item label="Giảm giá (%)" name="discountPercent" rules={[{ required: true }]}>
            <InputNumber min={1} max={100} style={{ width: "100%" }} />
          </Form.Item>

          {/* Thời gian */}
          <Form.Item label="Thời gian bắt đầu" name="startTime" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Thời gian kết thúc" name="endTime" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>

          {/* Giới hạn số lượng */}
          <Form.Item label="Giới hạn số lượng" name="limitQuantity">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          {/* Kích hoạt */}
          <Form.Item label="Kích hoạt" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Cập nhật Flash Sale
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditFlashSale;
