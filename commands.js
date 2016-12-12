//commands.js
var fs = require('fs');
var bcrypt = require('bcrypt');

var commands = {};
commands.echo = echo;
commands.tstp = tstp;
commands.random = random;
commands.commands = listCommands;
commands.source = source;
commands.wrh = transaction;

module.exports = commands;

//////////////////////////

function transaction(msg){
	var trans = {};
	msg = msg.split('\n');
	for (var i=1; i<msg.length; i++){
		let sep = msg[i].indexOf(':');
		trans[msg[i].slice(0, sep)] = msg[i].slice(sep);
	};
	record(trans);
	return 'got it';
}

function record(obj){
	console.log('trying to record');
	var path = './data/record.json';
	var file = JSON.parse(fs.readFileSync(path));
	file[Date.now()] = obj;
	fs.writeFileSync(path, JSON.stringify(file));
	console.log('record successful');
};

function source(){
	return "https://github.com/argentalas/wrhbot";
}

function echo(msg){
	return msg.slice(msg.indexOf(' ')+1);
}

function tstp(msg){
	var t = Math.floor(Date.now()/1000);
	if (msg.slice(msg.indexOf(' ')+1) === '64'){
		return require('./lib/decTo64.js')(t); 
	};
	return t;
}

function random(msg){
	var n = msg.slice(msg.indexOf(' '));
	n = +n || 12;
	return bcrypt.genSaltSync(1).substr(7,n);
}

function listCommands(){
	var r = [];
	for (c in commands){
		r.push(c);
	};
	console.log(commands,'\n',r);
	return r.sort().join('\n');
}
