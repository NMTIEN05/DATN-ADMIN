import React, { useEffect } from "react";
import { Form, Input, Switch, InputNumber, Button, message } from "antd";
import type {
    Banner,
    CreateBannerRequest,
    UpdateBannerRequest,
} from "../../types/banner/banner.type";

interface BannerFormProps {
    banner?: Banner | null;
    onSubmit: (
        data: CreateBannerRequest | UpdateBannerRequest
    ) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

const BannerForm: React.FC<BannerFormProps> = ({
    banner,
    onSubmit,
    onCancel,
    loading = false,
}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (banner) {
            form.setFieldsValue({
                title: banner.title,
                image: banner.image,
                description: banner.description,
                link: banner.link,
                isActive: banner.isActive,
                order: banner.order,
            });
        } else {
            form.resetFields();
        }
    }, [banner, form]);

    const handleSubmit = async (values: any) => {
        try {
            await onSubmit(values);
            message.success(
                banner ? "Cập nhật thành công" : "Thêm mới thành công"
            );
            form.resetFields();
        } catch (error) {
            message.error("Có lỗi xảy ra");
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ isActive: true, order: 0 }}
        >
            <Form.Item
                name="title"
                label="Tiêu đề"
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
            >
                <Input placeholder="Nhập tiêu đề banner" />
            </Form.Item>

            <Form.Item
                name="image"
                label="URL ảnh banner"
                rules={[{ required: true, message: "Vui lòng nhập URL ảnh!" }]}
            >
                <Input placeholder="Nhập URL ảnh banner" />
            </Form.Item>

            <Form.Item name="description" label="Mô tả">
                <Input.TextArea
                    rows={3}
                    placeholder="Nhập mô tả banner (không bắt buộc)"
                />
            </Form.Item>

            <Form.Item name="link" label="Link">
                <Input placeholder="Nhập link (không bắt buộc)" />
            </Form.Item>

            <Form.Item name="order" label="Thứ tự">
                <InputNumber
                    min={0}
                    placeholder="Thứ tự hiển thị"
                    style={{ width: "100%" }}
                />
            </Form.Item>

            <Form.Item
                name="isActive"
                label="Trạng thái"
                valuePropName="checked"
            >
                <Switch checkedChildren="Hoạt động" unCheckedChildren="Ẩn" />
            </Form.Item>

            <Form.Item>
                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        justifyContent: "flex-end",
                    }}
                >
                    <Button onClick={onCancel}>Hủy</Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        {banner ? "Cập nhật" : "Tạo mới"}
                    </Button>
                </div>
            </Form.Item>
        </Form>
    );
};

export default BannerForm;
