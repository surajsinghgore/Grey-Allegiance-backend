import Service from "../models/Services.model.js";

// create service
export const createService = async (req, res) => {
    try {
        if (req.user?.permission !== "all") {
            return res.status(403).json({ message: "You do not have permission to create a service" });
        }

        const { title, description, slotDuration, imageUrl, status, days, price } = req.body;


        if (!days || !Array.isArray(days) || days.length === 0) {
            return res.status(400).json({ message: "Days array cannot be empty" });
        }

        const existingService = await Service.findOne({ title });

        if (existingService) {
            return res.status(400).json({ message: "Service with this title already exists" });
        }

        if (price !== undefined && (typeof price !== "number" || price < 0)) {
            return res.status(400).json({ message: "Invalid price, must be a non-negative number" });
        }

        const newService = new Service({ title, description, slotDuration, imageUrl, status, days, price });

        await newService.save();

        res.status(201).json({ message: "Service created successfully", service: newService });
    } catch (error) {
        console.error("Error:", error.message);
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
