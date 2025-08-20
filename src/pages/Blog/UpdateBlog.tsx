import React, { useEffect, useState } from "react";
import { Form, Input, Button, Card, message, type UploadFile } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import ImageUpload from "../../components/common/ImageUpload";
import { useQueryClient } from "@tanstack/react-query";

const { TextArea } = Input;

const UpdateBlog: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();

    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [imageUrlArr, setImageUrlArr] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const { data } = await axios.get(
                    `${import.meta.env.VITE_PUBLIC_API_URL}api/blog/${id}`
                );
                const blog = data.data || data;
                form.setFieldsValue({
                    largeTitle: blog.largeTitle,
                    smallTitle: blog.smallTitle,
                    description: blog.description,
                    content: blog.content,
                    author: blog.author,
                });
                if (blog.imageUrl && blog.imageUrl.length > 0) {
                    const firstImage = blog.imageUrl[0];
                    setImageUrlArr([firstImage]);
                    setFileList([
                        {
                            uid: "-1",
                            name: "image.png",
                            status: "done",
                            url: firstImage,
                        } as UploadFile,
                    ]);
                }
            } catch (err: any) {
                console.error("❌ Lỗi lấy blog:", err);
                message.error("Không thể lấy dữ liệu blog!");
            }
        };
        if (id) fetchBlog();
    }, [id]);

    const onFinish = async (values: any) => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("largeTitle", values.largeTitle);
            formData.append("smallTitle", values.smallTitle);
            formData.append("description", values.description || "");
            formData.append("content", values.content);
            formData.append("author", values.author || "Anonymous");

            if (fileList[0]?.originFileObj) {
                formData.append("image", fileList[0].originFileObj as File);
            }

            await axios.put(
                `${import.meta.env.VITE_PUBLIC_API_URL}api/blog/${id}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            toast.success("✅ Cập nhật blog thành công!");

            // ✅ Quan trọng: Đảm bảo làm mới dữ liệu trước khi navigate
            await queryClient.invalidateQueries({ queryKey: ["blog"] });

            navigate("/dashboard/blog");
        } catch (err: any) {
            console.error(
                "❌ Lỗi cập nhật blog:",
                err?.response?.data || err.message
            );
            message.error("Cập nhật blog thất bại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-indigo-600 mb-5">
                Cập nhật Blog
            </h2>
            <Card>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        label="Tiêu đề lớn"
                        name="largeTitle"
                        rules={[
                            { required: true, message: "Nhập tiêu đề lớn!" },
                        ]}
                    >
                        <Input placeholder="Ví dụ: Công nghệ mới 2025" />
                    </Form.Item>
                    <Form.Item
                        label="Tiêu đề nhỏ"
                        name="smallTitle"
                        rules={[
                            { required: true, message: "Nhập tiêu đề nhỏ!" },
                        ]}
                    >
                        <Input placeholder="Ví dụ: Xu hướng AI" />
                    </Form.Item>
                    <Form.Item
                        label="Mô tả ngắn"
                        name="description"
                        rules={[{ required: true, message: "Nhập mô tả!" }]}
                    >
                        <TextArea
                            maxLength={500}
                            rows={3}
                            placeholder="Tóm tắt nội dung blog..."
                        />
                    </Form.Item>
                    <Form.Item
                        label="Nội dung"
                        name="content"
                        rules={[{ required: true, message: "Nhập nội dung!" }]}
                    >
                        <TextArea
                            rows={6}
                            placeholder="Nhập nội dung chi tiết blog..."
                        />
                    </Form.Item>
                    <Form.Item label="Ảnh đại diện" required>
                        <ImageUpload
                            fileList={fileList}
                            setFileList={setFileList}
                            setImageUrl={setImageUrlArr}
                            maxCount={1}
                        />
                    </Form.Item>
                    <Form.Item label="Tác giả" name="author">
                        <Input placeholder="Mặc định: Anonymous" />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                        >
                            Cập nhật Blog
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default UpdateBlog;
