import mongoose from "mongoose";

const joinUsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    aboutYou: {
      type: String,
      required: true,
      trim: true,
    },
    whyJoinUs: {
      type: String,
      required: true,
      trim: true,
    },
    resume: {
      type: String, 
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "rejected", "completed"],
      default: "pending",
    },
    appliedDate: {
      type: String,
      default: function () {
        return new Date().toISOString().split("T")[0];
      },
    },
    appliedTime: {
      type: String, 
      default: function () {
        return new Date().toISOString().split("T")[1].split(".")[0];
      },
    },
  },
  { timestamps: true }
);

const JoinUs = mongoose.model("JoinUs", joinUsSchema);
export default JoinUs;
