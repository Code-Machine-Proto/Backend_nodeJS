import bodyParser from "body-parser";
import express from "express";
import { default as connectMongoDBSession } from 'connect-mongodb-session';
import connectDB from "../config/database";
import auth from "./routes/api/auth";
import user from "./routes/api/user";
import profile from "./routes/api/profile";
import config from "config";

import { ConnectionOptions, connect } from "mongoose";
import accumulator from "./routes/api/accumulator";
import course from "./routes/api/course";
import problem from "./routes/api/problem";
import answer from "./routes/api/answer";
import processor from "./routes/api/processor";
import cors from 'cors';

const app = express();

// Connect to MongoDB
connectDB();

// Express configuration
app.set("port", config.get("port"));
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ limit: '150mb', extended: true, parameterLimit: 50000 }));
app.use(cors());
// @route   GET /
// @desc    Test Base API
// @access  Public
app.get("/", (_req, res) => {
  res.send("API Running");
});

app.use("/api/auth", auth);
app.use("/api/answer", answer);
app.use("/api/user", user);
app.use("/api/problem", problem);
app.use("/api/processor", processor);
app.use("/api/course", course);
app.use("/api/profile", profile);
app.use("/api/compile", accumulator);

const port = app.get("port");
const server = app.listen(port, () =>
  console.log(`Server started on port ${port}`)
);

export default server;
