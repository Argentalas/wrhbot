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

		var cid = updt.message.chat.id;

		var users = JSON.parse(fs.readFileSync('./private/users.json'));
		users[cid] = users[cid] || {};
		users[cid].username = updt.message.chat.username;
		users[cid].firstName = updt.message.chat.first_name;
		users[cid].lastName = updt.message.chat.last_name;
		
		fs.writeFileSync('./private/users.json', JSON.stringify(users, null, '\t'));

		handle(updt.message.text, cid, res);
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
		var contextPath = path.format({
			dir: './data/context',
			base: cid+'.json'
		});

		//create context file if there is none yet
		if (!(fs.readdirSync(path.dirname(contextPath)).indexOf(path.basename(contextPath))+1)){
			fs.writeFileSync(contextPath, JSON.stringify({t:Date.now()}));
		}

		reply = commands[command](msg, cid) || 'x_x';
		
		var context = JSON.parse(fs.readFileSync(contextPath));
		context.command = command;
		fs.writeFileSync(contextPath, JSON.stringify(context));
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

function authorized(command, cid){
	var users = JSON.parse(fs.readFileSync('./private/users.json'));
	if (users[cid].role === 'admin'){return true};
	var permit = users[cid][command];
	if (permit === false){return false};
	var commonCommands = JSON.parse(fs.readFileSync('./private/commonCommands.json'));
	if (command in commonCommands){return true};
	return permit;
};
