import express, { Application } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import _env from "./config/envConfig";
// Routes
import clientRoutes from "./modules/client/client.routes";

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
        origin: ["http://localhost:3000", "http://localhost:5473"],
      })
    );
    this.app.use(bodyParser.json());
    this.app.use(cookieParser());
  }

  private setRoutes(): void {
    this.app.use("/api/v1", clientRoutes);
    this.app.get("/", (req, res) => {
      res.json({
        message: "Server is up and running!",
      });
    });
  }
}

export default new App().app;
