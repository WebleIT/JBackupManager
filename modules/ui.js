var express = require('express');
var socket = require('socket.io');

global.sockets = [];

/**
 * Run the UI webserver (express and socket.io)
 */
function run() {
	// Launch Express and Socket.IO
	var app = express();
	var http = require('http');
	var server = http.createServer(app);
	var io = socket.listen(server, { log: false });

	// Ejs parser with html extension
	app.engine('.html', require('ejs').__express);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'html');

	// Session support
	app.use(express.cookieParser('backups'));
	app.use(express.session());

	// parse request bodies (req.body)
	app.use(express.bodyParser());

	// Main Controller (sucks, but let's make it easy)
	var obj = require('./sites.js');

	// Routes
	app.post('/site/:k/backup', obj.backup);
	app.post('/site/:k/download', obj.download);
	app.get('/site/:k', obj.edit);

	app.post('/save/:k', obj.save);
	app.post('/save/', obj.save);

	app.get('/add', obj.edit);
	
	app.get('/', obj.list);
	
	app.get('/delete/:k', obj.remove);

	app.post('/saveconfig', obj.saveconfig);
	app.post('/cleanup', obj.cleanup);
	app.get('/test', obj.test);
	
	// Launch
	server.listen(3000);

	// Serve static files (js, css, etc)
	app.use("/media", express.static(__dirname + '/public'));

	// Store all the Browsers connected so we can notify them with Socket.IO
	io.sockets.on('connection', function(socket){
		global.sockets.push(socket);
	});
}

exports.run = run;