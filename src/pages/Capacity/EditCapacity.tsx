import React, { useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Select,
  Row,
  Col,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const { Option } = Select;

const UpdateCapacity = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Fetch dữ liệu ban đầu
  const fetchData = async () => {
    try {
      const { data } = await axios.get(`http://localhost:8888/api/capacity/${id}`);

      // Tách số và đơn vị từ chuỗi capacity (VD: "128GB" → "128", "GB")
      const match = data.capacity.match(/^(\d+)(MB|GB|TB)$/);
      if (match) {
        form.setFieldsValue({ value: match[1], unit: match[2] });
      } else {
        message.error("Dữ liệu dung lượng không hợp lệ!");
      }
    } catch (error: any) {
      console.error(error?.response?.data || error.message);
      message.error("Không thể tải dữ liệu dung lượng!");
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const onFinish = async (values: { value: string; unit: string }) => {
    const capacity = values.value + values.unit;
    try {
      await axios.put(`http://localhost:8888/api/capacity/${id}`, { capacity });
      toast.success("Cập nhật dung lượng thành công!");
      setTimeout(() => {
        navigate("/dashboard/capacity");
      }, 1500);
    } catch (error: any) {
      console.error(error?.response?.data || error.message);
      message.error("Cập nhật dung lượng thất bại!");
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-indigo-600 mb-5">Chỉnh sửa Dung Lượng</h2>
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Dung lượng" required>
            <Row gutter={8}>
              <Col span={16}>
                <Form.Item
                  name="value"
                  noStyle
                  rules={[{ required: true, message: "Vui lòng nhập số dung lượng!" }]}
                >
                  <Input type="number" placeholder="Nhập số, ví dụ: 256" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="unit"
                  noStyle
                  rules={[{ required: true, message: "Chọn đơn vị!" }]}
                >
                  <Select placeholder="Đơn vị">
                    <Option value="MB">MB</Option>
                    <Option value="GB">GB</Option>
                    <Option value="TB">TB</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UpdateCapacity;
