const { promisify } = require('util');
const { resolve } = require('path');
const { chdir } = require('process');
const fs = require('fs');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const baseDir = "mods";

async function readdirRec(dir, pred) {
	const subdirs = await readdir(dir);
	const files = await Promise.all(subdirs.map(async (subdir) => {
		const res = `${dir}/${subdir}`;
		return (await stat(res)).isDirectory() ? readdirRec(res, pred) : pred(subdir) ? res : null;
	}));
	return files.reduce((a, f) => f ? a.concat(f) : a, []);
}

(async () => {
	chdir(baseDir);
	const dirs = await readdir('.');
	const library = await Promise.all(dirs.map(async dir => ({
		composer: dir,
		songs: (await readdirRec(dir, f => true)).map(file => ({
			file: file.split('/').slice(1).join('/'),
			size: fs.statSync(file).size,
		})),
	})));
	console.log(JSON.stringify(library, null, 2));
})();
