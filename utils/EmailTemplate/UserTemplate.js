export const generateForgotPasswordEmail = (resetToken) => {
    return `
        <div style="font-family: Arial, sans-serif; background-color: #e0e0e0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px; border-radius: 8px; 
                        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); border: 1px solid #ccc;">
                <h2 style="color: #333; text-align: center;">🔒 Password Reset Request</h2>
                <p style="color: #555; font-size: 16px; text-align: center;">
                    You requested to reset your password. Click the button below to reset it:
                </p>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${process.env.CLIENT_URL}/auth/reset-password/${resetToken}" 
                       style="background-color: #6c757d; color: white; padding: 12px 20px; text-decoration: none; 
                              font-size: 16px; font-weight: bold; border-radius: 5px; display: inline-block;">
                        Reset Your Password
                    </a>
                </div>
                <p style="color: #777; font-size: 14px; text-align: center;">
                    This link will expire in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #bbb; margin: 20px 0;">
                <p style="color: #666; font-size: 12px; text-align: center;">
                    If the button above does not work, copy and paste the following link in your browser: <br>
                    <a href="${process.env.CLIENT_URL}/auth/reset-password/${resetToken}" style="color: #495057;">
                        ${process.env.CLIENT_URL}/auth/reset-password/${resetToken}
                    </a>
                </p>
                <p style="color: #666; font-size: 12px; text-align: center;">
                    &copy; ${new Date().getFullYear()} Grey Allegiance. All rights reserved.
                </p>
            </div>
        </div>
    `;
};


export const generateRequestQuoteAdminEmail = ({ firstName, lastName, mobile, email, location, reasonOfInquiry, message }) => {
    return `
        <div style="font-family: Arial, sans-serif; background-color: #e0e0e0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px; border-radius: 8px;
                        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); border: 1px solid #ccc;">
                <h2 style="color: #333; text-align: center;">📢 New Request for Quote</h2>
                <p style="color: #555; font-size: 16px; text-align: center;">
                    A new request for a quote has been received.
                </p>
                <div style="background: #ffffff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="color: #666; font-size: 14px;"><strong>Customer Details:</strong></p>
                    <p style="color: #333; font-size: 16px;"><strong>Name:</strong> ${firstName} ${lastName}</p>
                    <p style="color: #333; font-size: 16px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #007bff;">${email}</a></p>
                    <p style="color: #333; font-size: 16px;"><strong>Mobile:</strong> <a href="tel:${mobile}" style="color: #007bff;">${mobile}</a></p>
                    <p style="color: #333; font-size: 16px;"><strong>Location:</strong> ${location}</p>
                </div>
                <div style="background: #ffffff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="color: #666; font-size: 14px;"><strong>Inquiry Details:</strong></p>
                    <p style="color: #333; font-size: 16px;"><strong>Reason:</strong> ${reasonOfInquiry}</p>
                    <p style="color: #333; font-size: 16px;"><strong>Message:</strong> "${message}"</p>
                </div>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${process.env.ADMIN_DASHBOARD_URL}/all-request" 
                       style="background-color: #007bff; color: white; padding: 12px 20px; text-decoration: none;
                              font-size: 16px; font-weight: bold; border-radius: 5px; display: inline-block;">
                        View Request in Dashboard
                    </a>
                </div>
                <hr style="border: none; border-top: 1px solid #bbb; margin: 20px 0;">
                <p style="color: #666; font-size: 12px; text-align: center;">
                    Please log in to the admin panel to review and respond to this request.<br>
                    <strong>Thank you!</strong>
                </p>
                <p style="color: #666; font-size: 12px; text-align: center;">
                    &copy; ${new Date().getFullYear()} Grey Allegiance. All rights reserved.
                </p>
            </div>
        </div>
    `;
};


