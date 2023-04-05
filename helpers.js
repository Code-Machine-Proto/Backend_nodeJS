const readline = require('readline');
var fs = require('fs');

exports.readEachLine = async (filename) => {
  const fileStream = fs.createReadStream(filename, 'utf8');

    const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
    });
  
  const data = [];
  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.
    data.push(line);
  }
  return data;
}