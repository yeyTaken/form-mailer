require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

const indexRouter = require('./routes/index');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'assets', 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/', indexRouter);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
