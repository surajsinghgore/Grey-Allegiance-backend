import RequestQuote from "../models/RequestQuote.model.js";

export const createRequestQuote = async (req, res) => {
    try {
        const { firstName, lastName, mobile, email, location, reasonOfInquiry, message } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !mobile || !email || !location || !reasonOfInquiry || !message) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check for existing pending request with the same email & mobile
        const existingRequest = await RequestQuote.findOne({ email, mobile, status: "pending" });
        if (existingRequest) {
            return res.status(400).json({ message: "You already have a pending request." });
        }

        // Create a new request quote
        const newRequest = new RequestQuote({
            firstName,
            lastName,
            mobile,
            email,
            location,
            reasonOfInquiry,
            message,
            status: "pending" // Default status
        });

        await newRequest.save();

        res.status(201).json({ message: "Request submitted successfully", data: newRequest });
    } catch (error) {
        console.error("Error submitting request:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



export const updateRequestQuoteStatus = async (req, res) => {
    try {
        if (req.user?.permission !== "all") {
            return res.status(403).json({ message: "You do not have permission to update request quote" });
        }
        const { id } = req.params;
        const { status } = req.body;

        // Validate allowed status values
        const allowedStatuses = ["pending", "completed", "cancelled"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status. Allowed values: pending, completed, cancelled" });
        }

        // Find and update the request
        const updatedRequest = await RequestQuote.findByIdAndUpdate(
            id,
            { status },
            { new: true } // Return the updated document
        );

        if (!updatedRequest) {
            return res.status(404).json({ message: "Request not found" });
        }

        res.status(200).json({ message: "Request status updated successfully", data: updatedRequest });
    } catch (error) {
        console.error("Error updating request status:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getPendingRequestQuotes = async (req, res) => {
    try {
        // Fetch only pending requests, sorted by oldest first (createdAt ascending)
        const pendingRequests = await RequestQuote.find({ status: "pending" }).sort({ createdAt: 1 });

        res.status(200).json({
            message: "Pending request quotes retrieved successfully",
            data: pendingRequests
        });
    } catch (error) {
        console.error("Error fetching pending request quotes:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getAllRequestQuotes = async (req, res) => {
    try {
        const { status } = req.query; // Get status from query parameter

        let filter = {};
        if (status) {
            filter.status = status; // Apply status filter only if provided
        }

        // Fetch request quotes based on filter, sorted by createdAt (oldest first)
        const requestQuotes = await RequestQuote.find(filter).sort({ createdAt: 1 });

        res.status(200).json({
            message: "Request quotes retrieved successfully",
            data: requestQuotes
        });
    } catch (error) {
        console.error("Error fetching request quotes:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
