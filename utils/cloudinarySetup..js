import { v2 as cloudinary } from "cloudinary"; 
import fs from "fs";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const generateUniqueFilename = (filePath) => {
  const extname = path.extname(filePath);
  const basename = path.basename(filePath, extname);
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.-]/g, ""); 
  return `${basename}-${timestamp}${extname}`;
};

const checkFileExists = (filePath) => {
  return fs.existsSync(filePath);
};

export const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) {
    return { statusCode: 400, message: "Invalid file path provided." };
  }

  const uniqueFilename = generateUniqueFilename(localFilePath);
  const fileWithUniqueName = path.join(path.dirname(localFilePath), uniqueFilename);

  if (checkFileExists(fileWithUniqueName)) {
   return { statusCode: 409, message: `File with the name ${uniqueFilename} already exists locally.` };
  }

  try {
    fs.renameSync(localFilePath, fileWithUniqueName);

    const response = await cloudinary.uploader.upload(fileWithUniqueName, {
      resource_type: "auto",
      folder: "greyAllegiance", 
    });

   
    fs.unlinkSync(fileWithUniqueName);

    return { statusCode: 200, message: "File uploaded successfully.", data: response };
  } catch (error) {
    console.error("Error uploading file to Cloudinary: ", error);


    try {
      if (fs.existsSync(fileWithUniqueName)) {
        fs.unlinkSync(fileWithUniqueName);
      }
    } catch (unlinkError) {
      console.error("Error removing temporary file: ", unlinkError);
    }

    return { statusCode: 500, message: "Error uploading file to Cloudinary.", error: error.message };
  }
};


export const uploadImageToCloudinary = async (file) => {
  if (!file || !file.buffer) {
      return { statusCode: 400, message: "Invalid file provided." };
  }

  try {
      const uploadResponse = await cloudinary.uploader.upload_stream({
          resource_type: "auto", // Automatically handle resource type (image, video, etc.)
          folder: "greyAllegiance",   // Specify the folder in Cloudinary
      }, (error, result) => {
          if (error) {
              console.error("Error uploading file to Cloudinary: ", error);
              return { statusCode: 500, message: "Error uploading file to Cloudinary.", error: error.message };
          }
          return { statusCode: 200, message: "File uploaded successfully.", data: result };
      });

      // Create a stream and pipe the buffer to Cloudinary
      const stream = cloudinary.uploader.upload_stream(uploadResponse);
      stream.end(file.buffer); // This sends the buffer to Cloudinary

      return uploadResponse; // Return the upload response
  } catch (error) {
      console.error("Error during Cloudinary upload: ", error);
      return { statusCode: 500, message: "Error uploading file to Cloudinary.", error: error.message };
  }
};



export const uploadResumeToCloudinary = async (localFilePath) => {
    if (!localFilePath) {
      return { statusCode: 400, message: "Invalid file path provided." };
    }
  
    const allowedExtensions = [".pdf", ".docx"];
    const fileExtension = path.extname(localFilePath).toLowerCase();
  
    // Check if the file format is allowed
    if (!allowedExtensions.includes(fileExtension)) {
      return { statusCode: 400, message: "Invalid file format. Only PDF and DOCX files are allowed." };
    }
  
    const uniqueFilename = generateUniqueFilename(localFilePath);
    const fileWithUniqueName = path.join(path.dirname(localFilePath), uniqueFilename);
  
    if (checkFileExists(fileWithUniqueName)) {
      return { statusCode: 409, message: `File with the name ${uniqueFilename} already exists locally.` };
    }
  
    try {
      fs.renameSync(localFilePath, fileWithUniqueName);
  
      const response = await cloudinary.uploader.upload(fileWithUniqueName, {
        resource_type: "raw", // "raw" allows uploading non-image files like PDFs and DOCX
        folder: "greyAllegiance/resumes",
      });
  
      fs.unlinkSync(fileWithUniqueName); // Remove the local file after upload
  
      return { statusCode: 200, message: "Resume uploaded successfully.", data: response };
    } catch (error) {
      console.error("Error uploading resume to Cloudinary:", error);
  
      // Cleanup: Remove temporary file if upload fails
      try {
        if (fs.existsSync(fileWithUniqueName)) {
          fs.unlinkSync(fileWithUniqueName);
        }
      } catch (unlinkError) {
        console.error("Error removing temporary file:", unlinkError);
      }
  
      return { statusCode: 500, message: "Error uploading resume to Cloudinary.", error: error.message };
    }
  };
  

  export const uploadThumbnailToCloudinary = async (localFilePath) => {
    if (!localFilePath) {
        return { statusCode: 400, message: "Invalid file path provided." };
    }

    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const fileExtension = path.extname(localFilePath).toLowerCase();

    // Check if the file format is allowed
    if (!allowedExtensions.includes(fileExtension)) {
        return { statusCode: 400, message: "Invalid file format. Only JPG, PNG, GIF, and WEBP files are allowed." };
    }

    const uniqueFilename = generateUniqueFilename(localFilePath);
    const fileWithUniqueName = path.join(path.dirname(localFilePath), uniqueFilename);

    if (checkFileExists(fileWithUniqueName)) {
        return { statusCode: 409, message: `File with the name ${uniqueFilename} already exists locally.` };
    }

    try {
        fs.renameSync(localFilePath, fileWithUniqueName);

        const response = await cloudinary.uploader.upload(fileWithUniqueName, {
            resource_type: "image", // Ensures only images are uploaded
            folder: "greyAllegiance/thumbnails",
        });

        fs.unlinkSync(fileWithUniqueName); // Remove the local file after upload

        return { statusCode: 200, message: "Thumbnail uploaded successfully.", data: response };
    } catch (error) {
        console.error("Error uploading thumbnail to Cloudinary:", error);

        // Cleanup: Remove temporary file if upload fails
        try {
            if (fs.existsSync(fileWithUniqueName)) {
                fs.unlinkSync(fileWithUniqueName);
            }
        } catch (unlinkError) {
            console.error("Error removing temporary file:", unlinkError);
        }

        return { statusCode: 500, message: "Error uploading thumbnail to Cloudinary.", error: error.message };
    }
};
