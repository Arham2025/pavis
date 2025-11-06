const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
const connectToDB = require("./db/db");

const userRoute = require("./routes/user.routes");
const productRoute = require("./routes/product.routes");
const adminRoute = require("./routes/admin.routes");

connectToDB();

const allowedOrigins = [
    process.env.CLIENT_PORT1,
    process.env.CLIENT_PORT2,
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use("/admin", adminRoute);
app.use("/product", productRoute);
app.use("/users", userRoute);

module.exports = app;

// app.listen(3000, ()=> {
//     console.log("Server is running");
// });