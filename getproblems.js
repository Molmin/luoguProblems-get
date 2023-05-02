const {writeFileSync,readFileSync,mkdirSync,existsSync}=require('fs');
var https=require('https');

var type=process.argv[2];

if(!existsSync(`data/${type}`))mkdirSync(`data/${type}`);
var problemList=JSON.parse(readFileSync(`data/${type}.json`,'utf8'));
var problemIdList=new Array();
for(var key in problemList)
    problemIdList.push(key);

var getProblem=(id)=>{
    if(id==problemIdList.length)return;
    var PID=problemIdList[id];
    if(existsSync(`data/${type}/${PID}`)){
        getProblem(id+1);
    }
    else{
        console.log(`Getting Problem ${PID} (${id+1}/${problemIdList.length})`);
        https.get(`https://www.luogu.com.cn/problem/${PID}?_contentOnly=1`,(res)=>{
            let data='';
            res.on('data',chunk=>data+=chunk);
            res.on('end',()=>{
                if(data.startsWith('<!DOCTYPE html>'))return;
                var samples=JSON.parse(data).currentData.problem.samples;
                var code=``;
                samples.forEach((sample,index)=>{
                    code+=`===== Sample #${index+1} Input =====\n${sample[0]}\n===== Sample #${index+1} Output =====\n${sample[1]}\n`;
                });
                writeFileSync(`data/${type}/${PID}`,code);
            });
        });
        setTimeout(()=>getProblem(id+1),Number(process.argv[3]));
    }
}

getProblem(0);