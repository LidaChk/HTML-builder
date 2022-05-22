const fs = require('fs');
const path = require('path');

class FileReader {
  constructor(fileName = 'text.txt') {
    this.fullFileName = path.join(__dirname, fileName);
    this.out = '';
  }

  readFile() {
    const readable = fs.createReadStream(this.fullFileName, 'utf-8', {
      highWaterMark: 32,
    });
    readable
      .on('data', (chunk) => (this.out += chunk))
      .on('end', () => console.log(this.out));
  }
}

const fileReader = new FileReader();
fileReader.readFile();

/* (async () => {
  let arr = [];
  let totalLength = 0;
  for await (const chunk of readable) {
    arr.push(chunk);
    totalLength += chunk.length;
  }
  console.log(Buffer.concat(arr, totalLength).toString());
})(); */
