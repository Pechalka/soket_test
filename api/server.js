var express = require('express')
  , http = require('http')
  , path = require('path')
  , fs = require('fs');

 var Faker = require('Faker');

var app = express();

var server = http.createServer(app);
var io = require('socket.io').listen(server);

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname , '/../app')));



server.listen(3000, function(){
  console.log('Express server listening on port 3000');
});
function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
};

function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         s4() + '-' + s4() + s4() + s4();
}

var online = [
		{  
			id : guid(),
			company_id : '123',
      		name : Faker.Company.companyName(),
      		address: Faker.Address.streetAddress(),
      		pos: {lat: 53.89116 + Math.random()/100, lon: 27.551 + Math.random()/100}
  		},
  		{  
  			id : guid(),
			company_id : '2222',
      		name : Faker.Company.companyName(),
      		address: Faker.Address.streetAddress(),
      		pos: {lat: 53.89116 + Math.random()/100, lon: 27.551 + Math.random()/100}
  		}
	];

app.get('/api/all', function(req, res){ 
	res.json(online);
});

var count = 0;

var removeById = function(items, id){
	for (var i = 0; i < items.length; i++)
	    if (items[i].id && items[i].id === id) { 
	        items.splice(i, 1);
	        break;
	    }
}
io.sockets.on('connection', function (socket) {
	var me = null;
	socket.on('login', function(data){
		me = {
			id : guid(),
			company_id : '2222',
      		name : 'test',
      		address: Faker.Address.streetAddress(),
      		pos: {lat: 53.89116 + Math.random()/100, lon: 27.551 + Math.random()/100}
		};
		online.push(me);
		io.sockets.emit('in', me);
	});

	socket.on('logout', function(){
		if (me!=null) {
			removeById(online, me.id);
			io.sockets.emit('out', me.id);
			me = null;
		}
	})

	socket.on('disconnect', function () {
		if (me!=null) {
			removeById(online, me.id);
			io.sockets.emit('out', me.id);
			me = null;
		}
 	});
});