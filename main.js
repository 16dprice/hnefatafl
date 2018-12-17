var express = require('express');
var app = express();
var path = require('path');
var port = 80;

// tell the app which directory to use
// used when linking to js and css files in the index
app.use( express.static(__dirname + '/') );

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(port, () => console.log(`example app listening on port ${port}!`));