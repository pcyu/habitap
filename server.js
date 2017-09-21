const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');


const express = require('express');
const {PORT, DATABASE_URL} = require('./config');
const app = express();
app.use(morgan('common'));
app.use(bodyParser.json());

app.use( '/', express.static(__dirname + '/public') );
app.use( '/node_modules', express.static(__dirname + '/node_modules') );
app.use( '/src', express.static(__dirname + '/src') );

const {Person} = require('./models');

app.get('/heartbeat', function(req, res) {
  res.json({
    is: 'working'
  })
});

app.listen(PORT, function() {
  console.log(`The server at port ${PORT} is listening.`);
});

exports.app = app;