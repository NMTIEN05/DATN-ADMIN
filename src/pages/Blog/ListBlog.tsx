import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Space, Table, Image, Popconfirm } from "antd";
import Column from "antd/es/table/Column";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const ListBlog = () => {
    const nav = useNavigate();
    const queryClient = useQueryClient();

    // Query list blog
    const { data: dataSource = [], isLoading } = useQuery({
        queryKey: ["blog"],
        queryFn: async () => {
            const { data } = await axios.get(
                `${import.meta.env.VITE_PUBLIC_API_URL}api/blog`,
                {
                    params: {
                        limit: 1000,
                        offset: 0,
                        sortBy: "createdAt",
                        order: "desc",
                    },
                }
            );
            return data.data;
        },
    });

    // Mutation xoá blog
    const { mutate } = useMutation({
        mutationFn: async (id: string) => {
            await axios.delete(
                `${import.meta.env.VITE_PUBLIC_API_URL}api/blog/${id}`
            );
        },
        onSuccess: () => {
            toast.success("Xoá blog thành công!");
            queryClient.invalidateQueries({ queryKey: ["blog"] });
        },
        onError: (err: any) => {
            console.error("Xoá thất bại:", err.response?.data || err.message);
            toast.error("Xoá blog thất bại!");
        },
    });

    const handleDelete = (id: string) => {
        mutate(id);
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-indigo-600 mb-5">
                Danh Sách Blog
            </h2>

            <div className="flex justify-between mb-5">
                <Button
                    type="primary"
                    onClick={() => nav("/dashboard/blog/create")}
                >
                    Thêm mới
                </Button>
                <Button onClick={() => nav("/dashboard/blog/deleted")}>
                    Xem blog đã xoá
                </Button>
            </div>

            <Table
                dataSource={dataSource}
                rowKey="_id"
                loading={isLoading}
                pagination={{ pageSize: 5 }}
            >
                <Column
                    title="STT"
                    key="index"
                    render={(_, __, index) => index + 1}
                />
                <Column title="Tiêu đề lớn" dataIndex="largeTitle" />
                <Column title="Tiêu đề nhỏ" dataIndex="smallTitle" />
                <Column title="Mô tả" dataIndex="description" />
                <Column
                    title="Ảnh"
                    dataIndex="imageUrl"
                    key="image"
                    render={(images: string[] = []) =>
                        images.length > 0 ? (
                            <Image
                                src={images[0]} // lấy ảnh đầu tiên
                                alt="Ảnh"
                                width={60}
                                height={60}
                                style={{ objectFit: "cover", borderRadius: 4 }}
                            />
                        ) : (
                            "Không có ảnh"
                        )
                    }
                />

                <Column title="Tác giả" dataIndex="author" />
                <Column
                    title="Chức năng"
                    key="actions"
                    render={(_, record: any) => (
                        <Space>
                            <Button
                                type="primary"
                                onClick={() =>
                                    nav(`/dashboard/blog/edit/${record._id}`)
                                }
                            >
                                Sửa
                            </Button>
                            <Popconfirm
                                title="Bạn có chắc muốn xoá không?"
                                onConfirm={() => handleDelete(record._id)}
                                okText="Xoá"
                                cancelText="Huỷ"
                                placement="bottomRight"
                            >
                                <Button type="link" danger>
                                    Xoá
                                </Button>
                            </Popconfirm>
                        </Space>
                    )}
                />
            </Table>
        </div>
    );
};

export default ListBlog;
