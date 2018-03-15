require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const htmling = require('htmling');

const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine('html', htmling.express(__dirname + '/views/', {watch:true}));
app.set('view engine', 'html');

app.get('/', (req, res) => {
  res.render('index');
});
app.get('/worker', (req, res) => {
  res.render('worker');
});
app.get('/canvas', (req, res) => {
  res.render('canvas');
});
app.get('/paint', (req, res) => {
  res.render('paint');
});

app.listen(process.env.PORT || 3000);


