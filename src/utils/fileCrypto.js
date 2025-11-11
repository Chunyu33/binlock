const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PBKDF2_ITER = 100000; // 密码派生迭代次数
const SALT_LEN = 16; // 随机盐长度
const IV_LEN = 12; // AES-GCM 初始化向量长度
const AUTH_TAG_LEN = 16; // AES-GCM 验证标签长度

/**
 * deriveKey - derive 32 bytes key from password+salt
 * @param {string} password
 * @param {Buffer} salt
 * @returns {Promise<Buffer>}
 */
function deriveKey(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, PBKDF2_ITER, 32, 'sha256', (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
}

/**
 * ensureDir - 确保目录存在
 */
async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

/**
 * createHeader buffer = [salt(16)][iv(12)][ext_len(1)][ext_bytes]
 */
function createHeader(salt, iv, ext) {
  const extBuf = Buffer.from(ext || '');
  const extLen = Buffer.from([extBuf.length]);
  return Buffer.concat([salt, iv, extLen, extBuf]);
}

/**
 * parseHeader - 从加密文件读取 header
 * @param {Buffer} buf 
 * @returns {Object} { salt, iv, ext, headerSize }
 */
function parseHeader(buf) {
  const salt = buf.subarray(0, SALT_LEN);
  const iv = buf.subarray(SALT_LEN, SALT_LEN + IV_LEN);
  const extLen = buf[SALT_LEN + IV_LEN];
  const ext = buf.subarray(SALT_LEN + IV_LEN + 1, SALT_LEN + IV_LEN + 1 + extLen).toString();
  const headerSize = SALT_LEN + IV_LEN + 1 + extLen;
  return { salt, iv, ext, headerSize };
}

/**
 * encryptSingleFile - 流式加密单个文件, 加密失败不生成文件
 * @param {string} inputPath 输入文件
 * @param {string} outputPath 输出文件
 * @param {string} password 密码
 * @param {function} onProgress 百分比回调
 */
async function encryptSingleFile(inputPath, outputPath, password, onProgress = () => {}) {
  const stat = await fs.promises.stat(inputPath);
  const totalSize = stat.size;

  const salt = crypto.randomBytes(SALT_LEN);
  const iv = crypto.randomBytes(IV_LEN);
  const key = await deriveKey(password, salt);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const ext = path.extname(inputPath).replace('.', '');
  const header = createHeader(salt, iv, ext);

  await ensureDir(path.dirname(outputPath));

  const tmpOutputPath = outputPath + '.tmp'; // 临时文件

  return new Promise((resolve, reject) => {
    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(tmpOutputPath);

    output.write(header);

    let processed = 0;
    input.on('data', (chunk) => {
      processed += chunk.length;
      const percent = Math.min(100, Math.round((processed / totalSize) * 100));
      onProgress(percent);
    });

    input
      .on('error', (err) => {
        fs.unlink(tmpOutputPath, () => {});
        reject(err);
      })
      .pipe(cipher)
      .on('error', (err) => {
        fs.unlink(tmpOutputPath, () => {});
        reject(err);
      })
      .pipe(output)
      .on('error', (err) => {
        fs.unlink(tmpOutputPath, () => {});
        reject(err);
      })
      .on('finish', () => {
        try {
          const authTag = cipher.getAuthTag();
          fs.appendFile(tmpOutputPath, authTag, (err) => {
            if (err) {
              fs.unlink(tmpOutputPath, () => {});
              reject(err);
            } else {
              fs.rename(tmpOutputPath, outputPath, (err) => {
                if (err) {
                  fs.unlink(tmpOutputPath, () => {});
                  reject(err);
                } else {
                  onProgress(100);
                  resolve(outputPath);
                }
              });
            }
          });
        } catch (e) {
          fs.unlink(tmpOutputPath, () => {});
          reject(e);
        }
      });
  });
}

/**
 * decryptSingleFile - 流式解密单个文件, 解密失败不生成文件
 * @param {string} inputPath 输入加密文件
 * @param {string} outputDir 输出目录
 * @param {string} password 密码
 * @param {function} onProgress 百分比回调
 */
async function decryptSingleFile(inputPath, outputDir, password, onProgress = () => {}) {
  const stat = await fs.promises.stat(inputPath);
  const totalSize = stat.size;

  const headerProbe = Buffer.alloc(64);
  const fd = await fs.promises.open(inputPath, 'r');
  const { bytesRead } = await fd.read(headerProbe, 0, headerProbe.length, 0);
  const { salt, iv, ext, headerSize } = parseHeader(headerProbe.subarray(0, bytesRead));

  const authTagPos = totalSize - AUTH_TAG_LEN;
  const authTagBuf = Buffer.alloc(AUTH_TAG_LEN);
  await fd.read(authTagBuf, 0, AUTH_TAG_LEN, authTagPos);
  await fd.close();

  const encryptedSize = totalSize - headerSize - AUTH_TAG_LEN;
  const key = await deriveKey(password, salt);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTagBuf);

  let baseName = path.basename(inputPath);
  if (baseName.endsWith('.binlock')) baseName = baseName.slice(0, -8); 
  const outName = baseName.endsWith(`.${ext}`) ? baseName : `${baseName}.${ext || 'bin'}`;
  const outputPath = path.join(outputDir, outName);
  await ensureDir(outputDir);

  const tmpOutputPath = outputPath + '.tmp';

  return new Promise((resolve, reject) => {
    const input = fs.createReadStream(inputPath, { start: headerSize, end: totalSize - AUTH_TAG_LEN - 1 });
    const output = fs.createWriteStream(tmpOutputPath);

    let processed = 0;
    input.on('data', (chunk) => {
      processed += chunk.length;
      const percent = Math.min(100, Math.round((processed / encryptedSize) * 100));
      onProgress(percent);
    });

    input
      .on('error', (err) => {
        fs.unlink(tmpOutputPath, () => {});
        reject(err);
      })
      .pipe(decipher)
      .on('error', () => {
        fs.unlink(tmpOutputPath, () => {});
        reject(new Error('解密失败：密码错误或文件损坏'));
      })
      .pipe(output)
      .on('error', (err) => {
        fs.unlink(tmpOutputPath, () => {});
        reject(err);
      })
      .on('finish', () => {
        fs.rename(tmpOutputPath, outputPath, (err) => {
          if (err) {
            fs.unlink(tmpOutputPath, () => {});
            reject(err);
          } else {
            onProgress(100);
            resolve(outputPath);
          }
        });
      });
  });
}

