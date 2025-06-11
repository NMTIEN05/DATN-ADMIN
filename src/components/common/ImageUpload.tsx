// components/ImageUpload.tsx

import React from "react";
import { Upload, message } from "antd";
import ImgCrop from "antd-img-crop";
import { PlusOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";

interface Props {
  fileList: UploadFile[];
  setFileList: (list: UploadFile[]) => void;
  setImageFile: (file: File | null) => void;
  maxCount?: number;
}

const ImageUpload: React.FC<Props> = ({
  fileList,
  setFileList,
  setImageFile,
  maxCount = 2,
}) => {
  const handleChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList);
    const latestFile = newFileList[0];
    if (latestFile?.originFileObj) {
      setImageFile(latestFile.originFileObj as File);
    }
  };

  return (
    <ImgCrop aspect={1} showGrid rotationSlider>
      <Upload
        listType="picture-card"
        fileList={fileList}
        accept="image/*"
        onChange={handleChange}
        beforeUpload={(file) => {
          const isImage = file.type.startsWith("image/");
          const isLt2M = file.size / 1024 / 1024 < 2;
          if (!isImage) message.error("Chỉ được upload file ảnh!");
          if (!isLt2M) message.error("Ảnh phải nhỏ hơn 2MB!");
          return isImage && isLt2M;
        }}
        customRequest={({ onSuccess }) => {
          setTimeout(() => {
            onSuccess?.("ok");
          }, 0);
        }}
        onRemove={() => {
          setImageFile(null);
          setFileList([]);
        }}
      >
        {fileList.length >= maxCount ? null : (
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        )}
      </Upload>
    </ImgCrop>
  );
};

export default ImageUpload;
