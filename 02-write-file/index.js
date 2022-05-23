const fs = require('fs');
const path = require('path');
const readline = require('readline');

class FileWriter {
  constructor(fileName = 'out.txt') {
    this.fileName = 'out.txt';
    this.stdout = process.stdout;
    this.stdin = process.stdin;
    this.rl = readline.createInterface({
      input: this.stdin,
      output: this.stdout,
    });
    this.fullFileName = path.join(__dirname, fileName);
    this.writeStream = fs.createWriteStream(this.fullFileName);
    process.on('SIGINT', () => {
      this.exitPr();
    });
    process.on('exit', () => {
      process.stdout.write(
        `\x1b[35mCheck out file: ${this.fileName}\nGood Luck, Have Fun!\n\x1b[0m`
      );
    });
    this.welcome =
      '\x1b[35m\nEnter something to see it in out.txt. To exit - type "exit" or press Ctrl+C\n>>\x1b[32m ';
  }
  readIn() {
    this.rl.question(this.welcome, (answer) => {
      this.welcome = '\x1b[35m>> \x1b[32m';
      if (answer === 'exit') this.exitPr();
      this.writeFile(answer);
    });
  }
  writeFile(text) {
    this.writeStream.write(text + '\n');
    this.readIn();
  }
  exitPr() {
    process.exit();
  }
}

const fileWriter = new FileWriter();
fileWriter.readIn();
