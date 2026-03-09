#!/usr/bin/env node
import process from 'node:process';
import { existsSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const argv = process.argv.slice(2);

if (argv.length !== 2) {
  throw new Error('usage: node zod-to-json.js <input> <output>');
}

const [input, output] = argv;

console.log(input, '->', output);

if (existsSync(output)) {
  throw new Error(`Out file already exists: ${output}`);
}

const TO_JSON_OPTIONS = {
  // reused: 'ref',
  // cycles: 'ref',
};

async function importModule(specifier) {
  try {
    return await import(specifier);
  } catch (error) {
    if (
      !specifier.startsWith('.') &&
      !specifier.startsWith('/') &&
      !specifier.startsWith('file:')
    ) {
      throw error;
    }
    return await import(
      pathToFileURL(path.resolve(process.cwd(), specifier)).href
    );
  }
}

async function importReplacements(specifier) {
  try {
    return await import(
      new URL(`./replacements/${specifier}`, import.meta.url)
    );
  } catch (error) {
    if (error?.code !== 'ERR_MODULE_NOT_FOUND') throw error;
    return null;
  }
}

function deepClone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function stable(value) {
  if (Array.isArray(value)) {
    return value.map(stable);
  }
  if (isPlainObject(value)) {
    const out = {};
    for (const key of Object.keys(value).sort()) {
      out[key] = stable(value[key]);
    }
    return out;
  }
  return value;
}

function stableKey(value) {
  return JSON.stringify(stable(value));
}

function stripTopLevelMeta(schema) {
  const copy = deepClone(schema);
  delete copy.$schema;
  return copy;
}

function isLocalDefsRef(node) {
  return (
    isPlainObject(node) &&
    Object.keys(node).length === 1 &&
    typeof node.$ref === 'string' &&
    node.$ref.startsWith('#/$defs/')
  );
}

function getLocalDef(root, ref) {
  const name = ref.slice('#/$defs/'.length);
  return root?.$defs?.[name];
}

// Resolve local #/$defs refs before hashing/comparing.
function normalizeForHash(node, root, seen = new Set()) {
  if (Array.isArray(node)) {
    return node.map((item) => normalizeForHash(item, root, seen));
  }

  if (!isPlainObject(node)) {
    return node;
  }

  if (isLocalDefsRef(node)) {
    const ref = node.$ref;

    if (seen.has(ref)) {
      return { $recursiveLocalRef: ref };
    }

    const target = getLocalDef(root, ref);
    if (!target) {
      return node;
    }

    const nextSeen = new Set(seen);
    nextSeen.add(ref);
    return normalizeForHash(target, root, nextSeen);
  }

  const out = {};
  for (const key of Object.keys(node).sort()) {
    if (key === '$schema' || key === '$id' || key === '$defs') continue;
    out[key] = normalizeForHash(node[key], root, seen);
  }
  return out;
}

// Only share meaningful structured roots.
// This prevents trivial aliases like CursorSchema from infecting everything.
function isShareableRoot(schema) {
  if (!isPlainObject(schema)) return false;

  if (schema.anyOf || schema.oneOf || schema.allOf) return true;
  if (schema.type === 'object' && isPlainObject(schema.properties)) return true;
  if (
    schema.type === 'array' &&
    schema.items &&
    (isPlainObject(schema.items) || Array.isArray(schema.items))
  ) {
    return true;
  }

  return false;
}

function collectLocalRefs(node, refs = new Set()) {
  if (Array.isArray(node)) {
    for (const item of node) collectLocalRefs(item, refs);
    return refs;
  }

  if (!isPlainObject(node)) {
    return refs;
  }

  if (node.__sharedSchemaRef) {
    return refs;
  }

  if (isLocalDefsRef(node)) {
    refs.add(node.$ref.slice('#/$defs/'.length));
    return refs;
  }

  for (const value of Object.values(node)) {
    collectLocalRefs(value, refs);
  }

  return refs;
}

function pruneUnusedDefs(schema) {
  if (!isPlainObject(schema) || !isPlainObject(schema.$defs)) {
    return schema;
  }

  const copy = deepClone(schema);
  const used = collectLocalRefs(copy);

  copy.$defs = Object.fromEntries(
    Object.entries(copy.$defs).filter(([name]) => used.has(name))
  );

  if (!Object.keys(copy.$defs).length) {
    delete copy.$defs;
  }

  return copy;
}

function sharedRef(name) {
  return { __sharedSchemaRef: name };
}

function isSharedRef(node) {
  return isPlainObject(node) && typeof node.__sharedSchemaRef === 'string';
}

// Replace matching subtrees with references to other exported schema variables.
function rewriteShared(
  node,
  rootName,
  rootSchema,
  rootHashes,
  canonicalRootByName,
  isRoot = false
) {
  if (Array.isArray(node)) {
    return node.map((item) =>
      rewriteShared(
        item,
        rootName,
        rootSchema,
        rootHashes,
        canonicalRootByName,
        false
      )
    );
  }

  if (!isPlainObject(node)) {
    return node;
  }

  if (!isRoot) {
    const hash = stableKey(normalizeForHash(node, rootSchema));
    const match = rootHashes.get(hash);

    if (match) {
      const targetCanonical = canonicalRootByName[match];
      const currentCanonical = canonicalRootByName[rootName];

      if (targetCanonical && targetCanonical !== currentCanonical) {
        return sharedRef(targetCanonical);
      }
    }
  }

  const out = {};
  for (const [key, value] of Object.entries(node)) {
    out[key] = rewriteShared(
      value,
      rootName,
      rootSchema,
      rootHashes,
      canonicalRootByName,
      false
    );
  }
  return out;
}

function collectSharedSchemaDeps(node, deps = new Set()) {
  if (Array.isArray(node)) {
    for (const item of node) collectSharedSchemaDeps(item, deps);
    return deps;
  }

  if (!isPlainObject(node)) {
    return deps;
  }

  if (isSharedRef(node)) {
    deps.add(node.__sharedSchemaRef);
    return deps;
  }

  for (const value of Object.values(node)) {
    collectSharedSchemaDeps(value, deps);
  }

  return deps;
}

function topoSort(names, depsByName) {
  const visiting = new Set();
  const visited = new Set();
  const result = [];

  function visit(name, trail = []) {
    if (visited.has(name)) return;
    if (visiting.has(name)) {
      throw new Error(
        `Cyclic shared schema dependency detected: ${[...trail, name].join(
          ' -> '
        )}`
      );
    }

    visiting.add(name);

    const deps = [...(depsByName.get(name) ?? [])].sort();
    for (const dep of deps) {
      visit(dep, [...trail, name]);
    }

    visiting.delete(name);
    visited.add(name);
    result.push(name);
  }

  for (const name of [...names].sort()) {
    visit(name);
  }

  return result;
}

function isValidIdentifier(name) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name);
}

