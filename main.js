//main.js
const path = require('path');
const fs = require('fs');
var rerequire = require('./rerequire.js');
var log = require('./log.js');
var url = fs.readFileSync('./private/url').toString().trim();

module.exports = function (req, res){
	log(Date()+' '+req.connection.remoteAddress);
	if (req.url.trim() !== '/'+url){
		log(`wrong url: ${req.url}`);
		res.writeHead(404);
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

function handle(msg, cid, res){
	var commands = rerequire('./commands.js');

	for (c in commands){
		var re = new RegExp(`^${c}\\b`,'i');
		if (re.test(msg)){var command = c; break;};
	};

	var reply = defReply();

	if(!command){
		reply = 'type "commands" for command list';
	}else if (!authorized(command, cid)){
		reply = 'You require security clearence level ' + Math.floor((Math.random()*8)+1);
	}else {
		var contextFilePath = path.format({
			dir: './data/context',
			base: cid+'.json'
		});
		//todo refac w/ path
		var contextFilePath = './data/context/' + cid + '.json';
		if (!(fs.readdirSync('./data/context/').indexOf(cid + '.json')+1)){
			fs.writeFileSync(contextFilePath, JSON.stringify({command: command}));
		}else {
			var context = JSON.parse(fs.readFileSync(contextFilePath));
			context.command = command;
			fs.writeFileSync(contextFilePath, JSON.stringify(context));
		};
		reply = commands[command](msg, cid) || 'x_x';		
	};
	
	var data = {chat_id: cid};
	data.method = "sendMessage";
	data.text = reply;

	res.writeHead(200, {'Content-Type':'application/json'})
	res.write(JSON.stringify(data));
	res.end();
};

/////////////////////////////////

function defReply(){return 'hi'};

function authorized(){return true};
