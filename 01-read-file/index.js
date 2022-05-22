const fs = require('fs');
const readable = fs.createReadStream('./01-read-file/text.txt', {
  highWaterMark: 32,
});

(async () => {
  let arr = [];
  let totalLength = 0;
  for await (const chunk of readable) {
    arr.push(chunk);
    totalLength += chunk.length;
  }
  console.log(Buffer.concat(arr, totalLength).toString());
})();
