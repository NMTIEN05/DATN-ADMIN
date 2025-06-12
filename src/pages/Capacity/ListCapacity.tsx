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
  Modal,
  Typography,
} from 'antd';
import Column from 'antd/es/table/Column';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const { confirm } = Modal;

const ListCapacity = () => {
  const nav = useNavigate();
  const queryClient = useQueryClient();

  // Fetch list of capacities
  const { data: dataSource, isLoading } = useQuery({
    queryKey: ['capacity'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:8888/api/capacity');
      return data;
    },
  });

  // Mutation: delete capacity
  const { mutate } = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`http://localhost:8888/api/capacity/${id}`);
      toast.success('Xoá dung lượng thành công!');
      queryClient.invalidateQueries({ queryKey: ['capacity'] });
    },
  });

  const handleDelete = (id: string) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xoá dung lượng này không?',
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
      <h2 className="text-3xl font-bold text-indigo-600 mb-5"> Danh Sách Dung Lượng </h2>

      <div className="text-left mb-5">
        <Button
          type="primary"
          onClick={() => nav('/dashboard/capacity/create')}
        >
          Thêm mới
        </Button>
      </div>

      <Table
        dataSource={dataSource}
        rowKey="_id"
        loading={isLoading}
        pagination={{ pageSize: 5 }}
      >
        <Column title="STT" key="index" render={(_, __, index) => index + 1} />
        <Column title="Dung lượng" dataIndex="capacity" key="capacity" />
        <Column
          title="Chức năng"
          key="actions"
          render={(_, record: any) => (
            <Space>
              <Button
                type="primary"
                onClick={() => nav(`/dashboard/capacity/edit/${record._id}`)}
              >
                Sửa
              </Button>
              <Button danger onClick={() => handleDelete(record._id)}>
                Xoá
              </Button>
            </Space>
          )}
        />
      </Table>
    </div>
  );
};

export default ListCapacity;
