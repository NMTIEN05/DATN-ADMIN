import React from "react";
import { Upload, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";

interface Props {
  fileList: UploadFile[];
  setFileList: (list: UploadFile[]) => void;
  setImageUrl: (urls: string[]) => void; // ✅ sửa thành mảng
  maxCount?: number;
}

const ImageUpload: React.FC<Props> = ({
  fileList,
  setFileList,
  setImageUrl,
  maxCount = 5,
}) => {
  const handleBeforeUpload = async (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isLt2M = file.size / 1024 / 1024 < 2;

    if (!isImage) {
      message.error("Chỉ được upload file ảnh!");
      return Upload.LIST_IGNORE;
    }

    if (!isLt2M) {
      message.error("Ảnh phải nhỏ hơn 2MB!");
      return Upload.LIST_IGNORE;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (data.secure_url) {
        const newFile: UploadFile = {
          uid: String(Date.now()),
          name: file.name,
          status: "done",
          url: data.secure_url,
        };

        const updatedList = [...fileList, newFile];
        setFileList(updatedList);
        setImageUrl(updatedList.map((f) => f.url!));
      } else {
        message.error("Không upload được ảnh!");
      }
    } catch (err) {
      message.error("Lỗi upload ảnh!");
    }

    return false;
  };

  return (
    <Upload
      listType="picture-card"
      fileList={fileList}
      accept="image/*"
      beforeUpload={handleBeforeUpload}
      onRemove={(file) => {
        const updatedList = fileList.filter((f) => f.uid !== file.uid);
        setFileList(updatedList);
        setImageUrl(updatedList.map((f) => f.url!));
      }}
      maxCount={maxCount}
    >
      {fileList.length >= maxCount ? null : (
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>Upload</div>
        </div>
      )}
    </Upload>
  );
};

export default ImageUpload;
/**
 * 📌 Cách sử dụng component ImageUpload:
 * 
 * import ImageUpload from "đường/dẫn/tới/ImageUpload";
 * 
 * const [fileList, setFileList] = useState<UploadFile[]>([]);
 * const [imageUrls, setImageUrls] = useState<string[]>([]);
 * 
 * <ImageUpload
 *   fileList={fileList}
 *   setFileList={setFileList}
 *   setImageUrl={setImageUrls}
 *   maxCount={5} // số lượng ảnh tối đa
 * />
 * 
 * 👉 Kết quả:
 * - fileList: chứa thông tin file hiển thị trên UI Ant Design.
 * - imageUrls: mảng các đường dẫn ảnh (Cloudinary) sau khi upload thành công.
 * 
 * 👉 Lưu ý:
 * - `setImageUrl` nên truyền vào một `useState` kiểu `string[]`
 * - Ảnh sẽ được upload trực tiếp lên Cloudinary (dùng preset & cloud name từ biến môi trường .env)
 * - Nên kiểm tra `imageUrls.length > 0` trước khi submit form.
 */
