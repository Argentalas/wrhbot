//commands.js
var fs = require('fs');
//var bcrypt = require('bcrypt');

var paths = {};
paths.record = './data/record.json';
paths.context = './data/context/';

var commands = {};
commands.echo = echo;
commands.tstp = tstp;
//commands.random = random;
commands.commands = listCommands;
commands.source = source;
commands.wrh = transaction;
commands.search = search;
//commands["a b"] = random;

module.exports = commands;

//////////////////////////

function search(msg, cid, field){
	//this function should actually be called smth like "search and how many"; naming is hard
	
	//get context	
	var context = JSON.parse(fs.readFileSync(paths.context + cid + '.json'));
	context.command = 'search';

	//prepare the query
	var temp = msg.split(/\s/);
	temp[1] = temp[1] || context.item;
	if (!temp[1]){return 'search what?'};
	var str = '';
	for (var i = 1; i<temp.length; i++){
		str += `(?=.*${temp[i]})`
	}
	var regex = new RegExp(str+'.*','gi');

	//var sep = msg.indexOf(' ');
	//var query = msg.toLowerCase().slice(sep).trim();
	//if (sep<0){
	//	if (context.item){query = context.item}else {return 'search what?'};
	//};
	
	//perform search and summ
	var trans = JSON.parse(fs.readFileSync(paths.record));
	var result = {};
	for (t in trans){
		var item = trans[t].item || '';
		if (regex.test(item)){
			if (!(item in result)){
				result[item] = 0;
				context.item = item;
			};
			result[item] += +trans[t].amount || 1;
		}
	};
	
	//save context
	fs.writeFile(paths.context + cid + '.json', JSON.stringify(context));

	//format and return reply
	var reply = '';
	for (i in result){
		reply += result[i] + ' x ' + i + '\n\n';
	}
	return reply;
}

function transaction(msg){
	var trans = {};
	msg = msg.toLowerCase().split('\n');

	for (var i=1; i<msg.length; i++){
		var sep = msg[i].indexOf(':');
		if (sep<0){sep = undefined} //if no ':' found - this helps create "text1": "text1" record
		trans[msg[i].slice(0, sep)] = msg[i].slice(sep+1).trim();
	};

	if (Object.keys(trans).length === 0){
		return 'wrh\nitem: <item name>\nid: <item id>\namount: <number>\nplace: <place name> <place id>'
	}else{
		record(trans);
		return 'got it';}
}

function record(obj){
	console.log('trying to record');
	var file = JSON.parse(fs.readFileSync(paths.record));
	file[Date.now()] = obj;
	fs.writeFileSync(paths.record, JSON.stringify(file, null, "\t"));
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

/*
function random(msg){
	var n = msg.slice(msg.indexOf(' '));
	n = +n || 12;
	return bcrypt.genSaltSync(1).substr(7,n);
}
*/

function listCommands(){
	var r = [];
	for (c in commands){
		r.push(c);
	};
	console.log(commands,'\n',r);
	return r.sort().join('\n');
}
