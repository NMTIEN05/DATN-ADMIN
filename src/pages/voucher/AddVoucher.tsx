import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Button,
  DatePicker,
  Select,
} from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const CreateCoupon = () => {
  const [form] = Form.useForm();
  const nav = useNavigate();
  const discountType = Form.useWatch('discountType', form);
  const [categories, setCategories] = useState<{ label: string; value: string }[]>([]);

  // Lấy danh mục từ backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:8888/api/category');
        const options = res.data.data.map((cat: any) => ({
          label: cat.name,
          value: cat._id,
        }));
        setCategories(options);
      } catch (err) {
        console.error('❌ Lỗi tải danh mục:', err);
        toast.error('Không thể tải danh mục!');
      }
    };

    fetchCategories();
  }, []);

  const onFinish = async (values: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Chưa đăng nhập');

      const [startDate, endDate] = values.dateRange;

      const payload = {
        code: values.code,
        discountType: values.discountType,
        discountValue: values.discountType === 'percentage' ? values.discountValue : Number(values.discountValue),
        maxDiscount:
          values.discountType === 'percentage' ? values.maxDiscount : undefined,
        usageLimit: values.usageLimit,
        minOrderValue: values.minOrderValue,
        categories: values.categories || [], // thêm categories
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      await axios.post('http://localhost:8888/api/vouchers', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('🎉 Thêm mã giảm giá thành công!');
      nav('/dashboard/vouchers');
    } catch (err: any) {
      console.error('❌ Lỗi khi thêm mã:', err);
      toast.error(
        err.response?.data?.message || 'Không thể thêm mã giảm giá!'
      );
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-indigo-600 mb-5">Thêm Mã Giảm Giá</h2>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ discountType: 'fixed', usageLimit: 1 }}
      >
        <Form.Item name="code" label="Mã giảm giá" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item
          name="discountType"
          label="Loại mã giảm"
          rules={[{ required: true }]}
        >
          <Select>
            <Select.Option value="fixed">Giảm số tiền cố định (₫)</Select.Option>
            <Select.Option value="percentage">Giảm phần trăm (%)</Select.Option>
          </Select>
        </Form.Item>

        {discountType === 'fixed' && (
          <Form.Item
            name="discountValue"
            label="Số tiền giảm (₫)"
            rules={[{ required: true }]}
          >
            <InputNumber className="w-full" min={1} addonAfter="₫" />
          </Form.Item>
        )}

        {discountType === 'percentage' && (
          <>
            <Form.Item
              name="discountValue"
              label="Phần trăm giảm (%)"
              rules={[{ required: true }]}
            >
              <InputNumber className="w-full" min={1} max={100} addonAfter="%" />
            </Form.Item>

            <Form.Item
              name="maxDiscount"
              label="Số tiền giảm tối đa (₫)"
              rules={[{ required: true }]}
            >
              <InputNumber className="w-full" min={1} addonAfter="₫" />
            </Form.Item>
          </>
        )}

        <Form.Item name="minOrderValue" label="Giá trị đơn hàng tối thiểu">
          <InputNumber className="w-full" min={0} addonAfter="₫" />
        </Form.Item>

        <Form.Item
          name="usageLimit"
          label="Số lượt sử dụng tối đa"
          rules={[{ required: true }]}
        >
          <InputNumber className="w-full" min={1} />
        </Form.Item>

        <Form.Item
          name="categories"
          label="Áp dụng cho danh mục"
        >
          <Select
            mode="multiple"
            allowClear
            placeholder="Chọn danh mục áp dụng (nếu có)"
            options={categories}
          />
        </Form.Item>

        <Form.Item
          name="dateRange"
          label="Thời gian áp dụng"
          rules={[
            { required: true, message: 'Vui lòng chọn thời gian bắt đầu và kết thúc' },
          ]}
        >
          <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Thêm mã
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateCoupon;
