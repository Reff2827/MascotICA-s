
const { app, BrowserWindow } = require('electron');
const path = require('path');

function crearVentana() {
    const ventana = new BrowserWindow({
        width: 1440,
        height: 920,
        minWidth: 960,
        minHeight: 650,
        title: "MascotICA's | Administración",
        autoHideMenuBar: true,
        backgroundColor: '#F5F7FB',
        show: false,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true
        }
    });

    // Endurecimiento: la ventana solo muestra archivos locales de la app.
    ventana.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    ventana.webContents.on('will-navigate', (evento, destino) => {
        if (!destino.startsWith('file://')) {
            evento.preventDefault();
        }
    });

    ventana.loadFile(
        path.join(__dirname, 'admin-desktop', 'login.html')
    );

    ventana.once('ready-to-show', () => {
        ventana.show();
    });
}

app.whenReady().then(() => {
    crearVentana();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            crearVentana();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
