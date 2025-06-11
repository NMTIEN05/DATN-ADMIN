// src/layouts/DashLayout.tsx
import { Layout, Menu } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined,
  MobileOutlined,
  FolderOpenOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  AreaChartOutlined,
  EditOutlined,
  CommentOutlined,
} from '@ant-design/icons';
import React, { useState } from 'react';

const { Sider, Content } = Layout;

const Dashbroad: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: '100vh'  }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{ height: 60, margin: 16, background: 'rgba(255, 255, 255, 0.3)' }} />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['/dashboard']}
          onClick={({ key }) => navigate(key)}
          items={[
            { key: '/dashboard', icon: <AreaChartOutlined />, label: 'Phân Tích' },
            { key: '/dashboard/users', icon: <UserOutlined />, label: 'Người dùng' },
            { key: '/dashboard/category', icon: <FolderOpenOutlined />, label: 'Danh Mục' },
            { key: '/dashboard/uploads', icon: <MobileOutlined />, label: 'Sản Phẩm' },
            { key: '/dashboard/uploads', icon: <ShoppingOutlined />, label: 'Giỏ Hàng' },
            { key: '/dashboard/uploads', icon: <EditOutlined />, label: 'Bài Viết' },
            { key: '/dashboard/uploads', icon: <CommentOutlined />, label: 'Bài Viết' },


          ]}
        />
      </Sider>

      <Layout style={{ flex: 1}}>
        <Content
          style={{
            padding: 16,
            background: '#fff',
            height: '100%',
             width: '100%' ,
            overflow: 'auto',
          }}
        >
          <Outlet/>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashbroad;
