import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const Port = 8000;

const app = express();

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    //  origin: ,
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

app.listen(Port, () => {
  console.log("server running on port 8000");
});
