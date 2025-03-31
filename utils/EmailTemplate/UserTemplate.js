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
                    &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
                </p>
            </div>
        </div>
    `;
};
