import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import {
  notFoundHandler,
  errorHandler
} from "./middleware/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;