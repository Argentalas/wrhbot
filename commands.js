//commands.js
var fs = require('fs');
var crypto = require('crypto');
var log = require('./log.js');

RegExp.escape = function(text) {
	  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

var paths = {};
paths.record = './data/record.json';
paths.context = './data/context/';

var commands = {};
commands.echo = echo;
commands.tstp = tstp;
commands.random = random;
commands.commands = listCommands;
commands.source = source;
commands.wrh = transaction;
commands.search = search;
commands.where = where;
//commands["a b"] = random;

module.exports = commands;

//////////////////////////

function where(msg, cid){

	//get context	
	var context = JSON.parse(fs.readFileSync(paths.context + cid + '.json'));
	//log(1, context.item);

	//prepare the query
	var query = msg.split(/\s/);
	query[1] = query[1] || context.item;
	//log(2, query);
	if (!query[1]){return 'where what?'};
	var str = '';
	for (var i = 1; i<query.length; i++){
		str += `(?=.*${query[i]})`
	}
	str = RegExp.escape(str);
	try{
		var regex = new RegExp(str+'.*','i');
	}catch(e){
		regex = new RegExp('','i');
	}
	//perform search
	var trans = JSON.parse(fs.readFileSync(paths.record));
	var result = {};
	for (t in trans){
		var id = trans[t].id || '';
		var item = trans[t].item || '';
		var place = trans[t].place || 'unknown';
		//log(3, item);
		item = (item + ' ' + id).trim();
		//log(4, item);
		if (regex.test(item)){
			if (!(place in result)){
				result[place] = 0;
				context.item = item;
				regex = new RegExp(trans[t].item, 'i');
			};
			result[place] += +trans[t].amount || 1;
		};
		//log(5, context.item);
	};

	//save context
	fs.writeFileSync(paths.context + cid + '.json', JSON.stringify(context));

	//format and return reply
	var reply = context.item + '\n';
	for (p in result){
		if (result[p] === 0){continue};
		if (result[p] === 1){
			reply += `${p} (1 item)\n\n`

		}else{
			reply += `${p} (${result[p]} items)\n\n`
		};
	}
	if (reply === context.item + '\n'){
		reply = "we don't have " + reply;
	};
	return reply;
}

function search(msg, cid, field){
	//this function should actually be called smth like "search and how many"; naming is hard
	
	//get context	
	var context = JSON.parse(fs.readFileSync(paths.context + cid + '.json'));

	//prepare the query
	var query = msg.split(/\s/);
	query[1] = query[1] || context.item;
	if (!query[1]){return 'search what?'};
	var str = '';
	for (var i = 1; i<query.length; i++){
		str += `(?=.*${query[i]})`
	}
	str = RegExp.escape(str);
	try{
		var regex = new RegExp(str+'.*','i');
	}catch(e){
		regex = new RegExp('','i');
	}

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
	fs.writeFileSync(paths.context + cid + '.json', JSON.stringify(context));

	//format and return reply
	var reply = '';
	for (i in result){
		reply += result[i] + ' x ' + i + '\n\n';
	}
	return reply;
}

function transaction(msg, cid){
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
		record(trans, cid);
		return 'got it';}
}

function record(obj, cid){
	console.log('trying to record');
	obj.cid = cid;
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

function random(msg){
	var n = msg.slice(msg.indexOf(' '));
	n = +n || 12;
	return crypto.randomBytes(51).toString('base64').match(/[a-zA-Z0-9]+/gi).join('').substr(0,n);
}

function listCommands(){
	var r = [];
	for (c in commands){
		r.push(c);
	};
//	console.log(commands,'\n',r);
	return r.sort().join('\n');
}
