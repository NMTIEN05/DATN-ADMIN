export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  if (!file) throw new Error("Không có file để upload");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok || !data.secure_url) {
    console.error("Cloudinary error:", data);
    throw new Error("Upload ảnh thất bại!");
  }

  return data.secure_url;
};
