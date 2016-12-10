//devTo64.js

module.exports = decTo64;

/////////////////////////

function decTo64(inp){

	//convert to number
	var dec = +inp;

	//check input is integer (boolean accepted, interpreted as 1 and 0)
	if (!((dec % 1) === 0)) {console.log('Invalid input "' + inp + '", integer expected'); return 'integer expected'};
	
	var result=[];

	const digits = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@!';

	//deal with sign - strip for now and attach later
	if (dec<0) {
		var sign = '-';
		dec *= -1;
	} else {
		sign = '';
	};

	//create string with binary representation of input value
	var binString = dec.toString(2);

	//zeropad
	binString = '0'.repeat(6 - (binString.length % 6))+ binString;

	//note i+=6
	for (var i = 0; i < binString.length; i+=6) {
		result.push(digits[parseInt(binString.substr(i, 6), 2)]);
	};

	return sign + result.join('');
}

//console.log(decTo64(process.argv[2] || Math.floor(Date.now()/1000)));

//test
// console.log(
// 	decTo64(0),
// 	decTo64(1),
// 	decTo64(-8),
// 	decTo64(10),
// 	decTo64(-28234321),
// 	decTo64(Math.floor(Date.now()/1000)),
// 	decTo64(15.6),
// 	decTo64('qweqw'),
// 	decTo64(true),
// 	decTo64(false)
// );
