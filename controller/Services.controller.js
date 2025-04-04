import Service from "../models/Services.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadServiceImageToCloudinary } from "../utils/cloudinarySetup..js";
import { getPublicIdFromUrl } from "../utils/Halper.js";
import { v2 as cloudinary } from "cloudinary";

export const createService = async (req, res) => {
    try {
        if (req.user?.permission !== "all") {
            return res.status(403).json({ message: "You do not have permission to create a service" });
        }

        const { title, description, slotDuration, status } = req.body;

        if (!req.file || !title || !description) {
            return res.status(400).json({ message: "Image, title, and description are required" });
        }

        // ✅ Parse 'days' if provided
        let days;
        try {
            days = JSON.parse(req.body.days);
        } catch (error) {
            return res.status(400).json({ message: "Invalid days format. Must be a JSON array." });
        }

        if (!Array.isArray(days) || days.length === 0) {
            return res.status(400).json({ message: "Days array cannot be empty" });
        }

        // Check if service with the same title already exists
        const existingService = await Service.findOne({ title });

        if (existingService) {
            return res.status(400).json({ message: "Service with this title already exists" });
        }

        

        // ✅ Upload Image to Cloudinary using buffer
        const uploadResult = await uploadServiceImageToCloudinary(req.file);

        if (uploadResult.statusCode !== 200) {
            return res.status(500).json({ message: "Error uploading image", error: uploadResult.error });
        }

        // ✅ Create new service
        const newService = new Service({
            title,
            description,
            slotDuration,
            imageUrl: uploadResult.data.secure_url,
            status,
            days
        });

        await newService.save();

        res.status(201).json({ message: "Service created successfully", service: newService });
    } catch (error) {
        console.error("Error creating service:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};




export const updateServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const updateFields = req.body;
        if (req.user?.permission !== "all") {
            return res.status(403).json({ message: "You do not have permission to delete a service" });
        }
        // Prevent updating _id directly
        if (updateFields._id) {
            return res.status(400).json({ message: "Updating _id is not allowed" });
        }

        // Check if the new name already exists (ignoring the current service)
        if (updateFields.title) {
            const existingService = await Service.findOne({
                title: updateFields.title,
                _id: { $ne: id } // Ignore the current service
            });

            if (existingService) {
                return res.status(400).json({ message: "A service with this name already exists" });
            }
        }

        // Validate days array if provided
        if (updateFields.days && !Array.isArray(updateFields.days)) {
            return res.status(400).json({ message: "Days must be an array" });
        }

        // Perform the update
        const updatedService = await Service.findByIdAndUpdate(
            id,
            { $set: updateFields },  // Allows updating any field
            { new: true, runValidators: true }
        );

        if (!updatedService) {
            return res.status(404).json({ message: "Service not found" });
        }

        res.status(200).json({ message: "Service updated successfully" });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



export const deleteServiceById = async (req, res) => {
    try {
        if (req.user?.permission !== "all") {
            return res.status(403).json({ message: "You do not have permission to delete a service" });
        }

        const { id } = req.params;

        const deletedService = await Service.findByIdAndDelete(id);

        if (!deletedService) {
            return res.status(404).json({ message: "Service not found" });
        }

        res.status(200).json({ message: "Service deleted successfully" });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const getAllServices = async (req, res) => {
    try {
        const services = await Service.find({}, "imageUrl title description slotDuration price");

        if (!services || services.length === 0) {
            return res.status(404).json({ message: "No services found" });
        }

        // Renaming slotDuration to slotsAvailable and including _id in the response
        const formattedServices = services.map(service => ({
            _id: service._id, // Include _id
            imageUrl: service.imageUrl,
            title: service.title,
            description: service.description,
            slotsAvailable: service.slotDuration, // Renamed field
            price: service.price
        }));

        res.status(200).json({ message: "Services retrieved successfully", services: formattedServices });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getAllServicesClient = async (req, res) => {
    try {
        // ✅ Fetch only active services
        const services = await Service.find(
            { status: "active" }, // Filter: Only active services
            "imageUrl title description slotDuration price status"
        );

        if (!services || services.length === 0) {
            return res.status(404).json({ message: "No active services found" });
        }

        // ✅ Format response (renaming slotDuration to slotsAvailable)
        const formattedServices = services.map(service => ({
            _id: service._id, // Include _id
            imageUrl: service.imageUrl,
            title: service.title,
            description: service.description,
            slotsAvailable: service.slotDuration, // Renamed field
            price: service.price
        }));

        res.status(200).json({ message: "Active services retrieved successfully", services: formattedServices });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;

        const service = await Service.findById(id);

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        res.status(200).json({ message: "Service retrieved successfully", service });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



export const uploadServiceImageApi = asyncHandler(async (req, res) => {
    try {
        if (req.user?.permission !== "all") {
            return res.status(403).json({ message: "You do not have permission to create a service" });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a service image.",
            });
        }

        const { serviceId } = req.query;

        if (!serviceId) {
            return res.status(400).json({
                success: false,
                message: "Service ID is required to update the image.",
            });
        }

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found.",
            });
        }

        if (service.imageUrl) {
            const publicId = getPublicIdFromUrl(service.imageUrl);
            await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
        }

        const uploadResponse = await uploadServiceImageToCloudinary(req.file);

        if (uploadResponse.statusCode !== 200) {
            return res.status(uploadResponse.statusCode).json({
                success: false,
                message: uploadResponse.message,
                error: uploadResponse.error,
            });
        }

        service.imageUrl = uploadResponse.data.secure_url;
        await service.save();

        return res.status(200).json({
            success: true,
            message: "Service image updated successfully.",
            imageUrl: uploadResponse.data.secure_url,
        });
    } catch (error) {
        console.error("Error uploading service image: ", error);

        return res.status(500).json({
            success: false,
            message: "Error in uploading service image.",
            error: error.message,
        });
    }
});
