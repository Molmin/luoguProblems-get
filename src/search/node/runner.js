const express = require('express'),
    app = express();
const cors = require('cors');
app.use(cors());
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const path = require('path');
const nunjucks = require('nunjucks');
nunjucks.configure('src/search/node/templates', {
    autoescape: true, express: app
});
const Page = { title: 'Sample Searcher' };

const Searcher = require('./main.js');

app.get('/', (req, res) => {
    var data = { range: {}, mode: {} };
    data.range.P = '洛谷主题库', data.range.B = '洛谷入门与面试';
    data.range.AT = 'AtCoder', data.range.CF = 'CodeForces';
    data.mode.contain = '包含模式';
    data.mode.perfect = '完全匹配';
    res.render('home.html', Object.assign(Page, data));
});

app.post('/api', (req, res) => {
    try {
        var options = JSON.parse(req.body.options);
        var result = Searcher(options);
        if (result.err) res.status(200).json({ err: result.err });
        else res.status(200).json(result);
    }
    catch (err) { res.status(200).json({ err: 'System Error.' }); };
});

app.get('/main.js', (req, res) => {
    res.sendFile('assets/main.js', { root: __dirname }, err => { });
});
app.get('/main.css', (req, res) => {
    res.sendFile('assets/main.css', { root: __dirname }, err => { });
});

var server = app.listen(7699, () => {
    console.log(`Port ${server.address().port} is opened`);
});