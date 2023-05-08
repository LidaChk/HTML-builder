/*
  node 03-files-in-folder
 */

const fspr = require('fs/promises');
const stat = require('fs').stat;
const path = require('path');
const process = require('process');

class DirInfo {
  constructor(dir = 'secret-folder') {
    this.dir = dir;
    this.fullPath = path.join(__dirname, `${dir}`);
    process.on('exit', () =>
      this.log(
        '\x1b[35m\n** 1 KiB = 1024 byte **\n** Good Luck, Have Fun! **\n'
      )
    );
  }
  getDirInfo(fullPath = this.fullPath, subfolder = false) {
    this.log(`\n\x1b[35mFolder ${this.dir} contains:\n`);
    fspr.readdir(fullPath, { withFileTypes: true }).then((files) => {
      for (const file of files) {
        if (file.isFile()) {
          stat(path.join(fullPath, file.name), (err, stats) => {
            if (!err) {
              let fname = path.parse(file.name);
              this.log(
                `${fname.name}\t- ${fname.ext.slice(
                  1
                )}\t- \x1b[36m${this.bytesToSize(stats.size)}\n`
              );
            }
          });
        } else if (subfolder) {
          process.stdout.write(file.name);
          this.getDirInfo(path.join(fullPath, file.name));
        }
      }
    });
  }

  bytesToSize(bytes) {
    const sizes = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
    if (bytes === 0) return `0\x1b[32m ${sizes[0]}`;
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    if (i === 0) return `${bytes}\x1b[32m ${sizes[i]}`;
    return `${(bytes / 1024 ** i).toFixed(1)}\x1b[32m ${sizes[i]}`;
  }
  log(message) {
    process.stdout.write(`\x1b[32m${message}\x1b[0m`);
  }
}

const dirInfo = new DirInfo();
dirInfo.getDirInfo();
