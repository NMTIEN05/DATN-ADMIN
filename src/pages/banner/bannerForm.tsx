import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Upload,
  Switch,
  InputNumber,
  message,
  Space,
  Image,
  Card,
} from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import type { Banner } from '../../types/banner/banner.type';
import { bannerService } from '../../services/banner/banner.service';

const { TextArea } = Input;

interface BannerFormProps {
  banner?: Banner | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const BannerForm: React.FC<BannerFormProps> = ({ banner, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (banner) {
      form.setFieldsValue({
        title: banner.title,
        description: banner.description,
        link: banner.link,
        isActive: banner.isActive,
        order: banner.order,
      });
      // Sử dụng imageUrl hoặc image từ banner
      const bannerImage = banner.imageUrl || banner.image;
      setImageUrl(bannerImage);
      if (bannerImage) {
        setFileList([
          {
            uid: '-1',
            name: 'banner-image',
            status: 'done',
            url: bannerImage,
          },
        ]);
      }
    }
  }, [banner, form]);

  const handleSubmit = async (values: any) => {
    if (!imageUrl) {
      message.error('Vui lòng tải lên hình ảnh banner');
      return;
    }

    setLoading(true);
    try {
      const bannerData = {
        ...values,
        imageUrl,
      };

      if (banner) {
        await bannerService.updateBanner(banner.id!, bannerData);
        message.success('Cập nhật banner thành công');
      } else {
        await bannerService.createBanner(bannerData);
        message.success('Tạo banner thành công');
      }
      onSuccess();
    } catch (error: any) {
      console.error('Error submitting banner:', error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      // Kiểm tra kích thước file (2MB)
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Ảnh phải nhỏ hơn 2MB!');
        return false;
      }

      // Kiểm tra định dạng file
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Chỉ có thể tải lên file ảnh!');
        return false;
      }

      // Gọi API upload thực tế
      const response = await bannerService.uploadImage(file);
      setImageUrl(response.url);
      
      message.success('Tải ảnh thành công');
      return false; // Prevent default upload
    } catch (error: any) {
      console.error('Error uploading image:', error);
      message.error(error.response?.data?.message || 'Tải ảnh thất bại');
      return false;
    }
  };

  const uploadProps: UploadProps = {
    beforeUpload: handleImageUpload,
    fileList,
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);
    },
    onRemove: () => {
      setImageUrl('');
      setFileList([]);
    },
    listType: 'picture-card',
    maxCount: 1,
    accept: 'image/*',
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        isActive: true,
        order: 1,
      }}
    >
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <Form.Item
            label="Tiêu đề banner"
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề banner' }]}
          >
            <Input placeholder="Nhập tiêu đề banner" />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
          >
            <TextArea
              rows={3}
              placeholder="Nhập mô tả banner (không bắt buộc)"
            />
          </Form.Item>

          <Form.Item
            label="Link"
            name="link"
          >
            <Input placeholder="Nhập link (không bắt buộc)" />
          </Form.Item>

          <Form.Item
            label="Thứ tự hiển thị"
            name="order"
            rules={[{ required: true, message: 'Vui lòng nhập thứ tự' }]}
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              placeholder="Nhập thứ tự hiển thị"
            />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="isActive"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="Hiện"
              unCheckedChildren="Ẩn"
            />
          </Form.Item>
        </div>

        <div style={{ width: 300 }}>
          <Card title="Hình ảnh banner" size="small">
            <Upload {...uploadProps}>
              {fileList.length === 0 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Tải ảnh</div>
                </div>
              )}
            </Upload>
            
            {imageUrl && (
              <div style={{ marginTop: 16 }}>
                <Image
                  src={imageUrl}
                  alt="Banner preview"
                  style={{ width: '100%', borderRadius: 8 }}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                />
              </div>
            )}
            
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              <p>• Kích thước khuyến nghị: 800x400px</p>
              <p>• Định dạng: JPG, PNG, GIF</p>
              <p>• Dung lượng tối đa: 2MB</p>
            </div>
          </Card>
        </div>
      </div>

      <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
        <Space>
          <Button onClick={onCancel}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {banner ? 'Cập nhật' : 'Tạo banner'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default BannerForm; 