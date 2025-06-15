import React from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  Table,
  Button,
  Space,
  Modal,
  Typography,
  Tag,
} from 'antd';
import Column from 'antd/es/table/Column';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const { confirm } = Modal;

const ListColor = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: dataSource, isLoading } = useQuery({
    queryKey: ['colors'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:8888/api/color');
      return data;
    },
  });

  // Delete mutation
  const { mutate } = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`http://localhost:8888/api/color/${id}`);
      toast.success('Xoá màu thành công!');
      queryClient.invalidateQueries({ queryKey: ['colors'] });
    },
  });

  const handleDelete = (id: string) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xoá màu này không?',
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
      <h2 className="text-3xl font-bold text-indigo-600 mb-5">Danh sách màu</h2>

      <div className="text-left mb-5">
        <Button type="primary" onClick={() => navigate('/dashboard/colors/create')}>
          Thêm mới
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
        <Column title="Tên màu" dataIndex="name" key="name" render={(text: string) => <Tag>{text}</Tag>} />
        <Column
          title="Chức năng"
          key="actions"
          render={(_, record: any) => (
            <Space>
              <Button
                type="primary"
                onClick={() => navigate(`/dashboard/colors/edit/${record._id}`)}
              >
                Sửa
              </Button>
              <Button
                danger
                onClick={() => handleDelete(record._id)}
              >
                Xoá
              </Button>
            </Space>
          )}
        />
      </Table>
    </div>
  );
};

export default ListColor;
