export function initIpcListeners() {
  window.electron.ipcRenderer.on("auth_event", (__event, { searchParams }) => {
    if (searchParams && searchParams.length > 0) {
      window.location.search = searchParams;
    }
  });
}
