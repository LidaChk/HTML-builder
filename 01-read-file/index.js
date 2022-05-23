const fs = require('fs');
const path = require('path');
const process = require('process');

class FileReader {
  constructor(fileName = 'text.txt') {
    this.fullFileName = path.join(__dirname, fileName);
    this.out = '';
  }

  readFile() {
    const readable = fs.createReadStream(this.fullFileName, 'utf-8', {
      highWaterMark: 32,
    });
    readable.on('data', (chunk) => process.stdout.write(chunk));
  }
}

const fileReader = new FileReader();
fileReader.readFile();
