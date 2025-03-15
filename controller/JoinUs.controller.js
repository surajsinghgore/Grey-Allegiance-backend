import JoinUs from "../models/JoinUs.model.js";

// Create a new JoinUs entry
export const createJoinUs = async (req, res) => {
    try {
        const { name, email, mobile, aboutYou, whyJoinUs, resume } = req.body;

        // Validate required fields
        if (!name || !email || !mobile || !aboutYou || !whyJoinUs || !resume) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if the user has already applied with the same email, mobile, and status "pending"
        const existingApplication = await JoinUs.findOne({ email, mobile, status: "pending" });

        if (existingApplication) {
            return res.status(400).json({ message: "You have already applied. Your application is under review." });
        }

        // Create a new entry in the database
        const newJoinUs = new JoinUs({
            name,
            email,
            mobile,
            aboutYou,
            whyJoinUs,
            resume, // Resume file URL
            appliedDate: new Date().toISOString().split("T")[0], // YYYY-MM-DD
            appliedTime: new Date().toTimeString().split(" ")[0], // HH:MM:SS
        });

        await newJoinUs.save();

        res.status(201).json({ message: "Application submitted successfully", data: newJoinUs });
    } catch (error) {
        console.error("Error submitting application:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const getAllJoinUsRequests = async (req, res) => {
    try {
        const { status } = req.query;

       
        const filter = status ? { status } : { status: "pending" };

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
        const validStatuses = ["pending", "confirmed", "cancelled"];

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


