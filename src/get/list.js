const { writeFileSync } = require('fs');
var https = require('https');

var cntPages = 1, type = process.argv[2];

var problemList = {};

var getList = (pageId) => {
    if (pageId > cntPages) return;
    console.log(`Getting Page #${pageId} (${pageId}/${cntPages})`);
    https.get(`https://www.luogu.com.cn/problem/list?_contentOnly=1&type=${type}&page=${pageId}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            var list = JSON.parse(data).currentData.problems;
            if (pageId == 1) cntPages = Math.ceil(list.count / list.perPage);
            list.result.forEach(problem => problemList[problem.pid]
                = { pid: problem.pid, type: problem.type, title: problem.title });
            writeFileSync(`data/${type}.json`, JSON.stringify(problemList));
        });
    }).on('error', e => {
        console.log(`Failed: Getting Page #${pageId}`);
        setTimeout(() => getList(pageId), 400);
    });
    setTimeout(() => getList(pageId + 1), pageId == 1 ? 2000 : 800);
}

getList(1);