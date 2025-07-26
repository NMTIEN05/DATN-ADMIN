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
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { bannerService } from '../../services/banner/banner.service';
import type { Banner } from '../../types/banner/banner.type';
import BannerForm from './bannerForm';

const BannerList: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchBanners();
  }, [pagination.current, pagination.pageSize]);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await bannerService.getBanners(pagination.current, pagination.pageSize);
      
      // Map dữ liệu từ backend để phù hợp với frontend
      const mappedBanners = response.data.map((banner: Banner) => ({
        ...banner,
        id: banner._id || banner.id, // Sử dụng _id từ MongoDB
        imageUrl: banner.image, // Map image thành imageUrl cho frontend
      }));
      
      setBanners(mappedBanners);
      setPagination(prev => ({ ...prev, total: response.total }));
    } catch (error: any) {
      console.error('Error fetching banners:', error);
      message.error(error.response?.data?.message || 'Không thể tải danh sách banner');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await bannerService.deleteBanner(id);
      message.success('Xóa banner thành công');
      fetchBanners();
    } catch (error: any) {
      console.error('Error deleting banner:', error);
      message.error(error.response?.data?.message || 'Không thể xóa banner');
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const banner = banners.find(b => b.id === id);
      if (banner) {
        await bannerService.updateBanner(id, { 
          ...banner, 
          isActive,
          imageUrl: banner.imageUrl || banner.image // Đảm bảo có imageUrl
        });
        message.success('Cập nhật trạng thái thành công');
        fetchBanners();
      }
    } catch (error: any) {
      console.error('Error updating banner status:', error);
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
          onChange={(checked) => handleToggleStatus(record.id!, checked)}
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
                // Map dữ liệu để phù hợp với form
                const bannerForEdit = {
                  ...record,
                  imageUrl: record.imageUrl || record.image,
                };
                setEditingBanner(bannerForEdit);
                setIsModalVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa banner này?"
            onConfirm={() => handleDelete(record.id!)}
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
          onSuccess={() => {
            setIsModalVisible(false);
            setEditingBanner(null);
            fetchBanners();
          }}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingBanner(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default BannerList; 