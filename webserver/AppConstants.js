/**
 * True if dev environment
 * @type {boolean}
 */
exports.debug = process.argv[2] === "-devenv";
/**
 * True if build environment
 * @type {boolean}
 */
exports.build = !exports.debug;
