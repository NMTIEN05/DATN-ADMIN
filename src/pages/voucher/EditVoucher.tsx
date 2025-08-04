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
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const EditCoupon = () => {
  const [form] = Form.useForm();
  const nav = useNavigate();
  const { id } = useParams();
  const discountType = Form.useWatch('discountType', form);
  const [categories, setCategories] = useState([]);

  // 🧠 Load danh sách danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:8888/api/category');
        setCategories(res.data.data);
      } catch (err) {
        console.error('❌ Không thể lấy danh mục:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Chưa đăng nhập');

        const { data } = await axios.get(`http://localhost:8888/api/vouchers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const voucher = data.data;

        form.setFieldsValue({
          code: voucher.code,
          discountType: voucher.discountType,
          discountValue: voucher.discountValue,
          maxDiscount: voucher.maxDiscount,
          usageLimit: voucher.usageLimit,
          minOrderValue: voucher.minOrderValue,
          dateRange: [dayjs(voucher.startDate), dayjs(voucher.endDate)],
          categories: voucher.categories || [],
        });
      } catch (err) {
        console.error('❌ Lỗi khi tải mã:', err);
        toast.error('Không thể tải thông tin mã giảm giá!');
      }
    };

    fetchData();
  }, [id, form]);

  const onFinish = async (values: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Chưa đăng nhập');

      const [startDate, endDate] = values.dateRange;

      const payload = {
        code: values.code,
        discountType: values.discountType,
        discountValue: values.discountValue,
        maxDiscount: values.discountType === 'percentage' ? values.maxDiscount : undefined,
        usageLimit: values.usageLimit,
        minOrderValue: values.minOrderValue,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        categories: values.categories || [], // ✅ THÊM categories
      };

      await axios.put(`http://localhost:8888/api/vouchers/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('✅ Cập nhật mã giảm giá thành công!');
      nav('/dashboard/vouchers');
    } catch (err: any) {
      console.error('❌ Lỗi khi cập nhật mã:', err);
      toast.error(err.response?.data?.message || 'Không thể cập nhật mã giảm giá!');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-indigo-600 mb-5">Chỉnh Sửa Mã Giảm Giá</h2>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ discountType: 'fixed', usageLimit: 1 }}
      >
        <Form.Item name="code" label="Mã giảm giá" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="discountType" label="Loại mã giảm" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="fixed">Giảm số tiền cố định (₫)</Select.Option>
            <Select.Option value="percentage">Giảm phần trăm (%)</Select.Option>
          </Select>
        </Form.Item>

        {discountType === 'fixed' && (
          <Form.Item name="discountValue" label="Số tiền giảm (₫)" rules={[{ required: true }]}>
            <InputNumber className="w-full" min={1} addonAfter="₫" />
          </Form.Item>
        )}

        {discountType === 'percentage' && (
          <>
            <Form.Item name="discountValue" label="Phần trăm giảm (%)" rules={[{ required: true }]}>
              <InputNumber className="w-full" min={1} max={100} addonAfter="%" />
            </Form.Item>
            <Form.Item name="maxDiscount" label="Số tiền giảm tối đa (₫)" rules={[{ required: true }]}>
              <InputNumber className="w-full" min={1} addonAfter="₫" />
            </Form.Item>
          </>
        )}

        <Form.Item name="minOrderValue" label="Giá trị đơn hàng tối thiểu">
          <InputNumber className="w-full" min={0} addonAfter="₫" />
        </Form.Item>

        <Form.Item name="usageLimit" label="Số lượt sử dụng tối đa" rules={[{ required: true }]}>
          <InputNumber className="w-full" min={1} />
        </Form.Item>

        <Form.Item
          name="dateRange"
          label="Thời gian áp dụng"
          rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu và kết thúc' }]}
        >
          <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" />
        </Form.Item>

        <Form.Item name="categories" label="Danh mục áp dụng (nếu có)">
          <Select mode="multiple" allowClear placeholder="Chọn danh mục">
            {categories.map((cate: any) => (
              <Select.Option key={cate._id} value={cate._id}>
                {cate.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">Cập nhật</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditCoupon;