/**
 * encryptFiles - 批量加密
 */
async function encryptFiles(fileRecords, outputDir, password, sendProgress = () => {}) {
  const results = [];
  for (const rec of fileRecords) {
    const inputPath = rec.path;
    const base = path.basename(inputPath);
    const defaultOutDir = outputDir || path.join(path.dirname(inputPath), 'encrypted');
    const outPath = path.join(defaultOutDir, `${base}.binlock`);

    try {
      sendProgress({ uid: rec.uid, status: 'encrypting', percent: 0 });
      const resPath = await encryptSingleFile(inputPath, outPath, password, (p) => {
        sendProgress({ uid: rec.uid, status: 'encrypting', percent: p });
      });
      sendProgress({ uid: rec.uid, status: 'done', percent: 100, outputPath: resPath });
      results.push({ uid: rec.uid, success: true, outputPath: resPath });
    } catch (err) {
      sendProgress({ uid: rec.uid, status: 'error', percent: 100, error: String(err) });
      results.push({ uid: rec.uid, success: false, error: String(err) });
    }
  }
  return results;
}

/**
 * decryptFiles - 批量解密
 */
async function decryptFiles(fileRecords, outputDir, password, sendProgress = () => {}) {
  const results = [];
  for (const rec of fileRecords) {
    const inputPath = rec.path;
    const defaultOutDir = outputDir || path.join(path.dirname(inputPath), 'decrypted');

    try {
      sendProgress({ uid: rec.uid, status: 'decrypting', percent: 0 });
      const resPath = await decryptSingleFile(inputPath, defaultOutDir, password, (p) => {
        sendProgress({ uid: rec.uid, status: 'decrypting', percent: p });
      });
      sendProgress({ uid: rec.uid, status: 'done', percent: 100, outputPath: resPath });
      results.push({ uid: rec.uid, success: true, outputPath: resPath });
    } catch (err) {
      sendProgress({ uid: rec.uid, status: 'error', percent: 100, error: String(err) });
      results.push({ uid: rec.uid, success: false, error: String(err) });
    }
  }
  return results;
}

module.exports = {
  encryptFiles,
  decryptFiles,
  encryptSingleFile,
  decryptSingleFile
};
