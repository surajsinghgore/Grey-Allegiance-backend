import Booking from "../models/Booking.model.js";
import Service from "../models/Services.model.js";

export const createBooking = async (req, res) => {
    try {
        const { 
            serviceId, 
            bookingDate, 
            bookingTime, 
            bookedDuration, 
            name, 
            email, 
            mobile, 
            address, 
            city, 
            pincode, 
            country 
        } = req.body;

        // Check if the service exists
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        // Validate slot duration
        if (!bookedDuration || bookedDuration <= 0 || bookedDuration % service.slotDuration !== 0) {
            return res.status(400).json({ message: "Invalid booked duration. Must be a multiple of slot duration." });
        }

        // Calculate total price if service has a price per slot
        let totalPrice = 0;
        if (service.price) {
            totalPrice = (bookedDuration / service.slotDuration) * service.price;
        }

        // Validate booking time format (HH:mm)
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(bookingTime)) {
            return res.status(400).json({ message: "Invalid booking time format. Use HH:mm format." });
        }

        // Convert bookingDate to standard format (YYYY-MM-DD)
        const bookingDateObj = new Date(bookingDate);
        if (isNaN(bookingDateObj.getTime())) {
            return res.status(400).json({ message: "Invalid booking date format." });
        }
        const formattedBookingDate = bookingDateObj.toISOString().split("T")[0];

        // Convert bookingTime to minutes for easy comparison
        const [startHour, startMinute] = bookingTime.split(":").map(Number);
        const newBookingStart = startHour * 60 + startMinute;
        const newBookingEnd = newBookingStart + bookedDuration;

        // Check if any existing booking overlaps with the new booking time
        const existingBookings = await Booking.find({ serviceId, bookingDate: formattedBookingDate });

        for (const booking of existingBookings) {
            // Skip cancelled bookings (allow rebooking)
            if (booking.status === "cancelled") {
                continue;
            }

            const [existingHour, existingMinute] = booking.bookingTime.split(":").map(Number);
            const existingStart = existingHour * 60 + existingMinute;
            const existingEnd = existingStart + booking.bookedDuration; // Use stored booked duration

            // Overlap condition
            if (newBookingStart < existingEnd && newBookingEnd > existingStart) {
                return res.status(400).json({ 
                    message: `Time slot overlaps with an existing booking from ${booking.bookingTime} for ${booking.bookedDuration} minutes`
                });
            }
        }

        // Create new booking
        const newBooking = new Booking({
            serviceId,
            bookingDate: formattedBookingDate,
            bookingTime,
            bookedDuration,
            totalPrice, // Save calculated price
            name,
            email,
            mobile,
            address,
            city,
            pincode,
            country,
        });

        await newBooking.save();

        res.status(201).json({ message: "Booking created successfully", booking: newBooking });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};




export const updateBookingStatus = async (req, res) => {
    try {
        if (req.user.permission !== "all") {
            return res.status(403).json({ status: false, message: "Forbidden: You do not have permission to update admin roles" });
          }
        const { bookingId } = req.params; 
        const { status } = req.body; 

        // Allowed status values
        const allowedStatuses = ["pending", "confirmed", "cancelled"];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        // Find and update the booking
        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            { status },
            { new: true } // Return the updated document
        );

        if (!updatedBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json({ message: "Booking status updated successfully", booking: updatedBooking });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const getAvailableSlots = async (req, res) => {
    try {
        const { serviceId, date } = req.query;

        if (!serviceId || !date) {
            return res.status(400).json({ message: "Service ID and date are required" });
        }

        // Check if the service exists
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        // Get the day name from the provided date (e.g., "Monday")
        const dayName = new Date(date).toLocaleDateString("en-US", { weekday: "long" });

        // Find service availability for that specific day
        const serviceDay = service.days.find(day => day.name === dayName);
        if (!serviceDay || serviceDay.status === "inactive") {
            return res.status(400).json({ message: "Service is not available on this day" });
        }

        // Extract opening and closing times
        const [openHour, openMin] = serviceDay.openingTiming.split(":").map(Number);
        const [closeHour, closeMin] = serviceDay.closeTiming.split(":").map(Number);

        // Extract slot duration from service
        const slotDuration = service.slotDuration;
        if (!slotDuration || slotDuration <= 0) {
            return res.status(400).json({ message: "Invalid slot duration for this service" });
        }

        // Generate all possible time slots
        let availableSlots = [];
        let currentHour = openHour;
        let currentMin = openMin;

        while (currentHour < closeHour || (currentHour === closeHour && currentMin < closeMin)) {
            availableSlots.push(`${String(currentHour).padStart(2, "0")}:${String(currentMin).padStart(2, "0")}`);
            currentMin += slotDuration;
            if (currentMin >= 60) {
                currentHour += 1;
                currentMin -= 60;
            }
        }

        // Get all booked slots for the given service and date (excluding cancelled bookings)
        const bookedSlots = await Booking.find({ serviceId, bookingDate: date, status: { $ne: "cancelled" } });

        // Remove booked slots considering each booked duration
        bookedSlots.forEach(booking => {
            const [bookedHour, bookedMin] = booking.bookingTime.split(":").map(Number);
            const bookedStartTime = bookedHour * 60 + bookedMin; // Convert to minutes
            const bookedEndTime = bookedStartTime + booking.bookedDuration; // Use booked duration dynamically

            availableSlots = availableSlots.filter(slot => {
                const [slotHour, slotMin] = slot.split(":").map(Number);
                const slotTime = slotHour * 60 + slotMin; // Convert to minutes
                return slotTime < bookedStartTime || slotTime >= bookedEndTime;
            });
        });

        res.status(200).json({ message: "Available slots retrieved", availableSlots });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

