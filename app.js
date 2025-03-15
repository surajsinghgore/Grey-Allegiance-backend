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

// Routes declaration
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/service", serviceRouter);

export { app };