import dotenv from "dotenv";
import cors from "cors";
import express from "express"
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import loginRoutes from "./routes/login.routes.js";
import bookingRoutes from "./routes/booking.routes.js";


dotenv.config({
    path: "./.env",
});
const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/login/", loginRoutes);
app.use("/api/booking/", bookingRoutes);



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


