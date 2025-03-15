import express from "express";

import { createRequestQuote, getAllRequestQuotes, getPendingRequestQuotes, updateRequestQuoteStatus } from "../controller/requestQuote.controller.js";
import { AdminVerifyMiddleware } from "../middlewares/AdminVerify.middleware.js";
import { validateRequestQuote } from "../validators/requestQuote.validator.js";


const router = express.Router();

router.post("/create", validateRequestQuote,createRequestQuote);
router.patch("/update-quote-status/:id", AdminVerifyMiddleware,updateRequestQuoteStatus);
router.get("/pending", getPendingRequestQuotes);
router.get("/all", getAllRequestQuotes);

export default router;
