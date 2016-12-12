var https = require('https');
var fs = require('fs');

var rerequire = require('./lib/rerequire.js');

var ip = '94.242.57.37';
var port = 443;

var token = '198223035:AAE4ETs61cZc-WW0Bz8-NhSzDDMwZxTz_wE';

var options = {
	key: fs.readFileSync('./.ssl/wrhbotpriv.key'),
	cert: fs.readFileSync('./.ssl/wrhbotpub.pem')
};

https.createServer(options, (req,res)=>{
	if(req.url === '/Zz'){
		var updt = [];
		var q;
		req.on('data', (chunk)=>{
			updt.push(chunk);
		}).on('end', ()=>{
			updt = JSON.parse(Buffer.concat(updt).toString());
			res.writeHead(200);
			res.end();
			console.log(updt);
			if (!(updt.message && updt.message.text && updt.message.chat.id)){return};
			q = updt.message.text;
			handle(updt.message.text, updt.message.chat.id);
			console.log(q);
		});
	};
	console.log(req.url)

}).listen(port, ip, ()=>{console.log('listening '+ip+':'+port)});

function handle(msg,cid){

	console.log(msg,cid);
	
	var commands = rerequire('../commands.js');
	
	var command = msg.split('\n')[0].split(' ')[0].toLowerCase();
	
	function valid(msg,cid){
		return command in commands;
	};

	function authorized(msg,cid){
		return true;
	};

	function reply(msg,cid){
		if(!valid(msg,cid)){
			return '\ntype "commands" for command list';
		}else if(!authorized(msg,cid)){
			return 'You require security clearence level 3';
		}else{
			return commands[command](msg) || 'X_X';	
		}
	};

	var postData = JSON.stringify({
		chat_id: cid,
		text: reply(msg,cid) 
	});

	console.log(postData);

	var options = {
		hostname: 'api.telegram.org',
		port: 443,
		path: '/bot'+token+'/sendmessage',
		method: 'POST',
		headers:{
			'Content-Type':'application/json',
			'Content-Length':postData.length
		}
	};

	var req = https.request(options, (res)=>{
		var message = [];
		console.log(`status: ${res.statusCode}`);
		res.on('data',(chunk)=>{message.push(chunk)});
		res.on('end', ()=>{
			message = JSON.parse(Buffer.concat(message).toString());
			console.log(message);
		});
	});

	req.write(postData);
	req.end();
};
