//rerequire.js
module.exports = rerequire;

function rerequire(modname) {

	// require() caches and never invalidates, hence this function.
	// Using on native addons will result in an Error. https://nodejs.org/dist/latest-v4.x/docs/api/globals.html#globals_require_cache
	// It is absolutely fine to require smth for the first time with this function.
	// Keep in mind, there is a syncronous file system read under the hood.

	delete require.cache[require.resolve(modname)];
	return require(modname);
};

