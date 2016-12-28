//main.js
const fs = require('fs');
var rerequire = require('./rerequire.js');
var log = require('./log.js');
var url = fs.readFileSync('./private/url').toString().trim();

module.exports = function (req, res){
	log(req.url, req.connection.remoteAddress);
	if (req.url.trim() !== '/'+url){
		log('wrong url');
		res.writeHead(200);
		res.end();
		return;
	};
	var updt = [];
	req.on('data', (chunk)=>{
		updt.push(chunk);
	}).on('error', ()=>{
		res.writeHead(200);
		res.end();
	}).on('end', ()=>{
		updt = JSON.parse(Buffer.concat(updt).toString());
		if (!(updt.message && updt.message.text && updt.message.chat.id)){
			res.writeHead(200);
			res.end();
			return;
		};
		handle(updt.message.text, updt.message.chat.id, res);
	})
};

function handle(msg, id, res){
	var commands = rerequire('./commands.js');

	for (c in commands){
		var re = new RegExp(`^${c}\\b`,'i');
		if (re.test(msg)){var command = c; break;};
	};

	var reply = defReply();

	if(!command){
		reply = 'type "commands" for command list';
	}else if (!authorized(command, id)){
		reply = 'You require security clearence level ' + Math.floor((Math.random()*8)+1);
	}else {
		if (!(fs.readdirSync('./data/context/').indexOf(id + '.json')+1)){
			fs.writeFileSync('./data/context/'+id+'.json', '{}');
		};
		reply = commands[command](msg, id) || 'x_x';		
	};
	
	var data = {chat_id: id};
	data.method = "sendMessage";
	data.text = reply;

	res.writeHead(200, {'Content-Type':'application/json'})
	res.write(JSON.stringify(data));
	res.end();
};

/////////////////////////////////

function defReply(){return 'hi'};

function authorized(){return true};
