import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  UserOutlined,
  AreaChartOutlined,
  FolderOpenOutlined,
  MobileOutlined,
  ShoppingOutlined,
  EditOutlined,
  CommentOutlined,
  AppstoreOutlined,
  BgColorsOutlined,
  MenuUnfoldOutlined,
  PictureOutlined,
} from '@ant-design/icons';

const { Sider, Content } = Layout;

const DashLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = location.pathname;
  const openKey = selectedKey.startsWith('/dashboard/capacity') || selectedKey.startsWith('/dashboard/color')
    ? ['product-attributes']
    : [];

  const menuItems = [
    {
      key: '/dashboard/phantich',
      icon: <AreaChartOutlined />,
      label: 'Phân Tích',
    },
    {
      key: '/dashboard/users',
      icon: <UserOutlined />,
      label: 'Người dùng',
    },
    {
      key: '/dashboard/category',
      icon: <FolderOpenOutlined />,
      label: 'Danh Mục',
    },
    {
      key: 'product-attributes',
      icon: <AppstoreOutlined />,
      label: 'Sản Phẩm',
      children: [
        {
          key: '/dashboard/capacity',
          icon: <MenuUnfoldOutlined />,
          label: 'Series Sản Phẩm',
        },
        {
      key: '/dashboard/product',
      icon: <MobileOutlined />,
      label: 'Sản Phẩm',
    },
      ],
    },
    
    {
      key: '/dashboard/orders',
      icon: <ShoppingOutlined />,
      label: 'Đơn Hàng',
    },
     {
      key: '/dashboard/vouchers',
      icon: <ShoppingOutlined />,
      label: 'Mã Giamr Gía',
    },
    {
      key: '/dashboard/banners',
      icon: <PictureOutlined />,
      label: 'Banner',
    },
    {
      key: '/dashboard/flashsale',
      icon: <BgColorsOutlined />,
      label: 'Flash Sale',
    },
    {
      key: '/dashboard/posts',
      icon: <EditOutlined />,
      label: 'Bài Viết',
    },
    {
      key: '/dashboard/comments',
      icon: <CommentOutlined />,
      label: 'Bình Luận',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={230}
        style={{ background: '#001529' }}
      >
        <div
          style={{
            height: 60,
            margin: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src="http://www.datwebdigital.com/DWD/wp-content/uploads/2012/06/logo-design.jpg"
            alt="Logo"
            style={{
              maxHeight: 40,
              maxWidth: '100%',
              objectFit: 'contain',
            }}
          />
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={openKey}
          onClick={({ key }) => {
            if (!key.startsWith('/')) return;
            navigate(key);
          }}
          items={menuItems}
        />
      </Sider>

      <Layout>
        <Content
          style={{
            padding: 16,
            background: '#fff',
            height: '100%',
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashLayout;
