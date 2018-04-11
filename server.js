const express = require('express'),
bodyParser = require('body-parser'),
_ = require('underscore'),
//db = require('./models'),
cors = require('cors'),
app = express(),
server = require('http').Server(app),
io = require('socket.io')(server),
photos = require('./app/routes/photos');

app.use(bodyParser.urlencoded({
    limit: '500mb',
    extended: true
}));

app.use(bodyParser.json({
    limit: '500mb',
    type: 'application/*'
}));

app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use('/photos', photos);

const port = process.env.PORT || 8000;
//db.sequelize.sync({force:false}).then(function() {
    server.listen(port,() => {
        console.log("We are live on port: "+port);
    });
//});

require('./app/lib/socket')(io)