export const generateJoinUsAdminEmail = ({ name, email, mobile, aboutYou, whyJoinUs }) => {
    return `
        <div style="font-family: Arial, sans-serif; background-color: #e0e0e0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); border: 1px solid #ccc;">
                <h2 style="color: #333; text-align: center;">📄 New Join Us Application</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Mobile:</strong> ${mobile}</p>
                <p><strong>About:</strong> ${aboutYou}</p>
                <p><strong>Why Join Us:</strong> ${whyJoinUs}</p>

                <div style="text-align: center; margin: 20px 0;">
                    <a href="${process.env.ADMIN_DASHBOARD_URL}/joinus-pending" 
                       style="background: #007bff; color: white; padding: 10px 15px; text-decoration: none; 
                              border-radius: 5px; font-weight: bold; display: inline-block;">
                        🔍 View Full Record
                    </a>
                </div>

                <hr style="border: none; border-top: 1px solid #bbb; margin: 20px 0;">
                <p style="color: #666; font-size: 12px; text-align: center;">
                    Please review the application and take necessary action.
                </p>
            </div>
        </div>
    `;
};


export const generateAdminBookingNotificationEmail = ({ name, email, mobile, serviceName, bookingDate, bookingTime, bookedDuration }) => {
    // Convert bookingTime (24-hour) to hours and minutes
    let [startHour, startMinute] = bookingTime.split(":").map(Number);

    // Calculate end time in 24-hour format
    let endHour = startHour + Math.floor(bookedDuration / 60);
    let endMinute = startMinute + (bookedDuration % 60);
    
    if (endMinute >= 60) {
        endHour += 1;
        endMinute -= 60;
    }

    // Format time to 12-hour AM/PM format
    const formatTime = (hour, minute) => {
        const ampm = hour >= 12 ? "PM" : "AM";
        const formattedHour = hour % 12 || 12; // Convert 24-hour to 12-hour format
        const formattedMinute = minute.toString().padStart(2, "0"); // Ensure two-digit minutes
        return `${formattedHour}:${formattedMinute} ${ampm}`;
    };

    const bookingDuration = `${formatTime(startHour, startMinute)} - ${formatTime(endHour, endMinute)}`;

    return `
        <div style="font-family: Arial, sans-serif; background-color: #e0e0e0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); border: 1px solid #ccc;">
                <h2 style="color: #333; text-align: center;">📢 New Booking Received</h2>
                <p style="font-size: 16px; color: #555; text-align: center;">
                    A new booking has been made for <strong>${serviceName}</strong>.
                </p>

                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="color: #666; font-size: 14px;"><strong>Booking Details:</strong></p>
                    <p style="color: #333; font-size: 16px;"><strong>Customer Name:</strong> ${name}</p>
                    <p style="color: #333; font-size: 16px;"><strong>Email:</strong> ${email}</p>
                    <p style="color: #333; font-size: 16px;"><strong>Mobile:</strong> ${mobile}</p>
                    <p style="color: #333; font-size: 16px;"><strong>Service:</strong> ${serviceName}</p>
                    <p style="color: #333; font-size: 16px;"><strong>Date:</strong> ${bookingDate}</p>
                    <p style="color: #333; font-size: 16px;"><strong>Duration:</strong> ${bookingDuration}</p>
                </div>

                <div style="text-align: center; margin: 20px 0;">
                    <a href="${process.env.ADMIN_DASHBOARD_URL}/all-booking" 
                        style="display: inline-block; background-color: #28A745; color: #fff; padding: 12px 20px; 
                        text-decoration: none; font-size: 16px; border-radius: 5px; font-weight: bold;">
                        Manage Booking
                    </a>
                </div>

                <p style="color: #777; font-size: 14px; text-align: center;">
                    Please review and confirm the booking as needed.
                </p>

                <hr style="border: none; border-top: 1px solid #bbb; margin: 20px 0;">
                <p style="color: #666; font-size: 12px; text-align: center;">
                    <strong>Grey Allegiance Admin Panel</strong>
                </p>
            </div>
        </div>
    `;
};
