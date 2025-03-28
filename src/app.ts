import express, { Application } from "express";
import cors, { CorsOptions } from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import _env from "./config/envConfig";
// Routes
import clientRoutes from "./modules/client/client.routes";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import morgan from "morgan";

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.setMiddleware();
    this.setRoutes();
  }

  private setMiddleware(): void {
    this.app.use(
      cors({
        origin: ["http://localhost:5173", "http://localhost:4173"],

        credentials: true,
      } as CorsOptions)
    );
    this.app.use(express.json());
    this.app.use(bodyParser.json());
    this.app.use(cookieParser());

    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(morgan("dev"));
  }

  private setRoutes(): void {
    this.app.use("/api/v1", clientRoutes);
    this.app.get("/", (req, res) => {
      res.json({
        message: "Server is up and running!",
      });
    });

    // Error handling middleware
    this.app.use(globalErrorHandler);
  }
}

export default new App().app;