function quoteKey(key) {
  return isValidIdentifier(key) ? key : JSON.stringify(key);
}

function emitJsExpr(value, jsonVarByCanonicalName) {
  if (isSharedRef(value)) {
    return jsonVarByCanonicalName[value.__sharedSchemaRef];
  }

  if (Array.isArray(value)) {
    return `[${value
      .map((item) => emitJsExpr(item, jsonVarByCanonicalName))
      .join(', ')}]`;
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value).map(
      ([key, v]) => `${quoteKey(key)}: ${emitJsExpr(v, jsonVarByCanonicalName)}`
    );
    return `{${entries.join(', ')}}`;
  }

  return JSON.stringify(value);
}

function emitConst(name, value) {
  if (typeof value === 'function') {
    return `export const ${name} = ${value.toString()}\n\n`;
  }
  return `export const ${name} = ${JSON.stringify(value)};\n\n`;
}

const mod = await importModule(input);
if (!mod) {
  throw new Error(`Failed to load module ${input}`);
}

const replacements = await importReplacements(input);

const result = {
  exports: [],
  schemas: {},
  needs: [],
};

// Convert roots
for (const [name, value] of Object.entries(mod)) {
  if (!name.endsWith('Schema')) {
    result.exports.push(name);
    continue;
  }

  try {
    const schema = replacements?.[name]
      ? replacements[name].toJSONSchema(TO_JSON_OPTIONS)
      : value.toJSONSchema(TO_JSON_OPTIONS);

    result.schemas[name] = stripTopLevelMeta(schema);
  } catch {
    result.needs.push(name);
  }
}

