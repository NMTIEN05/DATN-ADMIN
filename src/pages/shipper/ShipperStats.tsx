import { CheckCircleOutlined, CloseCircleOutlined, ShoppingOutlined, SyncOutlined } from "@ant-design/icons";
import React, { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";

const STATUS_LABELS = {
  ready_to_ship: "Chờ giao hàng",
  shipped: "Đang giao",
  delivered: "Đã giao",
  delivery_failed: "Giao thất bại",
};

const STATUS_CONFIG = {
  ready_to_ship: { color: "from-cyan-400 to-cyan-600", icon: <ShoppingOutlined style={{ color: '#1890ff' }} />, bgColor: "bg-cyan-50", textColor: "text-cyan-800", borderColor: "border-cyan-200", hoverColor: "hover:from-cyan-500 hover:to-cyan-700" },
  shipped: { color: "from-purple-400 to-purple-600", icon: <SyncOutlined spin style={{ color: '#faad14' }} />, bgColor: "bg-purple-50", textColor: "text-purple-800", borderColor: "border-purple-200", hoverColor: "hover:from-purple-500 hover:to-purple-700" },
  delivered: { color: "from-green-400 to-green-600", icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />, bgColor: "bg-green-50", textColor: "text-green-800", borderColor: "border-green-200", hoverColor: "hover:from-green-500 hover:to-green-700" },
  delivery_failed: { color: "from-red-400 to-red-600", icon: <CloseCircleOutlined style={{ color: '#f5222d' }} />, bgColor: "bg-red-50", textColor: "text-red-800", borderColor: "border-red-200", hoverColor: "hover:from-red-500 hover:to-red-700" },
};

interface OutletContext {
  orders: any[];
  fetchOrders: () => void;
}

const ShipperStats: React.FC = () => {
  const { orders } = useOutletContext<OutletContext>();
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const availableMonths = useMemo(() => {
    const monthsMap: Record<string, string> = {};
    orders.forEach(order => {
      const dateStr = order.createdAt || order.date;
      if (!dateStr) return;
      const date = new Date(dateStr);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthsMap[value]) monthsMap[value] = date.toLocaleDateString("vi-VN", { year: "numeric", month: "long" });
    });
    return Object.entries(monthsMap)
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => b.value.localeCompare(a.value));
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (selectedMonth === "all") return orders;
    return orders.filter(order => {
      const dateStr = order.createdAt || order.date;
      if (!dateStr) return false;
      const date = new Date(dateStr);
      const orderMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return orderMonth === selectedMonth;
    });
  }, [orders, selectedMonth]);

  const statsStatuses = ["ready_to_ship", "shipped", "delivered", "delivery_failed"];

  return (
    <div className="p-6  from-slate-50  min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">Thống kê Giao Hàng</h1>
        

        {/* Month Filter */}
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-slate-700 font-medium">Lọc theo tháng:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 bg-white border-2 border-slate-200 rounded-xl"
            >
              <option value="all">Tất cả tháng</option>
              {availableMonths.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>
          <div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">{filteredOrders.length} đơn hàng</span>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Tổng đơn hàng */}
          <div className="p-4 rounded-xl shadow bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="text-2xl"><ShoppingOutlined style={{ color: '#1890ff' }} /></div>
              <div className="font-bold">{filteredOrders.length}</div>
            </div>
            <div className="mt-2 font-semibold text-blue-800">Tổng đơn hàng</div>
          </div>

          {statsStatuses.map(status => {
            const count = filteredOrders.filter(o => o.status === status).length;
            const config = STATUS_CONFIG[status];
            return (
              <div key={status} className={`p-4 rounded-xl shadow ${config.bgColor} border ${config.borderColor}`}>
                <div className="flex items-center justify-between">
                  <div className="text-2xl">{config.icon}</div>
                  <div className="font-bold">{count}</div>
                </div>
                <div className={`mt-2 font-semibold ${config.textColor}`}>{STATUS_LABELS[status]}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ShipperStats;
