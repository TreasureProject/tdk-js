import { join } from "node:path";
import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import { BrowserWindow, app, ipcMain, session, shell } from "electron";
import icon from "../../resources/icon.png?asset";
import { startRedirectApp } from "./app";

let mainWindow: BrowserWindow;

export function getTreasureLauncherAuthToken(): string | undefined {
  let args: string[] | undefined;

  if (typeof process !== "undefined" && Array.isArray(process.argv)) {
    args = process.argv;
  } else if (
    typeof window !== "undefined" &&
    window.process &&
    Array.isArray(window.process.argv)
  ) {
    args = window.process.argv;
  } else {
    return undefined;
  }

  const arg = args.find((arg) => arg.startsWith("--tdk-auth-token="));
  return arg ? arg.split("=")[1] : undefined;
}

export function getTreasureLauncherWalletComponents():
  | { walletId: string; authProvider: string; authCookie: string }
  | undefined {
  let args: string[] | undefined;

  if (typeof process !== "undefined" && Array.isArray(process.argv)) {
    args = process.argv;
  } else if (
    typeof window !== "undefined" &&
    window.process &&
    Array.isArray(window.process.argv)
  ) {
    args = window.process.argv;
  } else {
    return undefined;
  }

  let walletId: string | undefined = args.find((arg) =>
    arg.startsWith("--tdk-wallet-id="),
  );
  if (walletId) {
    walletId = walletId.split("=")[1];
  }

  let authProvider: string | undefined = args.find((arg) =>
    arg.startsWith("--tdk-auth-provider="),
  );
  if (authProvider) {
    authProvider = authProvider.split("=")[1];
  }

  let authCookie: string | undefined = args.find((arg) =>
    arg.startsWith("--tdk-auth-cookie="),
  );
  if (authCookie) {
    authCookie = authCookie.split("=")[1];
  }

  if (!walletId || !authProvider || !authCookie) {
    return undefined;
  }

  return {
    walletId,
    authProvider,
    authCookie,
  };
}

function initThirdwebBundleHeader() {
  session.defaultSession.webRequest.onBeforeSendHeaders(
    {
      urls: ["https://*.thirdweb.com/*"],
    },
    (details, callback) => {
      // TODO: should be updated to actual bundle id once signing is done
      details.requestHeaders["x-bundle-id"] =
        "lol.treasure.tdk-examples-connect-electron";
      callback({ cancel: false, requestHeaders: details.requestHeaders });
    },
  );
}

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.cjs"),
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC test
  ipcMain.on("ping", () => console.log("pong"));

  initThirdwebBundleHeader();

  createWindow();

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  startRedirectApp(mainWindow);
});

ipcMain.on("get-auth-token", (event, _arg) => {
  event.returnValue = getTreasureLauncherAuthToken();
});
ipcMain.on("get-wallet-components", (event, _arg) => {
  event.returnValue = getTreasureLauncherWalletComponents();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
