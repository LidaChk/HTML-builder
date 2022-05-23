const fspr = require('fs/promises');
const path = require('path');
const process = require('process');

class CopyDir {
  constructor(filesCopy = 'files-copy', files = 'files', subfolder = true) {
    this.fullPath = path.join(__dirname, `${files}`);
    this.fullPathCopy = path.join(__dirname, `${filesCopy}`);
    process.on('exit', () =>
      this.log(`${files} successfully copied to ${filesCopy}\n`)
    );
    this.subfolder = subfolder;
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
          for (const file of files) {
            if (file.isFile()) {
              fspr
                .copyFile(
                  path.join(fullPath, file.name),
                  path.join(fullPathCopy, file.name)
                )
                .then(() => {
                  this.log(
                    `File ${path.join(
                      fullPath,
                      file.name
                    )} copied successfully\n`
                  );
                })
                .catch((err) =>
                  process.stderr.write(
                    `File ${path.join(
                      fullPath,
                      file.name
                    )} does not copied with error: ${err}\n`
                  )
                );
            } else if (subfolder) {
              this.copyDir(
                path.join(fullPath, file.name),
                path.join(fullPathCopy, file.name),
                (subfolder = true)
              );
            }
          }
        });
      })
      .catch((err) =>
        process.stderr.write(
          `Folder ${fullPathCopy}  does not created with error: ${err}\n`
        )
      );
  }
  log(message) {
    process.stdout.write(
      `${new Date().toLocaleTimeString([], {
        hour12: false,
      })}.${new Date().getMilliseconds()} ${message}`
    );
  }
}

const copyDir = new CopyDir();
copyDir.copyDir();
const copyDir2 = new CopyDir('files2-copy', 'files2', true);
copyDir2.copyDir();
