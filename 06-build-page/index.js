const fs = require('fs');
const fspr = require('fs/promises');
const path = require('path');
const process = require('process');

class CreateDist {
  constructor(
    dist = 'project-dist',
    assets = 'assets',
    components = 'components',
    styles = 'styles',
    template = 'template.html'
  ) {
    this.homePath = __dirname;
    this.dist = dist;
    this.assets = assets;
    this.styles = styles;
    this.components = components;
    this.template = template;
    this.fullPathDist = path.join(this.homePath, dist);
    process.on('exit', () => {
      this.log(`\x1b[35m**End of build project to ${this.dist} **\n\x1b[0m`);
    });
    this.mkdir = 0;
  }

  start() {
    this.log('\n', false);
    this.log(`\x1b[35m**Start building ${this.dist}**\n\x1b[0m`);
    fs.rm(
      path.join(this.homePath, this.dist),
      { recursive: true, force: true, maxRetries: 30 },
      (err) => {
        if (err) {
          this.errorLog(
            `Folder ${path.join(
              this.homePath,
              this.dist
            )}  does not deleted with error: ${err}\n`
          );
          process.exit();
        } else {
          this.CreateFolder(this.fullPathDist).then(() => {
            this.CreateBundle(
              path.join(this.homePath, this.styles),
              fs.createWriteStream(path.join(this.fullPathDist, 'style.css'))
            );
            this.copyFolder(
              path.join(this.homePath, this.assets),
              path.join(this.fullPathDist, this.assets),
              true,
              true
            );
            this.createHtml(
              fs.createReadStream(path.join(this.homePath, this.template)),
              path.join(this.homePath, this.components),
              fs.createWriteStream(path.join(this.fullPathDist, 'index.html'))
            );
          });
        }
      }
    );
  }
  createHtml(readstream, fullFilePath, writestream) {
    this.log(
      `\x1b[33m**Start bulding ${path.join(this.dist, 'index.html')} from  ${
        this.components
      }**\n\x1b[0m`
    );
    readstream.on('data', (chunk) => {
      let code = chunk.toString();
      let r = new RegExp(/\{\{(.*?)\}\}/g);
      let params = [...code.matchAll(r)];

      params.map((param) =>
        param.push(
          fs.createReadStream(path.join(fullFilePath, `${param[1]}.html`))
        )
      );

      const getParam = (i = 0, code) => {
        params[i][2].on('data', (data) => {
          code = code.replace(new RegExp(params[i][0], 'g'), data);
          i += 1;
          if (i < params.length) getParam(i, code);
          else {
            writestream.write(`${code}\n`);
            this.log(
              `\x1b[33m**Bulding ${path.join(this.dist, 'index.html')} from  ${
                this.components
              } finished**\n\x1b[0m`
            );
          }
        });
      };
      getParam(0, code);
    });
  }
  CreateFolder(fullPath) {
    return fspr
      .mkdir(fullPath, { recursive: true })
      .then((res) => {
        this.log(
          `Folder ${fullPath} ${
            !res ? 'alredy exists' : 'created successfully'
          }\n`
        );
      })
      .catch((err) =>
        this.errorLog(
          `Folder ${fullPath}  does not created with error: ${err}\n`
        )
      );
  }
  CreateBundle(fullPath, writeStream, subfolder = false) {
    this.log(
      `\x1b[36m**Start copying ${this.styles} to ${path.join(
        this.dist,
        'style.css'
      )}**\n\x1b[0m`
    );
    fspr
      .readdir(fullPath, { withFileTypes: true })
      .then((styles) => {
        for (const file of styles) {
          if (file.isFile() && path.extname(file.name) === '.css') {
            fs.createReadStream(path.join(fullPath, file.name)).pipe(
              writeStream
            );
            this.log(
              `\x1b[36mFile ${file.name} copied to ${path.join(
                this.dist,
                'style.css'
              )}\n`
            );
          } else if (!file.isFile() && subfolder) {
            this.CreateBundle(
              path.join(fullPath, file.name),
              writeStream,
              (subfolder = true)
            );
          }
        }
      })
      .catch((err) =>
        this.errorLog(`Read ${fullPath} fails with error: ${err}\n`)
      );
  }
  copyFolder(fullPath, fullPathCopy, subfolder, init = false) {
    if (init)
      this.log(
        `\x1b[34m**Start copying files from ${this.assets} to ${path.join(
          this.dist,
          this.assets
        )}**\n\x1b[0m`
      );
    fspr
      .mkdir(fullPathCopy, { recursive: true })
      .then((res) => {
        this.log(
          `\x1b[34mFolder ${fullPathCopy} ${
            !res ? 'alredy exists' : 'created successfully'
          }\n`
        );
        fspr.readdir(fullPath, { withFileTypes: true }).then((files) => {
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
                      `\x1b[34mFile ${path.join(
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
                from.copyFolder(
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
        if (this.mkdir > 50) {
          this.errorLog(
            `Folder ${fullPathCopy}  does not created with error: ${err}\n`
          );
        } else {
          this.copyFolder(fullPath, fullPathCopy, subfolder, init);
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
}

const createDist = new CreateDist();
createDist.start();
