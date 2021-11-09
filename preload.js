const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {

  document.getElementById('submit').addEventListener('click', () => {

    const ip = document.getElementById('ip').value;
    const file = document.getElementById('file').files[0].path;

    ipcRenderer.send('upload', {
      ip,
      file
    });

    document.title = 'CIA Transfer: Sending...'
  });

  ipcRenderer.on('done', () => {

    document.title = 'CIA Transfer: Done';
  })

  ipcRenderer.on('error', () => {

    document.title = 'CIA Transfer: Error';
  });
})
