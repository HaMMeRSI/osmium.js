#!/usr/bin/env node
import { parseRootDocument } from './src/compiler/osim-file-parser';
import { emitJsFiles } from './src/compiler/js/emit-js';
import * as fs from 'fs';
import * as path from 'path';
const argv = require('yargs')
	.alias('i', 'index')
	.alias('o', 'output')
	.alias('b', 'base').argv;

const relativeIndexPath = argv.index;
const base = argv.base || process.cwd();
const fullPath = path.resolve(`${base}/${relativeIndexPath}`);
const osimComponent = fs.readFileSync(fullPath).toString();

const osimOutputPath = path.resolve(base, argv.output);
if (!fs.existsSync(osimOutputPath)) {
	fs.mkdirSync(osimOutputPath);
}

emitJsFiles(parseRootDocument(osimComponent, fullPath), osimOutputPath);
