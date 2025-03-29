import Service from "../models/Services.model.js";
import { uploadServiceImageToCloudinary } from "../utils/cloudinarySetup..js";

export const createService = async (req, res) => {
    try {
        if (req.user?.permission !== "all") {
            return res.status(403).json({ message: "You do not have permission to create a service" });
        }

        const { title, description, slotDuration, status } = req.body;
        let price = Number(req.body.price);

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

        // Validate price
        if (isNaN(price) || price < 0) {
            return res.status(400).json({ message: "Invalid price, must be a non-negative number" });
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
            days,
            price
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
        if (req.user?.permission !== "all") {
            return res.status(403).json({ message: "You do not have permission to update a service" });
        }

        const { id } = req.params;
        const updateFields = req.body;

        // Validate that at least one field is provided for update
        if (!updateFields || Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: "At least one field must be provided for update" });
        }

        // Prevent updating _id directly
        if (updateFields._id) {
            return res.status(400).json({ message: "Updating _id is not allowed" });
        }

        // Validate price if provided
        if (updateFields.price !== undefined && (typeof updateFields.price !== "number" || updateFields.price < 0)) {
            return res.status(400).json({ message: "Invalid price, must be a non-negative number" });
        }

        // Validate days array if provided
        if (updateFields.days && (!Array.isArray(updateFields.days) || updateFields.days.length === 0)) {
            return res.status(400).json({ message: "Days array cannot be empty" });
        }

        const updatedService = await Service.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });

        if (!updatedService) {
            return res.status(404).json({ message: "Service not found" });
        }

        res.status(200).json({ message: "Service updated successfully", service: updatedService });
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

        // Renaming slotDuration to slotsAvailable in the response
        const formattedServices = services.map(service => ({
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

