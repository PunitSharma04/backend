import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDIANRY_CLOUD_NAME,
  api_key: process.env.CLOUDIANRY_API_KEY,
  api_secret: process.env.CLOUDIANRY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on the cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    //file has been uploaded successfully
    console.log(":File has been uploaded on cloudinary", response.url);
    // fs.unlinkSync(localFilePath)
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath) // remove the locally saved file as the operation got failed
    return null
  }
};
// Delete from Cloudinary (video or image)
const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
    return null;
  }
};

export {uploadOnCloudinary,deleteFromCloudinary}