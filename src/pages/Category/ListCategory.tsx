import React from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  Button,
  Space,
  Table,
  Image,
  Modal,
  Popconfirm,
} from 'antd';
import Column from 'antd/es/table/Column';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const { confirm } = Modal;

const ListCategory = () => {
  const nav = useNavigate();
  const queryClient = useQueryClient();

  const { data: dataSource, isLoading } = useQuery({
    queryKey: ['category'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:8888/api/category', {
  params: {
    limit: 1000,
    offset: 0,
    sortBy: 'createdAt',
    order: 'desc',
    
  }
});
      return data.data;
    },
  });

  const { mutate } = useMutation({
    mutationFn: async (id: string) => {
      try {
        await axios.delete(`http://localhost:8888/api/category/${id}`);
      toast.success('Xoá danh mục thành công!');
      queryClient.invalidateQueries({ queryKey: ['category'] });
      } catch (err:any) {
          console.error('Xoá thất bại:', err.response?.data || err.message);
      }
      
    },
  });

  const handleDelete = (id: string) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xoá danh mục này không?',
      okText: 'Xoá',
      okType: 'danger',
      cancelText: 'Huỷ',
      onOk() {
        mutate(id);
      },
    });
  };

  return (
    <div>
           <h2 className="text-3xl font-bold text-indigo-600 mb-5"> Danh Sách Danh Mục </h2>


       <div className="flex justify-between mb-5">
        <Button
          type="primary"
          onClick={() => nav('/dashboard/category/create')}
        >
          Thêm mới
        </Button>
        <Button onClick={() => nav("/dashboard/category/deleted")}>
            Xem sản phẩm đã xoá
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
        <Column title="Tên" dataIndex="name" key="name" />
        <Column
          title="Mô tả"
          dataIndex="description"
          key="description"
        />
    <Column
  title="Ảnh"
  dataIndex="imageUrl"
  key="image"
  render={(images: string[] | string) => {
    const firstImage =
      Array.isArray(images) ? images[0] : images;

    return (
      <Image
        src={firstImage}
        alt="Ảnh"
        width={60}
        height={60}
        style={{ objectFit: "cover", borderRadius: 4 }}
      />
    );
  }}
/>

       <Column
  title="Chức năng"
  key="actions"
  render={(_, record: any) => {
    const isDefault = record.name === "Điện thoại";

    return (
      <Space>
        {!isDefault && (
          <>
            <Button
              type="primary"
              onClick={() =>
                nav(`/dashboard/category/edit/${record._id}`)
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
          </>
        )}
      </Space>
    );
  }}
/>

      </Table>
    </div>
  );
};

export default ListCategory;
