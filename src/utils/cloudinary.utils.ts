import fs from "fs";
import _env from "../config/envConfig";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: _env.CLOUDINARY_CLOUD_NAME,
  api_key: _env.CLOUDINARY_API_KEY,
  api_secret: _env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (
  filePath: string,
  folder: string = "quickbrainai"
) => {
  try {
    if (!filePath) return false;
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto",
    });
    fs.unlinkSync(filePath);
    return result;
  } catch (error) {
    fs.unlinkSync(filePath);
    return false;
  }
};
const deleteOnCloudinary = async (publicId: string) => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    return false;
  }
};

const deleteMultipleOnCloudinary = async (publicIds: string[]) => {
  try {
    return await cloudinary.api.delete_resources(publicIds);
  } catch (error) {
    return false;
  }
};

export { uploadOnCloudinary, deleteOnCloudinary, deleteMultipleOnCloudinary };
