const { writeFileSync, readFileSync, mkdirSync, existsSync } = require('fs');
var https = require('https');

var type = process.argv[2];

if (!existsSync(`data/${type}`)) mkdirSync(`data/${type}`);
var problemList = JSON.parse(readFileSync(`data/${type}.json`, 'utf8'));
var problemIdList = new Array();
for (var key in problemList)
    problemIdList.push(key);
var current, currentJsonId;
var getCurrentData = (type, jsonId) => {
    if (existsSync(`data/${type}/${jsonId}.json`))
        return JSON.parse(readFileSync(`data/${type}/${jsonId}.json`));
    else return {};
}
current = getCurrentData(type, currentJsonId = 1);

var convertSample = (sample) => {
    sample = sample.split('\n');
    sample.forEach((line, index) => {
        line = line.split('\r').join('');
        while (line.length && "\r \t".includes(line.slice(-1)))
            line = line.slice(0, -1);
        sample[index] = line;
    });
    while (sample.length && sample.slice(-1)[0].length == 0)
        sample = sample.slice(0, -1);
    return sample.join('\n');
};

var getProblem = (id) => {
    if (id == problemIdList.length) return;
    if (Math.floor(id / 100) + 1 != currentJsonId)
        current = getCurrentData(type,
            currentJsonId = Math.floor(id / 100) + 1);
    var PID = problemIdList[id];
    if (current[PID]) getProblem(id + 1);
    else {
        console.log(`Getting Problem ${PID} (${id + 1}/${problemIdList.length})`);
        https.get(`https://www.luogu.com.cn/problem/${PID}?_contentOnly=1`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (data.startsWith('<!DOCTYPE html>')) {
                    console.log(`Failed: Getting Problem ${PID}`);
                    return;
                }
                var samples = JSON.parse(data).currentData.problem.samples;
                var result = new Array();
                samples.forEach(sample => {
                    result.push(convertSample(sample[0]));
                    result.push(convertSample(sample[1]));
                });
                current[PID] = { s: result };
                writeFileSync(`data/${type}/${currentJsonId}.json`, JSON.stringify(current));
            });
        });
        setTimeout(() => getProblem(id + 1), Number(process.argv[3]));
    }
}

getProblem(0);