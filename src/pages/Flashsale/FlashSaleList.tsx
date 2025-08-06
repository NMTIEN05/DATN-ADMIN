import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Space, Modal, Popconfirm, Tag } from 'antd';
import Column from 'antd/es/table/Column';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const { confirm } = Modal;

const ListFlashSale = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: flashSales, isLoading } = useQuery({
    queryKey: ['flashsales'],
    queryFn: async () => {
      const { data } = await axios.get(`${import.meta.env.VITE_PUBLIC_API_URL}api/flashsale`);
      return data;
    },
  });

  const { mutate: deleteFlashSale } = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${import.meta.env.VITE_PUBLIC_API_URL}api/flashsale/${id}`);
      toast.success('✅ Xoá Flash Sale thành công!');
      queryClient.invalidateQueries({ queryKey: ['flashsales'] });
    },
  });

  const handleDelete = (id: string) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xoá Flash Sale này không?',
      okText: 'Xoá',
      okType: 'danger',
      cancelText: 'Huỷ',
      onOk() {
        deleteFlashSale(id);
      },
    });
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-indigo-600 mb-5">Danh Sách Flash Sale</h2>

      <div className="flex justify-between mb-5">
        <Button type="primary" onClick={() => navigate('/dashboard/flashsale/create')}>
          Thêm mới
        </Button>
      </div>

      <Table dataSource={flashSales?.data || []} rowKey="_id" loading={isLoading} pagination={{ pageSize: 5 }}>
        <Column title="STT" render={(_, __, index) => index + 1} />
        <Column title="Tên" dataIndex="title" />
        <Column
          title="Sản phẩm"
          dataIndex="products"
          render={(products: string[]) => (
            <span>{products.length} sản phẩm</span>
          )}
        />
        <Column title="Giảm giá (%)" dataIndex="discountPercent" />
        <Column
          title="Bắt đầu"
          dataIndex="startTime"
          render={(val) => dayjs(val).format('DD/MM/YYYY HH:mm')}
        />
        <Column
          title="Kết thúc"
          dataIndex="endTime"
          render={(val) => dayjs(val).format('DD/MM/YYYY HH:mm')}
        />
        <Column title="Giới hạn" dataIndex="limitQuantity" />
        <Column
          title="Trạng thái"
          dataIndex="isActive"
          render={(active: boolean) => (
            <Tag color={active ? 'green' : 'red'}>
              {active ? 'Kích hoạt' : 'Vô hiệu hóa'}
            </Tag>
          )}
        />
        <Column
          title="Chức năng"
          render={(_, record: any) => (
            <Space>
              <Button type="primary" onClick={() => navigate(`/dashboard/flashsale/edit/${record._id}`)}>
                Sửa
              </Button>
              <Popconfirm
                title="Bạn có chắc muốn xoá?"
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

export default ListFlashSale;
