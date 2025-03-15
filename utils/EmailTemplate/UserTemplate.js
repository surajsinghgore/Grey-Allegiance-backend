export const generateForgotPasswordEmail = (resetToken) => {
    return `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Please click the link below to reset your password:</p>
        <p><a href="${process.env.CLIENT_URL}/reset-password/${resetToken}">Reset Your Password</a></p>
        <p>This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
    `;
};
