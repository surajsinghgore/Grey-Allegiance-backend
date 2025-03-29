import { body } from "express-validator";

export const createServiceValidation = [
    body("title")
        .isString()
        .isLength({ min: 3 })
        .withMessage("Title must be at least 3 characters long"),

    body("description")
        .isString()
        .isLength({ min: 10 })
        .withMessage("Description must be at least 10 characters long"),

    body("slotDuration")
        .isInt({ min: 1 })
        .withMessage("Slot duration must be a number greater than 0"),

    body("status")
        .isIn(["active", "inactive"])
        .withMessage("Invalid status, please enter 'active' or 'inactive'"),

    // Validate 'days' as an array
    body("days").custom((value, { req }) => {
        try {
            const parsedDays = JSON.parse(value);
            if (!Array.isArray(parsedDays) || parsedDays.length === 0) {
                throw new Error("Days must be a non-empty array");
            }
            req.body.days = parsedDays; // Parse and replace req.body.days
            return true;
        } catch (error) {
            throw new Error("Invalid days format. Must be a JSON array.");
        }
    }),

    body("days.*.name")
        .isString()
        .isLength({ min: 3 })
        .withMessage("Day name must be a string and at least 3 characters long"),

    body("days.*.openingTiming")
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage("Invalid opening time format. Use HH:mm (24-hour format)"),

    body("days.*.closeTiming")
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage("Invalid closing time format. Use HH:mm (24-hour format)"),

    body("days.*.status")
        .isIn(["active", "inactive"])
        .withMessage("Day status must be 'active' or 'inactive'"),
];
