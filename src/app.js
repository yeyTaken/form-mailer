require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

const indexRouter = require('./routes/index');

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', indexRouter);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
