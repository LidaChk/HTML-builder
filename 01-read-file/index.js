const fs = require('fs');
const path = require('path');
const process = require('process');

class FileReader {
  constructor(fileName = 'text.txt') {
    this.fileName = 'text.txt';
    this.fullFileName = path.join(__dirname, fileName);
    this.out = '';
  }

  readFile() {
    const readable = fs.createReadStream(this.fullFileName, 'utf-8', {
      highWaterMark: 32,
    });
    process.stdout.write(`\x1b[35m\nFile ${this.fileName} contains:\n\x1b[0m`);
    readable.on('data', (chunk) =>
      process.stdout.write(`\x1b[32m${chunk}\x1b[0m`)
    );
  }
}

const fileReader = new FileReader();
fileReader.readFile();
