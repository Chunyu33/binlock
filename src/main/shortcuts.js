const { globalShortcut } = require('electron');
const coreWin = require('./window');


function registerShortcuts() {
  globalShortcut.register('Ctrl+Q', () => coreWin.quit());

}

function unregisterShortcuts() {
  globalShortcut.unregisterAll();
}

module.exports = { registerShortcuts, unregisterShortcuts };
