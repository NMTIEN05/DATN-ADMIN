import React, { useEffect } from 'react';
import { Form, Input, Switch, InputNumber, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { Banner, CreateBannerRequest, UpdateBannerRequest } from '../../types/banner/banner.type';
import { uploadImageToCloudinary } from '../../utils/cloudinaryUpload';

interface BannerFormProps {
  banner?: Banner | null;
  onSubmit: (data: CreateBannerRequest | UpdateBannerRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const BannerForm: React.FC<BannerFormProps> = ({ 
  banner, 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (banner) {
      form.setFieldsValue({
        title: banner.title,
        image: banner.image,
        description: banner.description,
        link: banner.link,
        isActive: banner.isActive,
        order: banner.order,
      });
    }
  }, [banner, form]);

  const handleSubmit = async (values: any) => {
    try {
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const imageUrl = await uploadImageToCloudinary(file);
      form.setFieldsValue({ image: imageUrl });
      message.success('Upload ảnh thành công!');
      return false; // Prevent default upload
    } catch (error) {
      message.error('Upload ảnh thất bại!');
      return false;
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        isActive: true,
        order: 0,
      }}
    >
      <Form.Item
        name="title"
        label="Tiêu đề"
        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
      >
        <Input placeholder="Nhập tiêu đề banner" />
      </Form.Item>

      <Form.Item
        name="image"
        label="Ảnh banner"
        rules={[{ required: true, message: 'Vui lòng upload ảnh!' }]}
      >
        <Input placeholder="URL ảnh hoặc upload file" />
      </Form.Item>

      <Form.Item label="Upload ảnh">
        <Upload
          beforeUpload={handleImageUpload}
          showUploadList={false}
          accept="image/*"
        >
          <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
        </Upload>
      </Form.Item>

      <Form.Item
        name="description"
        label="Mô tả"
      >
        <Input.TextArea 
          rows={3} 
          placeholder="Nhập mô tả banner (không bắt buộc)" 
        />
      </Form.Item>

      <Form.Item
        name="link"
        label="Link"
      >
        <Input placeholder="Nhập link (không bắt buộc)" />
      </Form.Item>

      <Form.Item
        name="order"
        label="Thứ tự"
      >
        <InputNumber 
          min={0} 
          placeholder="Thứ tự hiển thị" 
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        name="isActive"
        label="Trạng thái"
        valuePropName="checked"
      >
        <Switch checkedChildren="Hoạt động" unCheckedChildren="Ẩn" />
      </Form.Item>

      <Form.Item>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {banner ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default BannerForm; 