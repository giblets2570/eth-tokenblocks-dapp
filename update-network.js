let fs = require('fs');
let contents = fs.readFileSync('./.env').toString();
let lines = contents.split('\n');
let a = lines[0].split('=');
a[1] = (parseInt(a[1]) + 1).toString();
contents = contents.replace(lines[0], a.join('='));
fs.writeFileSync('./.env', contents);
