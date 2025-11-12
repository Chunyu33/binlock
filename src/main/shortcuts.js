/*
 * © 2025 Evan. All rights reserved.
 *
 * This software is licensed under the MIT License.
 * See the LICENSE file for more details.
 */
const { globalShortcut } = require('electron');
const coreWin = require('./window');


function registerShortcuts() {
  globalShortcut.register('Ctrl+Q', () => coreWin.quit());

}

function unregisterShortcuts() {
  globalShortcut.unregisterAll();
}

module.exports = { registerShortcuts, unregisterShortcuts };
