import express from "express";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Welcome to the ClinicCare API!");
});

// Routes import
import adminRouter from "./routes/Admin.router.js";

// Routes declaration
app.use("/api/v1/admin", adminRouter);

export { app };