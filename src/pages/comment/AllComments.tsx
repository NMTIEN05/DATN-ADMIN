import React, { useEffect, useState } from "react";
import { Table, Button, Popconfirm, Input, Select, Space, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

import { toast } from "react-toastify";
import { deleteComment, getAllComments } from "../../services/comment/comment.service";

type Row = {
  id: string;
  content: string;
  rating?: number | null;
  createdAt: string;
  user?: { username?: string; email?: string };
  product?: { name?: string; slug?: string };
};

export default function AllComments() {
  const [rows, setRows]   = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage]   = useState(1);
  const [limit, setLimit] = useState(10);
  const [q, setQ]         = useState("");
  const [star, setStar]   = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAllComments({ page, limit, q, star });
      setRows(res.items || []);
      setTotal(res.total || 0);
    } catch (e: any) {
      console.error(e);
      toast.error("Không tải được danh sách bình luận");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, limit, star]); // q sẽ bấm Enter để tìm

  const onSearch = () => { setPage(1); load(); };

  const onDelete = async (id: string) => {
    try {
      await deleteComment(id);
      toast.success("Đã xoá bình luận");
      setRows(prev => prev.filter(r => r.id !== id));
      setTotal(t => Math.max(0, t - 1));
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Xoá thất bại");
    }
  };

  const columns: ColumnsType<Row> = [
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      width: 170,
      render: (v: string) => new Date(v).toLocaleString(),
      sorter: (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt),
    },
    {
      title: "Người dùng",
      width: 220,
      render: (_, r) => (
        <div>
          <div>{r.user?.username || "Người dùng"}</div>
          <div style={{ color: "#999", fontSize: 12 }}>{r.user?.email}</div>
        </div>
      ),
    },
    {
      title: "Sản phẩm",
      dataIndex: ["product", "name"],
      width: 220,
      render: (_, r) => r.product?.name || <Tag color="default">N/A</Tag>,
    },
    { title: "Nội dung", dataIndex: "content", ellipsis: true },
    {
      title: "Sao",
      dataIndex: "rating",
      width: 80,
      align: "center",
      render: (v) => v ?? "-",
    },
    {
      title: "Thao tác",
      width: 120,
      align: "right",
      render: (_, r) => (
        <Popconfirm
          title="Xoá bình luận?"
          okText="Xoá"
          cancelText="Huỷ"
          onConfirm={() => onDelete(r.id)}
        >
          <Button danger size="small">Xoá</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <h2 className="mb-2">Tất cả bình luận ({total})</h2>

      <Space style={{ marginBottom: 12 }} wrap>
        <Input.Search
          placeholder="Tìm theo nội dung…"
          allowClear
          enterButton="Tìm"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onSearch={onSearch}
          style={{ width: 320 }}
        />
        <Select
          allowClear
          placeholder="Lọc sao"
          value={star}
          onChange={(v) => setStar(v)}
          style={{ width: 120 }}
          options={[5,4,3,2,1].map(s => ({ value: s, label: `${s} sao` }))}
        />
      </Space>

      <Table<Row>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={rows}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          showSizeChanger: true,
          onChange: (p, ps) => { setPage(p); setLimit(ps ?? 10); },
        }}
      />
    </div>
  );
}
