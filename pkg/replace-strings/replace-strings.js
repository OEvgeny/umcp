#!/usr/bin/env node
import process from 'node:process';
import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice();

const replacements = [];
while (args.length) {
  if (args.at(-1) === '--') {
    args.pop(); // remove delimiter
    break;
  }

  const raw = args.pop();
  const entry = raw.split(':');

  if (entry.length !== 2) {
    throw new Error(`Malformed entry ${raw}`);
  }

  replacements.push(entry);
}

const fileName = args.pop();

if (!fileName || !args.length) {
  throw new Error('usage: node replace-strings.js filename -- str1:str2');
}

if (!replacements.length) {
  throw new Error('Nothing to replace');
}

let contents = readFileSync(fileName, 'utf8');

for (const entry of replacements) {
  contents = contents.replaceAll(...entry);
}

writeFileSync(fileName, contents, 'utf8');
