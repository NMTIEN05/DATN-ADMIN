import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Table,
    Space,
    Button,
    Modal,
    message,
    Image,
    Switch,
    Popconfirm,
    Tooltip,
    Alert,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import BannerForm from "../banner/bannerForm";
import type { Banner, CreateBannerRequest, UpdateBannerRequest } from "../../types/banner/banner.type";

const API_URL = "http://localhost:8888/api/banners";

const BannerList: React.FC = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}?page=${pagination.current}&limit=${pagination.pageSize}`);
            setBanners(res.data.data);
            setPagination(prev => ({ ...prev, total: res.data.total || res.data.data.length }));
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || "Không tải được dữ liệu banner");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, [pagination.current, pagination.pageSize]);

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            message.success("Xóa banner thành công");
            fetchBanners();
        } catch (err: any) {
            message.error(err.response?.data?.message || "Không thể xóa banner");
        }
    };

    const handleToggleStatus = async (id: string, isActive: boolean) => {
        try {
            const banner = banners.find(b => b._id === id);
            if (!banner) return;
            await axios.put(`${API_URL}/${id}`, { ...banner, isActive });
            message.success("Cập nhật trạng thái thành công");
            fetchBanners();
        } catch (err: any) {
            message.error(err.response?.data?.message || "Không thể cập nhật trạng thái");
        }
    };

    const handleSubmit = async (data: CreateBannerRequest | UpdateBannerRequest) => {
        try {
            if (editingBanner) {
                await axios.put(`${API_URL}/${editingBanner._id}`, data);
                message.success("Cập nhật banner thành công");
            } else {
                await axios.post(API_URL, data);
                message.success("Thêm mới banner thành công");
            }
            setIsModalVisible(false);
            setEditingBanner(null);
            fetchBanners();
        } catch (err: any) {
            message.error(err.response?.data?.message || "Có lỗi xảy ra");
        }
    };

    const columns = [
        { title: "STT", dataIndex: "order", key: "order", width: 80 },
        {
            title: "Hình ảnh",
            dataIndex: "image",
            key: "image",
            width: 120,
            render: (image: string) => (
                <Image
                    width={80}
                    height={40}
                    src={image?.startsWith("http") ? image : `http://localhost:8888${image}`}
                    alt="Banner"
                    style={{ objectFit: "cover", borderRadius: 4 }}
                />
            ),
        },
        { title: "Tiêu đề", dataIndex: "title", key: "title", ellipsis: true },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
            render: (desc: string) => <Tooltip title={desc}>{desc || "Không có mô tả"}</Tooltip>,
        },
        {
            title: "Link",
            dataIndex: "link",
            key: "link",
            ellipsis: true,
            render: (link: string) =>
                link ? (
                    <a href={link} target="_blank" rel="noopener noreferrer">
                        {link}
                    </a>
                ) : (
                    <span style={{ color: "#999" }}>Không có link</span>
                ),
        },
        { title: "Thứ tự", dataIndex: "order", key: "order", width: 100 },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            key: "isActive",
            width: 120,
            render: (isActive: boolean, record: Banner) => (
                <Switch
                    checked={isActive}
                    onChange={(checked) => handleToggleStatus(record._id, checked)}
                    checkedChildren="Hiện"
                    unCheckedChildren="Ẩn"
                />
            ),
        },
        {
            title: "Hành động",
            key: "action",
            width: 150,
            render: (_: any, record: Banner) => (
                <Space size="small">
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => {
                                setEditingBanner(record);
                                setIsModalVisible(true);
                            }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa banner này?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Tooltip title="Xóa">
                            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24, background: "#fff", borderRadius: 8 }}>
            {error && (
                <Alert
                    message="Lỗi"
                    description={error}
                    type="error"
                    showIcon
                    closable
                    onClose={() => setError(null)}
                    style={{ marginBottom: 16 }}
                />
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <h1 style={{ margin: 0, fontSize: 24, color: "#1890ff" }}>Quản lý Banner</h1>
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
                rowKey="_id"
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} banner`,
                }}
                onChange={(pg) =>
                    setPagination((prev) => ({
                        ...prev,
                        current: pg.current || 1,
                        pageSize: pg.pageSize || 10,
                    }))
                }
            />

            <Modal
                title={editingBanner ? "Chỉnh sửa Banner" : "Thêm Banner Mới"}
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
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setIsModalVisible(false);
                        setEditingBanner(null);
                    }}
                    loading={loading}
                />
            </Modal>
        </div>
    );
};

export default BannerList;
