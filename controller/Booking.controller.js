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

        // ✅ Check if the service is active
        if (service.status !== "active") {
            return res.status(400).json({ message: "Service is not available for booking" });
        }

        // Convert bookingDate to a standard format
        const bookingDateObj = new Date(bookingDate);
        if (isNaN(bookingDateObj.getTime())) {
            return res.status(400).json({ message: "Invalid booking date format." });
        }
        const formattedBookingDate = bookingDateObj.toISOString().split("T")[0];

        // ✅ Get the day name from the bookingDate
        const dayName = bookingDateObj.toLocaleDateString("en-US", { weekday: "long" });

        // ✅ Check if the selected day is available & active
        const selectedDay = service.days.find(day => day.name === dayName);
        if (!selectedDay || selectedDay.status !== "active") {
            return res.status(400).json({ message: `Service is not available on ${dayName}` });
        }

        // Validate slot duration
        if (!bookedDuration || bookedDuration <= 0 || bookedDuration % service.slotDuration !== 0) {
            return res.status(400).json({ message: "Invalid booked duration. Must be a multiple of slot duration." });
        }

        // Calculate total price
        let totalPrice = 0;
        if (service.price) {
            totalPrice = (bookedDuration / service.slotDuration) * service.price;
        }

        // Validate booking time format (HH:mm)
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(bookingTime)) {
            return res.status(400).json({ message: "Invalid booking time format. Use HH:mm format." });
        }

        // Convert bookingTime to minutes for comparison
        const [startHour, startMinute] = bookingTime.split(":").map(Number);
        const newBookingStart = startHour * 60 + startMinute;
        const newBookingEnd = newBookingStart + bookedDuration;

        // ✅ Check if the selected time is within allowed hours
        const [openHour, openMinute] = selectedDay.openingTiming.split(":").map(Number);
        const [closeHour, closeMinute] = selectedDay.closeTiming.split(":").map(Number);
        const openTime = openHour * 60 + openMinute;
        const closeTime = closeHour * 60 + closeMinute;

        if (newBookingStart < openTime || newBookingEnd > closeTime) {
            return res.status(400).json({ message: `Booking time must be within ${selectedDay.openingTiming} - ${selectedDay.closeTiming}` });
        }

        // ✅ Check for overlapping bookings
        const existingBookings = await Booking.find({ serviceId, bookingDate: formattedBookingDate });

        for (const booking of existingBookings) {
            if (booking.status === "cancelled") continue;

            const [existingHour, existingMinute] = booking.bookingTime.split(":").map(Number);
            const existingStart = existingHour * 60 + existingMinute;
            const existingEnd = existingStart + booking.bookedDuration;

            if (newBookingStart < existingEnd && newBookingEnd > existingStart) {
                return res.status(400).json({ 
                    message: `Time slot overlaps with an existing booking from ${booking.bookingTime} for ${booking.bookedDuration} minutes`
                });
            }
        }

        // ✅ Create new booking
        const newBooking = new Booking({
            serviceId,
            bookingDate: formattedBookingDate,
            bookingTime,
            bookedDuration,
            totalPrice,
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

        // ✅ Check if the service is active
        if (service.status !== "active") {
            return res.status(400).json({ message: "Service is not available for booking" });
        }

        // Convert date to standard format
        const bookingDateObj = new Date(date);
        if (isNaN(bookingDateObj.getTime())) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        // ✅ Get the day name from the provided date (e.g., "Monday")
        const dayName = bookingDateObj.toLocaleDateString("en-US", { weekday: "long" });

        // ✅ Check if the selected day is available & active
        const serviceDay = service.days.find(day => day.name === dayName);
        if (!serviceDay || serviceDay.status !== "active") {
            return res.status(400).json({ message: `Service is not available on ${dayName}` });
        }

        // Extract opening and closing times
        const [openHour, openMin] = serviceDay.openingTiming.split(":").map(Number);
        const [closeHour, closeMin] = serviceDay.closeTiming.split(":").map(Number);

        // Extract slot duration from service
        const slotDuration = service.slotDuration;
        if (!slotDuration || slotDuration <= 0) {
            return res.status(400).json({ message: "Invalid slot duration for this service" });
        }

        // ✅ Generate all possible time slots
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

        // ✅ Get all booked slots for the given service and date (excluding cancelled bookings)
        const bookedSlots = await Booking.find({ serviceId, bookingDate: date, status: { $ne: "cancelled" } });

        // ✅ Remove booked slots considering each booked duration
        bookedSlots.forEach(booking => {
            const [bookedHour, bookedMin] = booking.bookingTime.split(":").map(Number);
            const bookedStartTime = bookedHour * 60 + bookedMin;
            const bookedEndTime = bookedStartTime + booking.bookedDuration;

            availableSlots = availableSlots.filter(slot => {
                const [slotHour, slotMin] = slot.split(":").map(Number);
                const slotTime = slotHour * 60 + slotMin;
                return slotTime < bookedStartTime || slotTime >= bookedEndTime;
            });
        });

        // ✅ Return available slots along with the selected date
        res.status(200).json({ 
            message: "Available slots retrieved", 
            selectedDate: date, 
            availableSlots 
        });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



export const getAllBookings = async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;

        // Build the filter object dynamically
        let filter = {};
        if (status) filter.status = status;
        if (startDate && endDate) {
            filter.bookingDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        // Fetch bookings directly (no need to populate clientId since data is already in booking)
        const bookings = await Booking.find(filter)
            .populate('serviceId', 'title') // Fetch only the 'title' of the service
            .select('_id serviceId bookingDate bookingTime bookedDuration name email mobile address city pincode totalPrice country status createdAt updatedAt') // Select required fields
            .sort({ bookingDate: -1 });

        if (bookings.length === 0) {
            return res.status(404).json({ message: "No bookings found" });
        }

        // Transform the data
        const formattedBookings = bookings.map(booking => ({
            _id: booking._id,
            serviceTitle: booking.serviceId?.title || "N/A",
            bookingDate: booking.bookingDate,
            bookingTime: booking.bookingTime,
            bookedDuration: booking.bookedDuration,
            name: booking.name,
            email: booking.email,
            mobile: booking.mobile,
            address: booking.address,
            city: booking.city,
            pincode: booking.pincode,
            totalPrice: booking.totalPrice,
            country: booking.country,
            status: booking.status,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt
        }));

        res.status(200).json({
            message: "Bookings retrieved successfully",
            bookings: formattedBookings
        });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



export const getBookingById = async (req, res) => {
    try {
        const { bookingId } = req.params;

        // Find the booking by ID and populate related fields
        const booking = await Booking.findById(bookingId)
            .populate('serviceId') // Fetch full service details
            .populate('clientId') // Fetch full client details
            .populate('providerId') // Fetch provider details if applicable
            .populate('assignedStaff') // If staff is assigned, fetch details
            .exec();

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json({
            message: "Booking retrieved successfully",
            booking // Returning the full booking object
        });
    } catch (error) {
        console.error("Error fetching booking:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
