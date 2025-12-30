**Your Code Goes Here**

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const lines = [];
rl.on('line', (line) => {
    lines.push(line);
}).on('close', () => {
    const n_arr = parseInt(lines[0]);
    const arr = lines[1].split(' ').map(Number);
    const target = parseInt(lines[2]);
    
    const result = twoSum(arr, target);
    
    console.log(result.join(' '));
});