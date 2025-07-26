// src/layouts/DashLayout.tsx
import { Layout, Menu } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined,
  PictureOutlined,
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
          defaultSelectedKeys={['/']}
          onClick={({ key }) => navigate(key)}
          items={[
            { key: '/', icon: <UserOutlined />, label: 'Dashboard' },
            { key: '/users/add', icon: <VideoCameraOutlined />, label: 'Thêm người dùng' },
            { key: '/banners', icon: <PictureOutlined />, label: 'Quản lý Banner' },
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
