//commands.js

var bcrypt = require('bcrypt');
var commands={};

commands.echo = echo;
commands.tstp = tstp;
commands.random = random;
commands.commands = listCommands;

module.exports = commands;

//////////////////////////

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
	var r = '';
	for (c in commands){
		r += c+'\n';
	};
	console.log(commands,'\n',r);
	return r;
}
