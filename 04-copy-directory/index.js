/*
  node 04-copy-directory
*/

const fspr = require('fs/promises');
const fs = require('fs');
const path = require('path');
const process = require('process');

class CopyDir {
  constructor(filesCopy = 'files-copy', files = 'files', subfolder = false) {
    this.files = files;
    this.filesCopy = filesCopy;
    this.fullPath = path.join(__dirname, `${files}`);
    this.fullPathCopy = path.join(__dirname, `${filesCopy}`);
    process.on('exit', () => {
      this.log(`\x1b[35m**End of copy from ${files} to ${filesCopy}**\n`);
    });
    this.subfolder = subfolder;
    this.mkdir = 0;
  }

  start() {
    this.log('\n', false);
    this.log(
      `\x1b[35m**Start copying from ${this.files} to ${this.filesCopy}**\n`
    );
    fs.rm(
      this.fullPathCopy,
      { recursive: true, force: true, maxRetries: 30 },
      (err) => {
        if (err) {
          this.errorLog(
            `Folder ${this.fullPathCopy}  does not deleted with error: ${err}\n`
          );
          process.exit();
        } else {
          this.copyDir();
        }
      }
    );
  }
  copyDir(
    fullPath = this.fullPath,
    fullPathCopy = this.fullPathCopy,
    subfolder = this.subfolder
  ) {
    fspr
      .mkdir(fullPathCopy, { recursive: true })
      .then((res) => {
        this.log(
          `Folder ${fullPathCopy} ${
            !res ? 'alredy exists' : 'created successfully'
          }\n`
        );
        fspr.readdir(fullPath, { withFileTypes: true }).then((files) => {
          /* здесь такой асинхрон бессмыссленен
           - но захотелось поиграться */
          (async function (from) {
            for await (const file of files) {
              if (file.isFile()) {
                fspr
                  .copyFile(
                    path.join(fullPath, file.name),
                    path.join(fullPathCopy, file.name)
                  )
                  .then(() => {
                    from.log(
                      `File ${path.join(
                        fullPath,
                        file.name
                      )} copied successfully\n`
                    );
                  })
                  .catch((err) =>
                    this.errorLog(
                      `File ${path.join(
                        fullPath,
                        file.name
                      )} does not copied with error: ${err}\n`
                    )
                  );
              } else if (subfolder) {
                from.copyDir(
                  path.join(fullPath, file.name),
                  path.join(fullPathCopy, file.name),
                  (subfolder = true)
                );
              }
            }
          })(this);
        });
      })
      .catch((err) => {
        this.mkdir += 1;
        if (this.mkdir > 20) {
          this.errorLog(
            `Folder ${fullPathCopy}  does not created with error: ${err}\n`
          );
        } else {
          this.copyDir(fullPath, fullPathCopy, subfolder);
        }
      });
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
  cleanFolder(homePath = __dirname, folder = this.filesCopy) {
    fs.readdir(homePath, { withFileTypes: true }, (err, files) => {
      files
        .filter((file) => file.name === folder)
        .forEach((file) =>
          fs.rm(
            path.join(homePath, file.name),
            { recursive: true, force: true, maxRetries: 30 },
            (err) => {
              if (err)
                this.errorLog(
                  `Folder ${path.join(
                    homePath,
                    folder
                  )}  does not deleted with error: ${err}\n`
                );
              process.exit();
            }
          )
        );
    });
  }
}

const copyDir = new CopyDir();
copyDir.start();
