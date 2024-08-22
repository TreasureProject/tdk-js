export function initIpcListeners() {
  window.electron.ipcRenderer.on('auth-event', (__event, { searchParams }) => {
    console.log(searchParams);
  });
}
