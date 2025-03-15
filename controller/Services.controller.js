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

