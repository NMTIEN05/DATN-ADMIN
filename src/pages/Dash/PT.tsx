import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

const Dashboard = () => {
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
  });

  const [chartData, setChartData] = useState([]);
  const [extraStats, setExtraStats] = useState({
    bestSellers: [],
    lowStock: [],
    fewStock: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Import axios if not already imported
        // import axios from 'axios';
        
        const [
          summaryRes,
          chartRes,
          bestSellerRes,
          lowStockRes,
          fewStockRes,
        ] = await Promise.all([
          fetch('http://localhost:8888/api/dashbroad/summary').then(res => res.json()),
          fetch('http://localhost:8888/api/dashbroad/monthly-orders').then(res => res.json()),
          fetch('http://localhost:8888/api/dashbroad/best-sellers').then(res => res.json()),
          fetch('http://localhost:8888/api/dashbroad/low-stock').then(res => res.json()),
          fetch('http://localhost:8888/api/dashbroad/few-stock').then(res => res.json()),
          
        ]);

        // Log data để debug
        console.log('Summary:', summaryRes);
        console.log('Chart Data:', chartRes);
        console.log('Best Sellers:', bestSellerRes);
        console.log('Low Stock:', lowStockRes);
        console.log('Few Stock:', fewStockRes);

        setSummary(summaryRes);
        setChartData(chartRes);   

        // Cải tiến function formatItems để xử lý data tốt hơn
        const formatItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items.slice(0, 3).map((item, index) => ({
    ...item,
    displayName: item.title || `Sản phẩm ${index + 1}`, // backend trả title
    displayQuantity: item.soldCount ?? item.stock ?? 0   // backend trả soldCount
  }));
};
        setExtraStats({
  bestSellers: formatItems(bestSellerRes),
  lowStock: formatItems(lowStockRes),
  fewStock: formatItems(fewStockRes),
});

      } catch (err) {
        console.error('Lỗi fetch dữ liệu dashboard:', err);
        // Fallback to empty data if API fails
        setSummary({
          totalRevenue: 0,
          totalOrders: 0,
          totalUsers: 0,
          totalProducts: 0,
        });
        setChartData([]);
        setExtraStats({
          bestSellers: [],
          lowStock: [],
          fewStock: [],
        });
      }
    };

    fetchDashboardData();
  }, []);

  // Icon components
  const DollarIcon = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  );

  const ShoppingCartIcon = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.39.39-.39 1.024 0 1.414L7 18h10" />
    </svg>
  );

  const UserIcon = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  );

  const ProductIcon = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );

  const TrendingUpIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );

  const StatCard = ({ icon, label, value, color, bgColor, trend = "+12%" }) => (
    <div className={`relative overflow-hidden rounded-2xl ${bgColor} p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className={`${color} bg-white bg-opacity-20 rounded-xl p-3`}>
              {icon}
            </div>
            <div className="flex items-center text-white text-sm font-medium">
              <TrendingUpIcon />
              <span className="ml-1">{trend}</span>
            </div>
          </div>
          <p className="text-white text-opacity-80 text-sm font-medium mb-1">{label}</p>
          <p className="text-white text-2xl font-bold">{value}</p>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full transform translate-x-16 -translate-y-16"></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-white bg-opacity-10 rounded-full transform -translate-x-10 translate-y-10"></div>
    </div>
  );

const InfoCard = ({ title, items, color, bgColor }) => (
  <div className={`${bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}>
    <div className="flex items-center mb-4">
      <div className={`${color} bg-white bg-opacity-20 rounded-lg p-2 mr-3`}>
        <ProductIcon />
      </div>
      <h3 className="text-white font-semibold text-lg">{title}</h3>
    </div>
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex items-center justify-between text-white text-opacity-90">
          <div className="flex items-center">
            <span className="bg-white bg-opacity-20 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold mr-3">
              {index + 1}
            </span>
            <span className="text-sm">{item.displayName}</span>
          </div>
         
        </div>
      ))}
    </div>
  </div>
);


  const formatTopItems = (items) => {
    return items.length
      ? items.map((item, index) => `Top ${index + 1}: ${item.displayName}`).join(' | ')
      : '-';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Tổng quan hệ thống</h1>
          <p className="text-gray-600">Dashboard quản lý và thống kê tổng quan</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<DollarIcon />}
            label="Tổng doanh thu"
            value={`${summary.totalRevenue.toLocaleString()}₫`}
            color="text-emerald-500"
            bgColor="bg-gradient-to-br from-emerald-500 to-emerald-600"
            trend="+15.3%"
          />
          <StatCard
            icon={<ShoppingCartIcon />}
            label="Tổng đơn hàng"
            value={summary.totalOrders.toLocaleString()}
            color="text-blue-500"
            bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
            trend="+8.2%"
          />
          <StatCard
            icon={<UserIcon />}
            label="Tổng người dùng"
            value={summary.totalUsers.toLocaleString()}
            color="text-purple-500"
            bgColor="bg-gradient-to-br from-purple-500 to-purple-600"
            trend="+23.1%"
          />
          <StatCard
            icon={<ProductIcon />}
            label="Tổng sản phẩm"
            value={summary.totalProducts.toLocaleString()}
            color="text-orange-500"
            bgColor="bg-gradient-to-br from-orange-500 to-orange-600"
            trend="+5.7%"
          />
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <InfoCard
            title="Sản phẩm bán chạy"
            items={extraStats.bestSellers}
            color="text-red-500"
            bgColor="bg-gradient-to-br from-red-500 to-pink-500"
          />
          <InfoCard
            title="Sản phẩm sắp hết"
            items={extraStats.lowStock}
            color="text-amber-500"
            bgColor="bg-gradient-to-br from-amber-500 to-orange-500"
          />
          <InfoCard
            title="Sản phẩm khó bán"
            items={extraStats.fewStock}
            color="text-cyan-500"
            bgColor="bg-gradient-to-br from-cyan-500 to-blue-500"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Thống kê đơn hàng theo tháng</h3>
              <p className="text-gray-600 text-sm">Biểu đồ cột thể hiện số lượng đơn hàng</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white'
                  }}
                />
                <Bar 
                  dataKey="orders" 
                  fill="url(#colorGradient)"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={1}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Area Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Thống kê doanh thu theo tháng</h3>
              <p className="text-gray-600 text-sm">Biểu đồ vùng thể hiện xu hướng doanh thu</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white'
                  }}
                  formatter={(value) => [`${(value / 1000000).toFixed(1)}M₫`, 'Doanh thu']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#colorGradient2)"
                />
                <defs>
                  <linearGradient id="colorGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;