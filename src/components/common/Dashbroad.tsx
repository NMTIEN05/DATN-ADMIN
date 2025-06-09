// src/layouts/DashLayout.tsx
import { Layout, Menu } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined,
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
          defaultSelectedKeys={['/dashboard/users']}
          onClick={({ key }) => navigate(key)}
          items={[
            { key: '/dashboard/users', icon: <UserOutlined />, label: 'Người dùng' },
            { key: '/dashboard/videos', icon: <VideoCameraOutlined />, label: 'Video' },
            { key: '/dashboard/uploads', icon: <UploadOutlined />, label: 'Upload' },
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
