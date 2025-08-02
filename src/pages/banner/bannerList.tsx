import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Tag, 
  Space, 
  Button, 
  Modal, 
  message, 
  Image, 
  Switch,
  Popconfirm,
  Tooltip,
  Alert
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { useBannerStore } from '../../stores/banner.store';
import type { Banner, CreateBannerRequest, UpdateBannerRequest } from '../../types/banner/banner.type';
import BannerForm from './bannerForm';

const BannerList: React.FC = () => {
  const { 
    banners, 
    loading, 
    error, 
    fetchBanners, 
    createBanner, 
    updateBanner, 
    deleteBanner,
    clearError 
  } = useBannerStore();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    setPagination(prev => ({ ...prev, total: banners.length }));
  }, [banners]);

  const handleDelete = async (id: string) => {
    try {
      await deleteBanner(id);
      message.success('Xóa banner thành công');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể xóa banner');
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const banner = banners.find(b => b._id === id);
      if (banner) {
        await updateBanner(id, { ...banner, isActive });
        message.success('Cập nhật trạng thái thành công');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'order',
      key: 'order',
      width: 80,
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 120,
      render: (imageUrl: string, record: Banner) => {
        const imageSrc = imageUrl || record.image; // Fallback cho imageUrl
        // Tạo URL đầy đủ nếu là relative path
        const fullImageUrl = imageSrc?.startsWith('http') 
          ? imageSrc 
          : `http://localhost:8888${imageSrc}`;
        
        return (
          <Image
            width={80}
            height={40}
            src={fullImageUrl}
            alt="Banner"
            style={{ objectFit: 'cover', borderRadius: 4 }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
          />
        );
      },
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description: string) => (
        <Tooltip title={description}>
          <span>{description || 'Không có mô tả'}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Link',
      dataIndex: 'link',
      key: 'link',
      ellipsis: true,
      render: (link: string) => (
        <Tooltip title={link}>
          {link ? (
            <a href={link} target="_blank" rel="noopener noreferrer">
              {link}
            </a>
          ) : (
            <span style={{ color: '#999' }}>Không có link</span>
          )}
        </Tooltip>
      ),
    },
    {
      title: 'Thứ tự',
      dataIndex: 'order',
      key: 'order',
      width: 100,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive: boolean, record: Banner) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleToggleStatus(record._id, checked)}
          checkedChildren="Hiện"
          unCheckedChildren="Ẩn"
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_: any, record: Banner) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => {
                setEditingBanner(record);
                setIsModalVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa banner này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Xóa">
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: 24,
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        minHeight: '100%',
      }}
    >
      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          closable
          onClose={clearError}
          style={{ marginBottom: 16 }}
        />
      )}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 16,
        borderBottom: '2px solid #f0f0f0',
        paddingBottom: 16
      }}>
        <h1
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 600,
            color: '#1890ff',
          }}
        >
          Quản lý Banner
        </h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingBanner(null);
            setIsModalVisible(true);
          }}
        >
          Thêm Banner
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={banners}
        loading={loading}
        rowKey="id"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} banner`,
        }}
        onChange={(pagination) => {
          setPagination(prev => ({
            ...prev,
            current: pagination.current || 1,
            pageSize: pagination.pageSize || 10,
          }));
        }}
      />

      <Modal
        title={editingBanner ? 'Chỉnh sửa Banner' : 'Thêm Banner Mới'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingBanner(null);
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <BannerForm
          banner={editingBanner}
          onSubmit={async (data: CreateBannerRequest | UpdateBannerRequest) => {
            try {
              if (editingBanner) {
                await updateBanner(editingBanner._id, data);
                message.success('Cập nhật banner thành công');
              } else {
                await createBanner(data);
                message.success('Tạo banner thành công');
              }
              setIsModalVisible(false);
              setEditingBanner(null);
            } catch (error: any) {
              message.error(error.response?.data?.message || 'Có lỗi xảy ra');
            }
          }}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingBanner(null);
          }}
          loading={loading}
        />
      </Modal>
    </div>
  );
};

export default BannerList; 