import express from "express";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Welcome to the Grey Allegiance Backend Api!");
});

// Routes import
import adminRouter from "./routes/Admin.router.js";
import serviceRouter from "./routes/Services.router.js";
import bookingRouter from "./routes/Booking.router.js";
import joinUsRouter from "./routes/JoinUs.router.js";
import requestQuoteRouter from "./routes/requestQuote.router.js";
import blogRouter from "./routes/Blog.router.js";


// Routes declaration
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/service", serviceRouter);
app.use("/api/v1/booking", bookingRouter);
app.use("/api/v1/joinUs", joinUsRouter);
app.use("/api/v1/requestQuote", requestQuoteRouter);
app.use("/api/v1/blog",blogRouter);

export { app };