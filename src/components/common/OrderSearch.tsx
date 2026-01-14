// src/components/OrderSearch.tsx
import React, { useEffect } from "react";
import { Input, Button, message, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";

interface OrderSearchProps {
  orderId: string;
  setOrderId: (value: string) => void;
  onSearch: (value: string) => void;
  onClear?: () => void; // callback khi xóa input
  placeholder?: string;
}

const OrderSearch: React.FC<OrderSearchProps> = ({
  orderId,
  setOrderId,
  onSearch,
  onClear,
  placeholder = "Nhập Order ID...",
}) => {
  const handleSearch = () => {
    if (!orderId.trim()) {
      message.warning("Vui lòng nhập Order ID!");
      return;
    }
    onSearch(orderId.trim());
  };

  // Khi input bị xóa, gọi onClear nếu có
  useEffect(() => {
    if (orderId === "" && onClear) {
      onClear();
    }
  }, [orderId, onClear]);

  return (
    <Space>
      <Input
        placeholder={placeholder}
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        style={{ width: 300 }}
        onPressEnter={handleSearch}
        allowClear
      />
      <Button
        type="primary"
        icon={<SearchOutlined />}
        onClick={handleSearch}
      >
        Tìm
      </Button>
    </Space>
  );
};

export default OrderSearch;
