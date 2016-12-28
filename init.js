//init.js
const fs = require('fs');
const https = require('https');
var rerequire = require('./rerequire.js');

const cfgPath = './config.json';
var cfg;
var server;

fs.watch(cfgPath, init);

init();

/////////////////////////////////////////

function init() {
	cfg = JSON.parse(fs.readFileSync(cfgPath));
	if (server) {server.close()};
	var HTTPSOptions = {
		key: fs.readFileSync(cfg.HTTPSOptions.key),
		cert: fs.readFileSync(cfg.HTTPSOptions.cert)
	};
	server = https.createServer(HTTPSOptions, rerequire('./main.js'));
	server.listen(cfg.port, cfg.ip, ()=>{rerequire('./log.js')(
		`${cfg.appName} is listening ${cfg.ip}:${cfg.port}`
	)});
};
