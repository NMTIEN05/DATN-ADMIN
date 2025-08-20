import React, { useState } from "react";
import { Form, Input, Button, Card, message, type UploadFile } from "antd";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import ImageUpload from "../../components/common/ImageUpload";

const { TextArea } = Input;

const AddBlog: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [imageUrlArr, setImageUrlArr] = useState<string[]>([]);

    const onFinish = async (values: any) => {
        try {
            if (!fileList || fileList.length === 0) {
                message.error("Vui lòng tải ảnh blog!");
                return;
            }

            // Tạo FormData để gửi lên backend
            const formData = new FormData();
            formData.append("largeTitle", values.largeTitle);
            formData.append("smallTitle", values.smallTitle);
            formData.append("description", values.description || "");
            formData.append("content", values.content);
            formData.append("author", values.author || "Anonymous");

            // Thêm file ảnh (multer backend nhận `image`)
            if (fileList[0].originFileObj) {
                formData.append("image", fileList[0].originFileObj as File);
            }

            console.log("📤 Payload gửi đi:", values);

            await axios.post(
                `${import.meta.env.VITE_PUBLIC_API_URL}api/blog`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            toast.success("✅ Blog đã được tạo thành công!");
            setTimeout(() => {
                navigate("/dashboard/blog");
            }, 1500);
        } catch (err: any) {
            console.error(
                "❌ Lỗi tạo blog:",
                err?.response?.data || err.message
            );
            message.error("Tạo blog thất bại!");
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-indigo-600 mb-5">
                Thêm Blog
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
                        <Button type="primary" htmlType="submit" block>
                            Tạo Blog
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default AddBlog;
