import React, { useEffect, useState } from 'react';
import { Card } from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import axios from 'axios';

const Dashboard = () => {
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
  });

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
   const fetchDashboardData = async () => {
  try {
    const [summaryRes, chartRes] = await Promise.all([
      axios.get('http://localhost:8888/api/dashbroad/summary'),
      axios.get('http://localhost:8888/api/dashbroad/monthly-orders'),
    ]);

    setSummary(summaryRes.data);     // ✅ axios trả JSON sẵn trong `data`
    setChartData(chartRes.data);     // ✅
  } catch (err) {
    console.error('Lỗi fetch dữ liệu dashboard:', err);
  }
};

    fetchDashboardData();
  }, []);

  const StatCard = ({ icon, label, value, color }) => (
    <Card
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        height: 80,
        justifyContent: 'start',
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div style={{ fontSize: 20, color }}>{icon}</div>
      <div>
        <div style={{ fontSize: 13, color: '#888' }}>{label}</div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>{value}</div>
      </div>
    </Card>
  );

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20 }}>
        Tổng quan hệ thống
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        <StatCard
          icon={<DollarOutlined />}
          label="Tổng doanh thu"
          value={`${summary.totalRevenue.toLocaleString()}₫`}
          color="green"
        />
        <StatCard
          icon={<ShoppingCartOutlined />}
          label="Tổng đơn hàng"
          value={summary.totalOrders}
          color="blue"
        />
        <StatCard
          icon={<UserOutlined />}
          label="Tổng người dùng"
          value={summary.totalUsers}
          color="purple"
        />
        
        <StatCard
          icon={<AppstoreOutlined />}
          label="Tổng sản phẩm"
          value={summary.totalProducts}
          color="orange"
        />
      </div>

      <Card
        title="Thống kê đơn hàng theo tháng"
        style={{ marginTop: 28 }}
        bodyStyle={{ padding: '12px 24px' }}
      >
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="orders" fill="#1890ff" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default Dashboard;
