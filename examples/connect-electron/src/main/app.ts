import http from "node:http";
import type { BrowserWindow } from "electron";
import express from "express";

export default class RedirectApp {
  public app = express();

  public server = http.createServer(this.app);

  private port = 5180;

  private limit = "5mb"; // File size limit for API requests

  constructor(mainWindow: BrowserWindow) {
    this.app.disable("x-powered-by");

    this.app.use(express.json({ limit: this.limit }));
    this.app.use(
      express.urlencoded({
        limit: this.limit,
        extended: true,
        parameterLimit: 50000,
      }),
    );

    // CORS (Cross Origin Request) configuration allows browsers to call the API endpoints
    this.app.use((_req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept",
      );
      next();
    });

    this.app.post("/auth", (req, res) => {
      const { searchParams }: { searchParams: string } = req.body;

      mainWindow.webContents.send("auth_event", { searchParams });

      mainWindow.show();

      res.sendStatus(200);
    });

    this.server.listen(this.port, "localhost", () => {
      console.log(`Starting server on port ${this.port}`);
    });
  }
}

let redirectApp: RedirectApp;
export function startRedirectApp(mainWindow: BrowserWindow) {
  if (!redirectApp) {
    redirectApp = new RedirectApp(mainWindow);
  }
}
