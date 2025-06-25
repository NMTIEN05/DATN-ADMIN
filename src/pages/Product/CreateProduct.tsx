import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  message,
  Select,
} from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import type { UploadFile } from "antd/es/upload/interface";
import ImageUpload from "../../components/common/ImageUpload";

const CreateProduct = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageUrl, setImageUrl] = useState<string[]>([]);

  const [variantFileLists, setVariantFileLists] = useState<Record<number, UploadFile[]>>({});
  const [variantImageUrls, setVariantImageUrls] = useState<Record<number, string[]>>({});

  const [categories, setCategories] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [colorAttrId, setColorAttrId] = useState<string>("");

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [catRes, groupRes, attrRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_PUBLIC_API_URL}api/category`),
          axios.get(`${import.meta.env.VITE_PUBLIC_API_URL}api/productGroup`),
          axios.get(`${import.meta.env.VITE_PUBLIC_API_URL}api/attributes`),
        ]);

        setCategories(catRes.data);
        setGroups(groupRes.data);

        const colorAttr = attrRes.data.find(
          (attr: any) => attr.attributeCode === "color"
        );
        if (colorAttr) setColorAttrId(colorAttr._id);
      } catch (err) {
        message.error("Không thể tải dữ liệu ban đầu");
      }
    };
    fetchInitial();
  }, []);

  const onFinish = async (values: any) => {
    try {
      if (!imageUrl || imageUrl.length === 0 || imageUrl[0].startsWith("blob:")) {
        message.error("Vui lòng tải ít nhất 1 ảnh sản phẩm hợp lệ!");
        return;
      }

      const payload = {
        title: values.title,
        capacity: values.capacity,
        slug: values.slug,
        description: values.description,
        shortDescription: values.shortDescription,
        imageUrl: imageUrl,
        priceDefault: values.variants[0]?.price || 0,
        categoryId: values.categoryId,
        groupId: values.groupId,
      };

      const productRes = await axios.post(
        `${import.meta.env.VITE_PUBLIC_API_URL}api/product`,
        payload
      );

      const productId = productRes.data._id;
      const variantIds: string[] = [];

      for (let i = 0; i < values.variants.length; i++) {
        const variant = values.variants[i];
        const variantImages = variantImageUrls[i];
        if (!variantImages || variantImages.length === 0 || variantImages[0].startsWith("blob:")) {
          message.error(`Biến thể #${i + 1} chưa có ảnh hợp lệ!`);
          return;
        }

        const colorRes = await axios.post(
          `${import.meta.env.VITE_PUBLIC_API_URL}api/AttributeValue`,
          {
            value: variant.color,
            valueCode: variant.color.toLowerCase().replace(/\s+/g, "-"),
            attributeId: colorAttrId,
          }
        );

        const variantRes = await axios.post(
          `${import.meta.env.VITE_PUBLIC_API_URL}api/variants`,
          {
            name: `${values.title} - ${variant.color}`,
            imageUrl: variantImages,
            price: variant.price,
            oldPrice: null,
            stock: variant.stock,
            productId: productId,
            attributes: [
              {
                attributeId: colorAttrId,
                attributeValueId: colorRes.data._id,
              },
            ],
          }
        );

        variantIds.push(variantRes.data._id);
      }

      await axios.put(
        `${import.meta.env.VITE_PUBLIC_API_URL}api/product/${productId}`,
        {
          variants: variantIds,
        }
      );

      toast.success("Tạo sản phẩm thành công!");
      setTimeout(() => navigate("/dashboard/product"), 1500);
    } catch (err: any) {
      console.error("❌ Lỗi tạo sản phẩm: ", err.response?.data || err.message);
      message.error("Tạo sản phẩm thất bại!");
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-indigo-600 mb-5">Thêm sản phẩm</h2>
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Tên sản phẩm" name="title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Slug" name="slug" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          {/* Ảnh chính của sản phẩm */}
          <ImageUpload
            fileList={fileList}
            setFileList={setFileList}
            setImageUrl={setImageUrl}
            maxCount={5}
          />

          <Form.Item label="Danh mục" name="categoryId" rules={[{ required: true }]}>
            <Select placeholder="Chọn danh mục">
              {categories.map((cat) => (
                <Select.Option key={cat._id} value={cat._id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Dòng sản phẩm" name="groupId" rules={[{ required: true }]}>
            <Select placeholder="Chọn dòng sản phẩm">
              {groups.map((g) => (
                <Select.Option key={g._id} value={g._id}>
                  {g.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Mô tả ngắn" name="shortDescription">
            <Input />
          </Form.Item>

          <Form.Item label="Mô tả chi tiết" name="description">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item label="Dung lượng điện thoại" name="capacity">
            <Input />
          </Form.Item>

          <Form.List
            name="variants"
            rules={[
              {
                validator: async (_, value) =>
                  !value || value.length < 1
                    ? Promise.reject(new Error("Thêm ít nhất 1 biến thể!"))
                    : Promise.resolve(),
              },
            ]}
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => (
                  <Card
                    key={key}
                    title={`Biến thể #${index + 1}`}
                    className="mb-6 border border-indigo-300 shadow-sm rounded-lg"
                    extra={<Button danger onClick={() => remove(name)}>Xoá</Button>}
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "color"]}
                      label="Màu sắc"
                      rules={[{ required: true }]}
                    >
                      <Input placeholder="VD: Đỏ, Xanh..." />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "price"]}
                      label="Giá"
                      rules={[{ required: true }]}
                    >
                      <InputNumber style={{ width: "100%" }} min={0} />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "stock"]}
                      label="Tồn kho"
                      rules={[{ required: true }]}
                    >
                      <InputNumber style={{ width: "100%" }} min={0} />
                    </Form.Item>

                    <Form.Item label="Ảnh biến thể" required>
                      <ImageUpload
                        fileList={variantFileLists[index] || []}
                        setFileList={(files) =>
                          setVariantFileLists((prev) => ({ ...prev, [index]: files }))
                        }
                        setImageUrl={(urls) =>
                          setVariantImageUrls((prev) => ({ ...prev, [index]: urls }))
                        }
                        maxCount={5}
                      />
                    </Form.Item>
                  </Card>
                ))}

                <Form.Item>
                  <Button onClick={() => add()} block type="dashed">
                    + Thêm biến thể
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Tạo sản phẩm
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateProduct;
