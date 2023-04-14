const https=require('https');
const {writeFileSync, readFileSync}=require('fs');

var nextproblem=(pid)=>{
    if(pid>9212)return;
    else{
        https.get(`https://www.luogu.com.cn/problem/P${pid}`,(res)=>{
            let html='';
            res.on('data',chunk=>html+=chunk);
            res.on('end',()=>{
                var mdcode;
                if(html.split('<article>').length==1)mdcode=html;
                else mdcode=html.split('<article>')[1].split('</article>')[0];
                writeFileSync(`datas/P${pid}.md`,mdcode);
                console.log(`P${pid} is done.`)
            });
        });
        pid++;
        while(pid<=9212&&readFileSync(`datas/P${pid}.md`,'utf8').split('日爆').length==1)pid++;
        setTimeout(()=>{
            nextproblem(pid);
        },200);
    }
};
nextproblem(1000);
