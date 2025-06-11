export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "nmtien"); // 👈 Thay bằng preset bạn tạo
  const cloudName = "dhy3a5frj"; // 👈 Thay bằng tên Cloudinary của bạn

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();
  console.log("📸 Kết quả Cloudinary:", data);

  if (!data.secure_url) {
    throw new Error("Upload ảnh thất bại");
  }

  return data.secure_url;
};
