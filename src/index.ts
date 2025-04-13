import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
//import { config } from "./config/app.config";
//import connectDatabase from "./database/database";
//import { config } from "././config/app.config";
import { config } from "@/config/app.config";
import connectDatabase from "./database/database";

//const Port = 8000;

const app = express();
const BASE_PATH = config.BASE_PATH;

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: config.APP_ORIGIN,
    credentials: true,
  })
);

app.use(cookieParser());
// app.use()

//routes
app.get("/", (req, res) => {
  res.json({
    message: "Welcome tunde",
  });
});

app.listen(config.PORT, async () => {
  console.log(`server running on port ${config.PORT}`);
  await connectDatabase();
});
