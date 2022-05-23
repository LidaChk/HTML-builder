const fspr = require('fs/promises');
const path = require('path');
const process = require('process');

class CreateBundle {
  constructor(bundle = 'bundle.css', styles = 'styles', subfolder = false) {
    this.styles = styles;
    this.bundle = bundle;
    this.fullPath = path.join(__dirname, `${styles}`);
    this.fullNameCopy = path.join(__dirname, `${bundle}`);
    this.subfolder = subfolder;
    process.on('exit', () => {
      this.log(`**End of copy from ${styles} to ${bundle}**\n`);
    });
  }

  start() {
    this.log(`**Start copying from ${this.styles} to ${this.bundle}**\n`);
    this.CreateBundle();
  }
  CreateBundle(
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
        fspr.readdir(fullPath, { withFileTypes: true }).then((styles) => {
          /* здесь такой асинхрон бессмыссленен
           - но захотелось поиграться */
          (async function (from) {
            for await (const file of styles) {
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
                    process.stderr.write(
                      `File ${path.join(
                        fullPath,
                        file.name
                      )} does not copied with error: ${err}\n`
                    )
                  );
              } else if (subfolder) {
                from.CreateBundle(
                  path.join(fullPath, file.name),
                  path.join(fullPathCopy, file.name),
                  (subfolder = true)
                );
              }
            }
          })(this);
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
  cleanFolder(fullPathCopy = this.fullPathCopy) {
    return fspr
      .rm(fullPathCopy, { recursive: true, force: true })
      .catch((err) =>
        process.stderr.write(
          `Folder ${fullPathCopy}  does not deleted with error: ${err}\n`
        )
      );
  }
}

const CreateBundle = new CreateBundle();
CreateBundle.start();
