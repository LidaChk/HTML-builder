const fs = require('fs');
const path = require('path');
const readline = require('readline');

class FileWriter {
  constructor(fileName = 'out.txt') {
    this.stdout = process.stdout;
    this.stdin = process.stdin;
    this.rl = readline.createInterface({
      input: this.stdin,
      output: this.stdout,
    });
    this.fullFileName = path.join(__dirname, fileName);
    this.writeStream = fs.createWriteStream(this.fullFileName);
    process.on('SIGINT', () => {
      process.exit();
    });
    this.welcome =
      '>> Enter the text to see it in out.txt. To exit - type "exit" or press Ctrl+C\n>> ';
  }
  readIn() {
    this.rl.question(this.welcome, (answer) => {
      this.welcome = '>> ';
      this.writeFile(answer);
    });
  }
  writeFile(text) {
    this.writeStream.write(text + '\n');
    this.readIn();
  }
}

const fileWriter = new FileWriter();
fileWriter.readIn();
