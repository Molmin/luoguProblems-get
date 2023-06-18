module.exports = (type, pid) => {
    if (type == 'P') return [`https://www.luogu.com.cn/problem/${pid}`];
    if (type == 'B') return [`https://www.luogu.com.cn/problem/${pid}`];
    if (type == 'CF') {
        var tmp = /^CF(\d*)([A-Z0-9]*)$/.exec(pid);
        return [
            `https://codeforces.com/contest/${tmp[1]}/problem/${tmp[2]}`,
            `https://codeforces.com/problemset/problem/${tmp[1]}/${tmp[2]}`,
            `https://www.luogu.com.cn/problem/${pid}`
        ];
    }
    if (type == 'AT'){
        var tmp = /^AT_(([a-z0-9A-Z_]*)_[a-z0-9]*?)$/.exec(pid);
        // console.log(pid,tmp);
        return [
            `https://atcoder.jp/contests/${tmp[2].split('_').join('-')}/tasks/${tmp[1]}`,
            `https://www.luogu.com.cn/problem/${pid}`
        ];
    }
};