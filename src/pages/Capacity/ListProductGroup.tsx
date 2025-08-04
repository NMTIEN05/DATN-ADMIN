import React from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  Button,
  Table,
  Space,
  Modal,
  Typography,
  Image,
  Popconfirm,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const { Column } = Table;
const { confirm } = Modal;

const ListProductGroup = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ✅ Lấy danh sách dòng sản phẩm
  const { data: dataSource, isLoading } = useQuery({
    queryKey: ['productGroup'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:8888/api/productGroup');
      console.log("dataSource raw:", dataSource);
console.log("dataSource?.data:", dataSource?.data);
console.log("Is dataSource?.data an array?", Array.isArray(dataSource?.data));
      return data;
    },
  });

  // ✅ Xoá dòng sản phẩm
  const { mutate } = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`http://localhost:8888/api/productGroup/${id}`);
    },
    onSuccess: () => {
      toast.success('Xoá dòng sản phẩm thành công!');
      queryClient.invalidateQueries({ queryKey: ['productGroup'] });
    },
    onError: () => {
      toast.error('Xoá dòng sản phẩm thất bại!');
    },
  });

  const handleDelete = (id: string) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xoá dòng sản phẩm này không?',
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
      <h2 className="text-3xl font-bold text-indigo-600 mb-5">Danh sách dòng sản phẩm</h2>

      <div className="flex justify-between mb-5">
        <Button type="primary" onClick={() => navigate('/dashboard/capacity/create')}>
          + Thêm mới
        </Button>
        <Button onClick={() => navigate("/dashboard/capacity/deleted")}>
                    Xem sản phẩm đã xoá
                  </Button>
      </div>

    <Table
  dataSource={ dataSource?.data || []}  // lấy đúng mảng data bên trong
  rowKey="_id"
  loading={isLoading}
  pagination={{ pageSize: 5 }}
  
>

        <Column title="STT" render={(_, __, index) => index + 1} />
     <Column
  title="Ảnh"
  dataIndex="imageUrl"
  render={(urls: string[] = []) => (
    urls.length > 0 ? (
      <Image
        src={urls[0]}
        width={60}
        height={60}
        style={{ objectFit: 'cover', borderRadius: 8 }}
      />
    ) : (
      <span>Không có ảnh</span>
    )
  )}
/>

        <Column title="Tên dòng" dataIndex="name" />
        <Column
          title="Danh mục"
          dataIndex="categoryId"
          render={(category: any) => category?.name || 'Không rõ'}
        />
        
        

        <Column title="Mô tả ngắn" dataIndex="shortDescription" />
        <Column
          title="Chức năng"
          render={(_, record: any) => (
            <Space>
              <Button
                type="primary"
                onClick={() => navigate(`/dashboard/capacity/edit/${record._id}`)}
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

export default ListProductGroup;
