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

    body("imageUrl")
        .optional()
        .isURL()
        .withMessage("Invalid image URL"),

    body("status")
        .isIn(["active", "inactive"])
        .withMessage("Invalid status, please enter 'active' or 'inactive'"),

    body("day").isArray().withMessage("Day must be an array"),

    body("day.*.name")
        .isString()
        .isLength({ min: 3 })
        .withMessage("Day name must be a string and at least 3 characters long"),

    body("day.*.openingTiming")
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage("Invalid opening time format. Use HH:mm (24-hour format)"),

    body("day.*.closeTiming")
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage("Invalid closing time format. Use HH:mm (24-hour format)"),

    body("day.*.status")
        .isIn(["active", "inactive"])
        .withMessage("Day status must be 'active' or 'inactive'"),
];
