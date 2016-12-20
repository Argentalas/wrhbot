//init.js
const fs = require('fs');
const https = require('https');

const cfgPath = 'config.json';
var cfg = JSON.parse(fs.readFileSync(cfgPath));
const server = https.createServer(cfg.HTTPSOptions, handler);

fs.watch(cfgPath, init);

init();

/////////////////////////////////////////

function init(){
	
};
