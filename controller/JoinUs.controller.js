import JoinUs from "../models/JoinUs.model.js";
import { v2 as cloudinary } from "cloudinary";
import { uploadResumeToCloudinary } from "../utils/cloudinarySetup..js";
import { generateJoinUsAdminEmail } from "../utils/EmailTemplate/UserTemplate.js";
import { sendEmail } from "../handlers/SendEmail.js";

  
// Create a new JoinUs entry
export const createJoinUs = async (req, res) => {
    try {
        const { name, email, mobile, aboutYou, whyJoinUs } = req.body;
        let resumeUrl;

        // Validate required fields
        if (!name || !email || !mobile || !aboutYou || !whyJoinUs) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already applied
        const existingApplication = await JoinUs.findOne({ email, mobile, status: "pending" });
        if (existingApplication) {
            return res.status(400).json({
                message: "You have already applied. Your application is under review.",
            });
        }

        // Upload resume from memory buffer
        if (req.file) {
            const uploadResponse = await uploadResumeToCloudinary(req.file.buffer, req.file.mimetype);
            if (uploadResponse.statusCode === 200) {
                resumeUrl = uploadResponse.data.secure_url;
            } else {
                return res.status(uploadResponse.statusCode).json({
                    success: false,
                    message: uploadResponse.message,
                });
            }
        } else {
            return res.status(400).json({ success: false, message: "Please upload a resume." });
        }

        // ✅ Ensure direct download (Cloudinary fix)
        const cloudinaryDownloadUrl = resumeUrl.replace("/upload/", "/upload/fl_attachment/");

        // Save application in DB
        const newJoinUs = new JoinUs({
            name,
            email,
            mobile,
            aboutYou,
            whyJoinUs,
            resume: resumeUrl, // Save normal URL in DB
            appliedDate: new Date().toISOString().split("T")[0],
            appliedTime: new Date().toTimeString().split(" ")[0],
        });

        await newJoinUs.save();

        // Send email to admin with direct download link
        const emailContent = generateJoinUsAdminEmail({
            name,
            email,
            mobile,
            aboutYou,
            whyJoinUs,
            resumeUrl: cloudinaryDownloadUrl, // ✅ Only download, no preview
        });

        await sendEmail(process.env.ADMIN_EMAIL, "New Join Us Application", emailContent);

        res.status(201).json({ message: "Application submitted successfully" });
    } catch (error) {
        console.error("Error submitting application:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getAllJoinUsRequests = async (req, res) => {
    try {
        const { status } = req.query;

        // If status is provided, filter by status. Otherwise, retrieve all requests.
        const filter = status ? { status } : {}; 

        const joinUsRequests = await JoinUs.find(filter).sort({ appliedDate: 1, appliedTime: 1 });

        res.status(200).json({
            message: "JoinUs requests retrieved successfully",
            data: joinUsRequests
        });
    } catch (error) {
        console.error("Error fetching JoinUs requests:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



export const getPendingJoinUsRequests = async (req, res) => {
    try {
        // Fetch only pending JoinUs requests and sort by appliedDate & appliedTime (oldest first)
        const pendingRequests = await JoinUs.find({ status: "pending" }).sort({ appliedDate: 1, appliedTime: 1 });

        res.status(200).json({
            message: "Pending JoinUs requests retrieved successfully",
            data: pendingRequests
        });
    } catch (error) {
        console.error("Error fetching pending JoinUs requests:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const updateJoinUsStatus = async (req, res) => {
    try {
        if (req.user?.permission !== "all") {
            return res.status(403).json({ message: "You do not have permission to update a join us form" });
        }
        const { id } = req.params;
        const { status } = req.body; 

        // Allowed statuses
        const validStatuses = ["pending", "completed", "rejected"];

        // Check if status is valid
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status. Allowed values: pending, confirmed, cancelled" });
        }

        // Find and update the document
        const updatedJoinUs = await JoinUs.findByIdAndUpdate(
            id,
            { status, updatedAt: new Date() }, // Update status and timestamp
            { new: true } // Return updated document
        );

        // If document not found
        if (!updatedJoinUs) {
            return res.status(404).json({ message: "JoinUs request not found" });
        }

        res.status(200).json({
            message: "Status updated successfully",
            data: updatedJoinUs
        });
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


