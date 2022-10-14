const express = require('express'); //Import the express dependency
const app = express();              //Instantiate an express app, the main work horse of this server
const http = require('http');
const fs = require('fs');
const cors = require('cors');
/* var sslRootCAs = require('ssl-root-cas/latest')
sslRootCAs.inject() */

const DroNetQueueManager = require('./DroNetQueueManager');
require('./queue/photogrammetry/photogrammetryConsumer');

require('dotenv').config();
app.use(express.urlencoded());
app.use(express.json());

// TO DO : burasi yerine module kullanilacak CORS
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    next();
});


app.use(
    cors({
        origin: ["http://localhost:1025", "http://localhost:1024", "http://localhost:1010", "http://localhost:1011", "http://172.72.239.202:1011", "http://91.93.170.253:1011", "http://192.168.30.14:1011/", "https://dronet.netcad.com/"]
    })
);

const port = 8096;

const server = http.createServer(app);

server.on('error', onError);
server.listen(port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
    console.log(`Now listening on port ${port}`);
});

function onError(error) {
    console.log(error);
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

app.get('/', (req, res) => {
    res.status(200).send({
        status: true,
        message: 'Welcome to queue API'
    });
});

app.post('/addToQueue', async (req, res) => {
    let data = req.body.data;
    let result = await DroNetQueueManager.addToQueue(data);
    if (result.status) {
        res.status(200).send(result);
    } else {
        res.status(403).send(result);
    }
});

app.get('/getJobs/:name', async (req, res) => {
    let name = req.params.name;
    let result = await DroNetQueueManager.getQueueData(name);
    if (result.status) {
        res.status(200).send(result);
    } else {
        res.status(403).send(result);
    }
});

app.get('/clearFailJobs/:name', async (req, res) => {
    let name = req.params.name;
    let result = await DroNetQueueManager.clearFailJobs(name);
    if (result.status) {
        res.status(200).send(result);
    } else {
        res.status(403).send(result);
    }
});

app.get('/pauseJobs/:name', async (req, res) => {
    let name = req.params.name;
    let result = await DroNetQueueManager.pauseJobs(name);
    if (result.status) {
        res.status(200).send(result);
    } else {
        res.status(403).send(result);
    }
});

app.get('/resumeJobs/:name', async (req, res) => {
    let name = req.params.name;
    let result = await DroNetQueueManager.resumeJobs(name);
    if (result.status) {
        res.status(200).send(result);
    } else {
        res.status(403).send(result);
    }
});

app.post('/removeJob', async (req, res) => {
    let name = req.body.name;
    let id = req.body.id;
    let data = {
        id,
        name
    }
    let result = await DroNetQueueManager.removeJob(data);
    if (result.status) {
        res.status(200).send(result);
    } else {
        res.status(403).send(result);
    }
});