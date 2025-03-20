import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

export const uploadFileToMongoDB = async (fileData) => {
  try {
    // Extract file info from base64 string
    const [metaInfo, base64Data] = fileData.split(",");

    // Determine file extension from the meta info
    let fileExtension = ".bin"; // Default
    const matches = metaInfo.match(/data:(.*);/);
    let contentType = "application/octet-stream";

    if (matches && matches[1]) {
      contentType = matches[1];

      // Map common mime types to extensions
      const mimeToExtension = {
        "application/pdf": ".pdf",
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "application/msword": ".doc",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          ".docx",
      };

      fileExtension = mimeToExtension[contentType] || ".bin";
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, "base64");

    // Generate unique filename
    const fileName = `${uuidv4()}${fileExtension}`;

    // Return the file object that can be stored in MongoDB
    return {
      filename: fileName,
      data: buffer,
      contentType: contentType,
    };
  } catch (error) {
    console.error("Error preparing file for MongoDB:", error);
    throw error;
  }
};
