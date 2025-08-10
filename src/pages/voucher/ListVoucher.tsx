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
    Popconfirm,
    Tag,
  } from 'antd';
  import Column from 'antd/es/table/Column';
  import axios from 'axios';
  import { useNavigate } from 'react-router-dom';
  import { toast } from 'react-toastify';
  import jwtDecode from 'jwt-decode';
  import dayjs from 'dayjs';

  const { confirm } = Modal;

  const ListCoupon = () => {
    const nav = useNavigate();
    const queryClient = useQueryClient();

    // 🔍 Lấy danh sách mã giảm giá (có token)
    const { data: dataSource, isLoading } = useQuery({
      queryKey: ['vouchers'],
      queryFn: async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) throw new Error('Chưa đăng nhập');

          const decoded = jwtDecode(token);
          console.log('👤 Token decode:', decoded);

          const { data } = await axios.get('http://localhost:8888/api/vouchers', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          console.log('✅ Dữ liệu mã giảm giá:', data);
          return data;
        } catch (error) {
          console.error('❌ Lỗi khi gọi API:', error);
          toast.error('Không thể lấy danh sách mã giảm giá!');
          return [];
        }
      },
    });

    // 🗑️ Xoá mã giảm giá (có token)
    const { mutate } = useMutation({
      mutationFn: async (id: string) => {
        try {
          const token = localStorage.getItem('token');
          if (!token) throw new Error('Chưa đăng nhập');

          console.log('🗑️ Đang xoá mã với ID:', id);
          await axios.delete(`http://localhost:8888/api/vouchers/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          toast.success('✅ Xoá mã giảm giá thành công!');
          queryClient.invalidateQueries({ queryKey: ['vouchers'] });
        } catch (error) {
          console.error('❌ Lỗi khi xoá mã:', error);
          toast.error('Không thể xoá mã giảm giá!');
        }
      },
    });

    const handleDelete = (id: string) => {
      confirm({
        title: 'Bạn có chắc chắn muốn xoá mã giảm giá này không?',
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
        <h2 className="text-3xl font-bold text-indigo-600 mb-5">Danh Sách Mã Giảm Giá</h2>

        <div className="flex justify-between mb-5">
          <Button type="primary" onClick={() => nav('/dashboard/vouchers/add')}>
            Thêm mã mới
          </Button>
        </div>

        <Table
          dataSource={dataSource}
          rowKey="_id"
          loading={isLoading}
          pagination={{ pageSize: 5 }}
        >
          <Column title="STT" key="index" render={(_, __, index) => index + 1} />
          <Column title="Mã" dataIndex="code" key="code" />
          <Column
            title="Giảm"
            key="discount"
            render={(record: any) =>
              record.discountType === 'fixed'
                ? `${record.discountValue.toLocaleString()} ₫`
                : `${record.discountValue}%` + (record.maxDiscount ? ` (tối đa ${record.maxDiscount.toLocaleString()} ₫)` : '')
            }
          />
        <Column
  title="Danh mục áp dụng"
  key="categories"
  render={(record: any) => {
    const categories = record.categories;
    return Array.isArray(categories) && categories.length > 0 ? (
      <>
        {categories.map((cat: any) => (
          <Tag color="blue" key={cat._id}>
            {cat.name}
          </Tag>
        ))}
      </>
    ) : (
      <Tag color="gray">Tất cả</Tag>
    );
  }}
/>


          <Column
            title="Số lượt dùng"
            key="usage"
            render={(record: any) => (
              <span>
                {record.usedCount} / {record.usageLimit}
              </span>
            )}
          />
          <Column
            title="Đơn tối thiểu"
            key="minOrder"
            render={(record: any) =>
              record.minOrderValue
                ? `${record.minOrderValue.toLocaleString()} ₫`
                : 'Không'
            }
          />
          <Column
            title="Thời gian"
            key="time"
            render={(record: any) => (
              <div>
                <div>
                  <Tag color="green">Bắt đầu:</Tag>{' '}
                  {dayjs(record.startDate).format('DD/MM/YYYY')}
                </div>
                <div>
                  <Tag color="red">Kết thúc:</Tag>{' '}
                  {dayjs(record.endDate).format('DD/MM/YYYY')}
                </div>
              </div>
            )}
          />
          <Column
            title="Chức năng"
            key="actions"
            render={(_, record: any) => (
              <Space>
                <Button
                  type="primary"
                  onClick={() => nav(`/dashboard/vouchers/${record._id}`)}
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

  export default ListCoupon;
