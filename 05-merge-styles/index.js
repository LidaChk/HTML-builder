/*
 node 05-merge-styles
*/

const fs = require('fs');
const fspr = require('fs/promises');
const path = require('path');
const process = require('process');

class CreateBundle {
  constructor(
    bundle = 'bundle.css',
    dist = 'project-dist',
    styles = 'styles',
    subfolder = false
  ) {
    this.styles = styles;
    this.bundle = bundle;
    this.fullPath = path.join(__dirname, `${styles}`);
    this.fullNameCopy = path.join(__dirname, dist, `${bundle}`);
    this.subfolder = subfolder;
    process.on('exit', () => {
      this.log(`\x1b[35m**End of copy ${styles} to ${bundle}**\n\x1b[0m`);
    });
    this.writeStream = fs.createWriteStream(this.fullNameCopy);
  }

  start() {
    this.log('\n', false);
    this.log(
      `\x1b[35m**Start copying ${this.styles} to ${this.bundle}**\n\x1b[0m`
    );
    this.CreateBundle();
  }
  CreateBundle(
    fullPath = this.fullPath,
    fullPathCopy = this.fullPathCopy,
    subfolder = this.subfolder
  ) {
    fspr
      .readdir(fullPath, { withFileTypes: true })
      .then((styles) => {
        for (const file of styles) {
          if (file.isFile() && path.extname(file.name) === '.css') {
            fs.createReadStream(path.join(fullPath, file.name)).pipe(
              this.writeStream
            );
            this.log(`File ${file.name} copied to ${this.bundle}\n`);
          } else if (!file.isFile() && subfolder) {
            this.CreateBundle(
              path.join(fullPath, file.name),
              fullPathCopy,
              (subfolder = true)
            );
          }
        }
      })
      .catch((err) =>
        this.errorLog(`Read ${fullPath} fails with error: ${err}\n`)
      );
  }

  log(message, timeFlg = true) {
    if (timeFlg) {
      process.stdout.write(
        `\x1b[32m${new Date().toLocaleTimeString([], {
          hour12: false,
        })}.${new Date().getMilliseconds()}: ${message}\x1b[0m`
      );
    } else {
      process.stdout.write(`\x1b[32m${message}\x1b[0m`);
    }
  }
  errorLog(message) {
    process.stderr.write(
      `\x1b[41m\x1b[37m${new Date().toLocaleTimeString([], {
        hour12: false,
      })}.${new Date().getMilliseconds()}:\x1b[0m \x1b[31m${message}\x1b[0m`
    );
  }
}

const createBundle = new CreateBundle();
createBundle.start();
