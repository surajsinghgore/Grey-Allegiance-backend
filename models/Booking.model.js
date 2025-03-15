import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    serviceId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Service", 
      required: true 
    },
    bookingDate: { 
      type: Date, 
      required: true 
    },
    bookingTime: { 
      type: String, 
      required: true 
    }, // Format: HH:mm
    bookedDuration: { 
      type: Number, 
      required: true, 
      min: 1 
    }, // Duration in minutes
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    email: { 
      type: String, 
      required: true, 
      trim: true 
    },
    mobile: { 
      type: String, 
      required: true, 
      trim: true 
    },
    address: { 
      type: String, 
      required: true, 
      trim: true 
    },
    city: { 
      type: String, 
      required: true, 
      trim: true 
    },
    pincode: { 
      type: String, 
      required: true, 
      trim: true 
    },
    totalPrice: { 
        type: Number, 
        default: 0 
      },
    country: { 
      type: String, 
      required: true, 
      trim: true 
    },
    status: { 
      type: String, 
      enum: ["pending", "confirmed", "cancelled"], 
      default: "pending" 
    } 
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
