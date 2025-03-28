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



export const uploadResumeToCloudinary = (fileBuffer, mimeType) => {
  return new Promise((resolve, reject) => {
      if (!fileBuffer || !mimeType) {
          return resolve({ statusCode: 400, message: "Invalid file provided." });
      }

      const allowedMimeTypes = {
          "application/pdf": ".pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx"
      };

      if (!allowedMimeTypes[mimeType]) {
          return resolve({ statusCode: 400, message: "Invalid file format. Only PDF and DOCX files are allowed." });
      }

      const uniqueFilename = `resume_${Date.now()}`;

      const stream = cloudinary.uploader.upload_stream(
          {
              resource_type: "raw", 
              folder: "greyAllegiance/resumes",
              public_id: uniqueFilename
          },
          (error, result) => {
              if (error) {
                  console.error("Cloudinary Upload Error:", error);
                  return reject({ statusCode: 500, message: "Error uploading resume to Cloudinary.", error });
              }
              resolve({ statusCode: 200, message: "Resume uploaded successfully.", data: result });
          }
      );

      stream.end(fileBuffer);
  });
};




export const uploadThumbnailToCloudinary = async (file) => {
  if (!file || !file.buffer) {
    return { statusCode: 400, message: "Invalid file provided." };
  }

  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(fileExtension)) {
    return { statusCode: 400, message: "Invalid file format. Only JPG, PNG, GIF, and WEBP files are allowed." };
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image", folder: "greyAllegiance/thumbnails" },
      (error, result) => {
        if (error) {
          console.error("Error uploading thumbnail to Cloudinary:", error);
          return reject({ statusCode: 500, message: "Error uploading thumbnail to Cloudinary.", error: error.message });
        }
        resolve({ statusCode: 200, message: "Thumbnail uploaded successfully.", data: result });
      }
    );

    stream.end(file.buffer); 
  });
};



export const uploadServiceImageToCloudinary = async (file) => {
  if (!file || !file.buffer) {
    return { statusCode: 400, message: "Invalid file provided." };
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "greyAllegiance/service",
      },
      (error, result) => {
        if (error) {
          console.error("Error uploading file to Cloudinary: ", error);
          return reject({ statusCode: 500, message: "Error uploading file to Cloudinary.", error: error.message });
        }
        resolve({ statusCode: 200, message: "File uploaded successfully.", data: result });
      }
    );

    stream.end(file.buffer); 
  });
};
