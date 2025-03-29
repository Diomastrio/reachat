import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Uploads a file to Supabase storage
 * @param {Object} file - The file object from multer
 * @param {String} bucketName - The Supabase bucket name
 * @returns {Object} - File metadata including the URL
 */
export const uploadFileToSupabase = async (
  file,
  bucketName = "assignments"
) => {
  try {
    // Read file from disk (the file saved by multer)
    const fileBuffer = fs.readFileSync(file.path);

    // Create a unique filename
    const fileExt = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${fileExt}`;

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(`uploads/${fileName}`, fileBuffer, {
        contentType: file.mimetype,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`Supabase storage error: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(`uploads/${fileName}`);

    // Remove the local file after successful upload
    fs.unlinkSync(file.path);

    // Return file metadata with the Supabase URL
    return {
      filename: fileName,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path, // Keep for compatibility
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error("Error uploading to Supabase:", error);
    throw error;
  }
};

export default supabase;
