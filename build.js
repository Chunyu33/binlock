/*
 * © 2025 Evan. All rights reserved.
 *
 * This software is licensed under the MIT License.
 * See the LICENSE file for more details.
 */
require('dotenv').config(); // 加载 .env 文件
const { build } = require('electron-builder');

build({
  config: {
    appId: process.env.GH_APP_ID,
    publish: [
      {
        provider: "github",
        owner: "Chunyu33",
        repo: "binlock",
        token: process.env.GH_TOKEN,  // 从环境变量读取
      }
    ]
  }
}).catch(err => console.error(err));
