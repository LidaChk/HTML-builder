const fspr = require('fs/promises');
const stat = require('fs').stat;
const path = require('path');
const process = require('process');

class createBundle {
  constructor(bundle = 'bundle.css', source = 'styles', dist = 'project-dist') {
    this.dir = 'secret-folder';
    this.fullPath = path.join(__dirname, `${dir}`);
    process.on('exit', () => process.stdout.write('\nGood Luck, Have Fun!'));
  }
  getDirInfo(fullPath = this.fullPath, subfolder = false) {
    fspr.readdir(fullPath, { withFileTypes: true }).then((files) => {
      for (const file of files) {
        if (file.isFile()) {
          stat(path.join(fullPath, file.name), (err, stats) => {
            if (!err) {
              let fname = file.name.split('.');
              process.stdout.write(
                `${fname[0]} - ${fname[1]} - ${this.bytesToSize(stats.size)}\n`
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
    const sizes = ['bytes', 'kb', 'mb', 'GB', 'TB'];
    if (bytes === 0) return `0${sizes[0]}`;
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    if (i === 0) return `${bytes}${sizes[i]}`;
    return `${(bytes / 1024 ** i).toFixed(1)}${sizes[i]}`;
  }
}

const dirInfo = new DirInfo();
dirInfo.getDirInfo();
