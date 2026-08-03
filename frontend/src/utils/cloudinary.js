const CLOUD_NAME = "dvr0ib995";
const UPLOAD_PRESET = "urbansync_uploads";

export const uploadToCloudinary = async (file, folder = "urbansync") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    { method: "POST", body: formData },
  );

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  const data = await response.json();
  return data.secure_url;
};

export const uploadMultipleToCloudinary = async (
  files,
  folder = "urbansync",
) => {
  const uploadPromises = Array.from(files).map((file) =>
    uploadToCloudinary(file, folder),
  );
  return Promise.all(uploadPromises);
};
