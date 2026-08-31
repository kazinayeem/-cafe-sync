import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload an Express file buffer to Cloudinary and return the secure URL.
 */
export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder = "cafe_sync/products"
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (
        error: UploadApiErrorResponse | Error | undefined,
        result: UploadApiResponse | undefined
      ) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Cloudinary upload failed"));
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Upload a Base64 data string or image URL to Cloudinary.
 */
export const uploadBase64ToCloudinary = async (
  base64String: string,
  folder = "cafe_sync/products"
): Promise<string> => {
  const result = await cloudinary.uploader.upload(base64String, {
    folder,
    resource_type: "image",
  });
  return result.secure_url;
};

export default cloudinary;
