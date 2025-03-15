import mongoose from "mongoose";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const daySchema = new mongoose.Schema({
  name: { type: String, required: true, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
  openingTiming: { 
    type: String, 
    required: true, 
    validate: {
      validator: (v) => timeRegex.test(v),
      message: (props) => `${props.value} is not a valid time format (HH:mm)`,
    },
  },
  closeTiming: { 
    type: String, 
    required: true,
    validate: {
      validator: (v) => timeRegex.test(v),
      message: (props) => `${props.value} is not a valid time format (HH:mm)`,
    },
  },
  status: { type: String, enum: ["active", "inactive"], default: "inactive" },
});

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    slotDuration: { type: Number, required: true, min: 1 }, 
    imageUrl: { type: String, trim: true }, 
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    days: [daySchema], 
    price: { type: Number, min: 0, default: null }, 
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", serviceSchema);
export default Service;
