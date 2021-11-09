'use strict';

const { app, BrowserWindow, dialog } = require('electron');
const { pack } = require('python-struct');
const { Socket } = require('net');
const express = require('express');
const path = require('path');
const { ipcMain } = require('electron')

// Disable errors
dialog.showErrorBox = () => {};

const server = express();
let serverPort;

const listener = server.listen(0, () => {

  serverPort = listener.address().port;
});

app.whenReady().then(() => {

  const win = new BrowserWindow({
    width: 400,
    height: 250,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
  });

  win.loadFile('index.html');

  ipcMain.on('upload', (event, { ip, file }) => {

    if (!ip || !file) {

      return win.webContents.send('error');
    }

    const fileName = encodeURIComponent(file.split(/\/|\\/).pop());

    // Workaround for file route throwing 404 for both escaped and non-escaped paths
    server.get(`*`, (req, res) => {

      res.sendFile(file, (err) => {

        if (err) {

          return win.webContents.send('error');
        }

        win.webContents.send('done');
      });
    });

    const client = new Socket();

    client.connect(5000, ip, () => {

      const payload = `${client.localAddress}:${serverPort}/${fileName}\n`;
      const payloadBytes = new Buffer(payload, 'ascii');
      const networkPayload = pack('!L', payloadBytes.length) + payloadBytes;

      client.write(networkPayload);
    });
  });
});

app.on('window-all-closed', () => {

  app.quit();
});


