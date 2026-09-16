import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = 'src';
const categories = [
  ['Layout', new Set(['position', 'top', 'right', 'bottom', 'left', 'inset', 'z-index', 'display', 'flex', 'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink', 'flex-basis', 'grid', 'grid-template-columns', 'grid-template-rows', 'grid-column', 'grid-row', 'justify-content', 'align-content', 'align-items', 'align-self', 'order', 'gap', 'row-gap', 'column-gap', 'overflow', 'overflow-x', 'overflow-y', 'list-style'])],
  ['Tamanho', new Set(['width', 'min-width', 'max-width', 'height', 'min-height', 'max-height', 'aspect-ratio', 'object-fit', 'box-sizing', 'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left'])],
  ['Aparência', new Set(['background', 'background-color', 'background-image', 'border', 'border-top', 'border-right', 'border-bottom', 'border-left', 'border-width', 'border-style', 'border-color', 'border-radius', 'opacity', 'outline', 'outline-offset', 'box-shadow', 'content'])],
  ['Texto', new Set(['font', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'color', 'text-align', 'text-decoration', 'text-overflow', 'text-transform', 'white-space', 'vertical-align', 'word-break'])],
  ['Efeitos', new Set(['transition', 'transform', 'animation', 'cursor', 'visibility', 'filter', 'scrollbar-width', 'scrollbar-color'])],
];

const files = [];
function collect(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) collect(path);
    else if (/\.(css|scss|sass|less)$/.test(entry)) files.push(path);
  }
}
collect(root);

function category(property) {
  for (let i = 0; i < categories.length; i += 1) {
    if (categories[i][1].has(property)) return i;
  }
  return categories.length;
}

function formatBlock(body) {
  const lines = body.split('\n');
  const declarations = [];
  let prefix = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('/*') || trimmed.startsWith('//')) {
      prefix.push(line);
      continue;
    }
    const match = trimmed.match(/^([\w-]+)\s*:/);
    if (!match || !trimmed.endsWith(';')) return body;
    declarations.push({ property: match[1], line: line.trim(), prefix });
    prefix = [];
  }
  if (!declarations.length || prefix.length || declarations.every(({ property }) => property.startsWith('--'))) return body;
  declarations.sort((a, b) => category(a.property) - category(b.property));
  const output = [];
  let current = -1;
  for (const declaration of declarations) {
    const index = category(declaration.property);
    if (index !== current) {
      current = index;
      output.push(`    /* ${categories[index]?.[0] ?? 'Outros'} */`);
    }
    output.push(`    ${declaration.line}`);
  }
  return `\n${output.join('\n')}\n`;
}

function process(css) {
  let result = '';
  let cursor = 0;
  while (cursor < css.length) {
    const open = css.indexOf('{', cursor);
    if (open === -1) { result += css.slice(cursor); break; }
    result += css.slice(cursor, open + 1);
    let depth = 1;
    let close = open + 1;
    while (close < css.length && depth) {
      if (css[close] === '{') depth += 1;
      if (css[close] === '}') depth -= 1;
      close += 1;
    }
    const body = css.slice(open + 1, close - 1);
    const nestedBody = process(body);
    result += nestedBody.includes('{') ? nestedBody : formatBlock(nestedBody);
    result += '}';
    cursor = close;
  }
  return result;
}

for (const file of files) {
  const original = readFileSync(file, 'utf8');
  const updated = process(original);
  if (updated !== original) writeFileSync(file, updated);
}
