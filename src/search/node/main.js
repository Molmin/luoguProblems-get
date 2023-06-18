const { readFileSync, readdirSync } = require('fs');
const UrlMaker = require('./../../get/url.js');

const supportType = ['AT', 'CF', 'P', 'B'];
const defaultType = ['AT', 'CF', 'P'];

var convertSample = (sample) => {
    if (!sample) return '';
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

const toStandardOption = option => {
    if (typeof option == 'number') option = String(option);
    if ((typeof option == 'object' && option instanceof Array) ||
        typeof option == 'string') option = { sample: option };
    if (typeof option != 'object' || !option.sample)
        return { err: "Invalid options." };
    if (!option.range) option.range = defaultType;
    if (option.range == 'all') option.range = supportType;
    if (typeof option.range == 'string' && option.range.split('|').length > 1)
        option.range = option.range.split('|');
    if (typeof option.range == 'string' && option.range.split(',').length > 1)
        option.range = option.range.split(',');
    if (typeof option.range == 'string' && option.range.split(';').length > 1)
        option.range = option.range.split(';');
    if (typeof option.range == 'string') option.range = [option.range];
    if ((typeof option.range != 'object') || !(option.range instanceof Array))
        return { err: "Invalid search range." };
    option.range.forEach(r => {
        if (!supportType.includes(r))
            return { err: "Invalid search range.1" };
    });
    if (!option.mode) option.mode = 'contain';
    if (!['perfect', 'contain'].includes(option.mode))
        return { err: "Invalid search mode." };
    if (typeof option.sample == 'number') option.sample = String(option.sample);
    if (typeof option.sample == 'string') option.sample = [option.sample];
    option.sample.forEach((condition, index) => {
        if (typeof condition != 'string' && (typeof condition != 'object'
            || !condition.input || !condition.output))
            return { err: `Invalid search condition (#${index}).` };
        if (typeof condition == 'string')
            option.sample[index] = convertSample(condition);
        else option.sample[index].input = convertSample(condition.input),
            option.sample[index].output = convertSample(condition.output);
    });
    return option;
};

/* option = {
    range: ['AT', 'P'] / 'P' / 'all' / 'AT|P' / 'AT,P' / 'AT;P'
        (default: ['AT', 'CF', 'P' ])
    mode: 'perfect' / ‘contain’
        (default: 'contain')
    sample: Array / String / Number
        if Array
            [condition1, condition2, ...]
        if String
            condition1
        if Number
            toString(x)
        condition: {input: '', output: ''} / ''
} */

const getSingleSampleList = range => {
    var list = JSON.parse(readFileSync(`data/${range}.json`, 'utf8')),
        files = readdirSync(`data/${range}`), result = new Array();
    files.forEach(file => {
        if (/^\d*\.json$/.test(file)) {
            var samples = JSON.parse(readFileSync(`data/${range}/${file}`, 'utf8'));
            for (var pid in samples) if (list[pid])
                result.push({
                    pid: pid, title: list[pid].title,
                    type: range, samples: samples[pid].s
                });
        }
    });
    return result;
};

const getMultiSampleList = range => {
    var Range = new Array();
    range.forEach(r => {
        var tmp = getSingleSampleList(r);
        tmp.forEach(x => Range.push(x));
    });
    return Range;
};

const makeVagueTester = str => RegExp(`(.*?)${str.split('').join('(.*?)')}(.*?)`, "i");

const checkMatch = (pro, mode, sample) => {
    const checker = {
        contain: (sample, search) => sample.includes(search),
        vague: (sample, search) => makeVagueTester(search).test(sample),
        perfect: (sample, search) => sample == search
    }[mode];
    var result = true;
    sample.forEach(s => {
        if (!result) return;
        var flag = false;
        if (typeof s == 'string')
            pro.samples.forEach(str => {
                if (checker(str, s)) flag = true;
            });
        else
            pro.samples.forEach((str, index) => {
                if (index & 1) return;
                if (checker(pro.samples[index + 1], s.output)
                    && checker(str, s.input)) flag = true;
            });
        if (!flag) result = false;
    });
    return result;
};

const search = option => {
    option = toStandardOption(option);
    if (option.err) return option;
    var Range = getMultiSampleList(option.range), result = new Array();
    Range.forEach(pro => {
        if (checkMatch(pro, option.mode, option.sample))
            pro.url = UrlMaker(pro.type, pro.pid), result.push(pro);
    });
    return result;
};

module.exports = search;