if (result.needs.length) {
  throw new Error(
    `Not all module specifiers can be converted: ${result.needs.join(
      ', '
    )} are missing`
  );
}

const schemaNames = Object.keys(result.schemas).sort();

// Group shareable roots by semantic hash.
const namesByHash = new Map();

for (const name of schemaNames) {
  const schema = result.schemas[name];
  if (!isShareableRoot(schema)) continue;

  const hash = stableKey(normalizeForHash(schema, schema));
  const names = namesByHash.get(hash) ?? [];
  names.push(name);
  namesByHash.set(hash, names);
}

// Pick a canonical root for each identical group.
const canonicalRootByName = {};
const rootHashes = new Map();

for (const [hash, names] of namesByHash.entries()) {
  names.sort();
  const canonical = names[0];
  rootHashes.set(hash, canonical);

  for (const name of names) {
    canonicalRootByName[name] = canonical;
  }
}

for (const name of schemaNames) {
  canonicalRootByName[name] ??= name;
}

const canonicalNames = [...new Set(Object.values(canonicalRootByName))].sort();

// Rewrite each canonical schema to contain shared variable refs.
const rewrittenCanonicalSchemas = {};
for (const canonicalName of canonicalNames) {
  const original = result.schemas[canonicalName];
  const rewritten = rewriteShared(
    original,
    canonicalName,
    original,
    rootHashes,
    canonicalRootByName,
    true
  );
  rewrittenCanonicalSchemas[canonicalName] = pruneUnusedDefs(rewritten);
}

// Determine canonical dependency order.
const depsByCanonicalName = new Map();
for (const canonicalName of canonicalNames) {
  const deps = collectSharedSchemaDeps(
    rewrittenCanonicalSchemas[canonicalName]
  );
  deps.delete(canonicalName);
  depsByCanonicalName.set(canonicalName, deps);
}

const orderedCanonicalNames = topoSort(canonicalNames, depsByCanonicalName);

const jsonVarByCanonicalName = Object.fromEntries(
  canonicalNames.map((name) => [name, `${name}JSON`])
);

// Emit
let code = '';
// code += 'import { fromJSONSchema } from "./zod-from-json.js";\n\n';

// Plain exports
for (const [name, value] of Object.entries(mod)) {
  if (!result.exports.includes(name)) continue;
  code += emitConst(name, value);
}

// Canonical schema JSON objects in dependency order.
for (const canonicalName of orderedCanonicalNames) {
  const expr = emitJsExpr(
    rewrittenCanonicalSchemas[canonicalName],
    jsonVarByCanonicalName
  );
  code += `export const ${jsonVarByCanonicalName[canonicalName]} = ${expr};\n\n`;
}

// Alias duplicate roots to the same JSON object.
for (const name of schemaNames) {
  const canonicalName = canonicalRootByName[name];
  if (name === canonicalName) continue;

  code += `export const ${name}JSON = ${jsonVarByCanonicalName[canonicalName]};\n\n`;
}

// // Build zod schemas.
// for (const name of schemaNames) {
//   code += `export const ${name} = fromJSONSchema(${name}JSON);\n\n`;
// }

writeFileSync(output, code);
