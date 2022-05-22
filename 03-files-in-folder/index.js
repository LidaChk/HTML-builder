const fs = require('fs');
const path = require('path');
const process = require('process');

class DirInfo {
  constructor(dir = 'secret-folder') {
    this.dir = 'secret-folder';
    this.fullPath = path.join(__dirname, `${dir}`);
    process.on('SIGINT', () => {
      this.exitPr();
    });
  }
  getDirInfo() {
    fs.readdir(this.fullPath, { withFileTypes: true }, (e, files) => {
      if (e) process.stdout.write(e);
      files.forEach((file) => {
        if (file.isFile())
          fs.stat(path.join(this.fullPath, file.name), (err, stats) => {
            if (!err) {
              let fname = file.name.split('.');
              process.stdout.write(
                `${fname[0]} - ${fname[1]} - ${this.bytesToSize(stats.size)}\n`
              );
            }
          });
      });
    });
  }
  exitPr() {
    process.stdout.write('Good Luck, Have Fun!');
    process.exit();
  }
  bytesToSize(bytes) {
    const sizes = ['bytes', 'kb', 'mb', 'GB', 'TB'];
    if (bytes === 0) return 'n/a';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    if (i === 0) return `${bytes}${sizes[i]}`;
    return `${(bytes / 1024 ** i).toFixed(1)}${sizes[i]}`;
  }
}

const dirInfo = new DirInfo();
dirInfo.getDirInfo();
