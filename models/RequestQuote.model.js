import mongoose from "mongoose";

const requestQuoteSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        mobile: { type: String, required: true },
        email: { type: String, required: true },
        location: { type: String, required: true },
        reasonOfInquiry: { type: String, required: true },
        message: { type: String, required: true },
        status: { 
            type: String, 
            enum: ["pending", "completed"], 
            default: "pending" 
        },
        appliedDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
        appliedTime: { type: String, default: () => new Date().toLocaleTimeString("en-US", { hour12: false }) }
    },
    { timestamps: true }
);

const RequestQuote = mongoose.model("RequestQuote", requestQuoteSchema);

export default RequestQuote;
