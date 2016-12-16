#!/usr/bin/env node

'use strict'

const pkg = require('../package.json')
const argv = require('minimist')(process.argv.slice(2))
const html2pug = require('./index')
const fs = require('fs')
const arrify = require('arrify');

if (argv.f) {
	const files = arrify(argv.f)
	const opts = {
		fragment: !argv.h, // full html
		allowEmptyAttribute: argv.e,
		nSpace: argv.t ? undefined : (argv.n || 2)
	}
	console.log(JSON.stringify(opts));

	files.forEach(file => fs.readFile(file, (err, buf) => {
		if (err) throw new Error(err)

		html2pug(buf.toString(), opts)
			.then(pug => console.log(pug))
			.catch(err => console.log(err.stack))
	}))
}