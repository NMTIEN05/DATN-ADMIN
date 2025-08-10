import React, { useEffect, useMemo, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Switch, Upload, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { blogService, type Blog, type CreateBlogRequest, type UpdateBlogRequest } from '../../services/blog/blog.service';

const BlogList: React.FC = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<Blog | null>(null);
    const [form] = Form.useForm();

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const data = await blogService.list();
            setBlogs(data);
        } catch (err: any) {
            message.error(err.response?.data?.message || 'Không thể tải blog');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const columns = useMemo(() => [
        {
            title: 'Ảnh',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            width: 120,
            render: (url: string) => (
                <img src={url?.startsWith('http') ? url : `http://localhost:8888${url}`} alt="thumb" style={{ width: 100, height: 60, objectFit: 'cover', borderRadius: 4 }} />
            )
        },
        {
            title: 'Tiêu đề lớn',
            dataIndex: 'largeTitle',
            key: 'largeTitle',
        },
        {
            title: 'Tiêu đề nhỏ',
            dataIndex: 'smallTitle',
            key: 'smallTitle',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'published',
            key: 'published',
            render: (published: boolean) => published ? 'Hiển thị' : 'Nháp'
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: Blog) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => onEdit(record)}>Sửa</Button>
                    <Popconfirm title="Xoá bài viết này?" onConfirm={() => onDelete(record._id)}>
                        <Button danger icon={<DeleteOutlined />}>Xoá</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ], []);

    const onCreate = () => {
        setEditing(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const onEdit = (blog: Blog) => {
        setEditing(blog);
        form.setFieldsValue({
            largeTitle: blog.largeTitle,
            smallTitle: blog.smallTitle,
            description: blog.description,
            content: blog.content,
            author: blog.author,
            published: blog.published,
        });
        setIsModalOpen(true);
    };

    const onDelete = async (id: string) => {
        try {
            await blogService.remove(id);
            message.success('Đã xoá');
            fetchBlogs();
        } catch (err: any) {
            message.error(err.response?.data?.message || 'Xoá thất bại');
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);
            const imageFile: File | undefined = values.image?.file?.originFileObj;
            if (editing) {
                await blogService.update(editing._id, { ...values, image: imageFile } as UpdateBlogRequest);
                message.success('Cập nhật thành công');
            } else {
                await blogService.create({ ...values, image: imageFile || null } as CreateBlogRequest);
                message.success('Tạo mới thành công');
            }
            setIsModalOpen(false);
            setEditing(null);
            form.resetFields();
            fetchBlogs();
        } catch (err: any) {
            message.error(err.response?.data?.message || 'Lưu thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
            <Space style={{ marginBottom: 16 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>Thêm bài viết</Button>
            </Space>
            <Table rowKey="_id" loading={loading} columns={columns as any} dataSource={blogs} />

            <Modal
                title={editing ? 'Chỉnh sửa bài viết' : 'Thêm bài viết'}
                open={isModalOpen}
                onCancel={() => { setIsModalOpen(false); setEditing(null); }}
                onOk={() => form.submit()}
                okText={editing ? 'Cập nhật' : 'Tạo mới'}
                confirmLoading={loading}
            >
                <Form layout="vertical" form={form} onFinish={handleSubmit} initialValues={{ published: true }}>
                    <Form.Item name="largeTitle" label="Tiêu đề lớn" rules={[{ required: true, message: 'Nhập tiêu đề lớn' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="smallTitle" label="Tiêu đề nhỏ" rules={[{ required: true, message: 'Nhập tiêu đề nhỏ' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Nhập mô tả' }]}>
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: 'Nhập nội dung' }]}>
                        <Input.TextArea rows={6} />
                    </Form.Item>
                    <Form.Item name="author" label="Tác giả">
                        <Input />
                    </Form.Item>
                    <Form.Item name="published" label="Trạng thái" valuePropName="checked">
                        <Switch checkedChildren="Hiện" unCheckedChildren="Nháp" />
                    </Form.Item>
                    <Form.Item name="image" label="Ảnh">
                        <Upload maxCount={1} beforeUpload={() => false} accept="image/*">
                            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BlogList;


