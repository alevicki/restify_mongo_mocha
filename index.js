var restify = require('restify');

var Notes = require('./lib/server/apis/notes.js')

var server = restify.createServer();
server.use(restify.bodyParser());
new Notes(server);

server.listen(1234, function() {
    console.log('%s listening at %s', server.name, server.url);
});