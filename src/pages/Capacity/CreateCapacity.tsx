import React, { useState } from "react";
import { Form, Input, Button, Card, message, Select, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const { Option } = Select;

const CreateCapacity = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: { value: string; unit: string }) => {
    const capacity = values.value + values.unit;

    try {
      await axios.post("http://localhost:8888/api/capacity", { capacity });
      toast.success("Thêm dung lượng thành công!");
      setTimeout(() => {
        navigate("/dashboard/capacity");
      }, 1500);
    } catch (error: any) {
      console.error(error?.response?.data || error.message);
      message.error("Tạo dung lượng thất bại!");
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-indigo-600 mb-5">Thêm mới Dung Lượng</h2>
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
                  <Input type="number" placeholder="Nhập số, ví dụ: 128" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="unit"
                  noStyle
                  rules={[{ required: true, message: "Chọn đơn vị!" }]}
                >
                  <Select placeholder="Chọn đơn vị">
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
              Tạo dung lượng
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateCapacity;
