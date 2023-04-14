const https=require('https');
const {writeFileSync}=require('fs');

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
        setTimeout(()=>{
            nextproblem(pid+1);
        },200);
    }
};
nextproblem(1000);