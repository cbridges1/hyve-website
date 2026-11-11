#!/usr/bin/env node
// Generates the CLI reference (src/content/docs/docs/cli/*.mdx) from a hyve
// binary's own --help, one page per top-level command, so the reference is
// whatever the binary says. Re-run it after a release:
//
//   node scripts/gen-cli.mjs /path/to/hyve
//
// It runs the binary with HOME and HYVE_HOME pointed at a temporary
// directory, so it never reads or writes your own ~/.hyve.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const bin = process.argv[2];
if (!bin) {
  console.error('usage: node scripts/gen-cli.mjs /path/to/hyve');
  process.exit(2);
}
const out = new URL('../src/content/docs/docs/cli/', import.meta.url).pathname;
const home = mkdtempSync(join(tmpdir(), 'hyve-gen-cli-'));
const env = { ...process.env, HOME: home, HYVE_HOME: join(home, '.hyve') };

function help(path) {
  return execFileSync(bin, [...path, '--help'], { env, encoding: 'utf8' });
}

// Splits cobra's help into its description and named sections.
function parse(text) {
  const lines = text.replace(/\s+$/, '').split('\n');
  const sections = {};
  const description = [];
  let current = null;
  for (const line of lines) {
    const m = /^([A-Z][A-Za-z ]+):$/.exec(line);
    if (m) {
      current = m[1];
      sections[current] = [];
    } else if (current) {
      sections[current].push(line);
    } else {
      description.push(line);
    }
  }
  const trim = (ls) => ls.join('\n').replace(/^\n+|\n+$/g, '');
  const result = { description: trim(description) };
  for (const [k, v] of Object.entries(sections)) result[k] = trim(v);
  return result;
}

function subcommands(sections) {
  return (sections['Available Commands'] || '')
    .split('\n')
    .map((l) => l.trim().split(/\s+/)[0])
    .filter((name) => name && name !== 'help' && name !== 'completion');
}

// Prose goes through MDX, which would read <url> as JSX and {x} as an
// expression.
function prose(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;');
}

// Cobra descriptions mix prose with indented examples; the indented runs
// become code blocks, the rest prose.
function description(text) {
  const out = [];
  let block = null;
  for (const line of text.split('\n')) {
    if (/^\s{2,}\S/.test(line)) {
      (block ??= []).push(line);
      continue;
    }
    if (block) {
      out.push(code(block.join('\n')).trimEnd());
      block = null;
    }
    out.push(prose(line));
  }
  if (block) out.push(code(block.join('\n')).trimEnd());
  return out.join('\n').replace(/\n{3,}/g, '\n\n');
}

function code(text) {
  return '```text\n' + text + '\n```\n';
}

function section(path, depth) {
  const s = parse(help(path));
  const name = ['hyve', ...path].join(' ');
  let md = `${'#'.repeat(depth)} ${name}\n\n`;
  if (s.description) md += description(s.description) + '\n\n';
  if (s.Usage) md += code(s.Usage);
  if (s.Aliases) md += `\nAliases: \`${s.Aliases.trim()}\`\n`;
  if (s.Examples) md += '\n**Examples**\n\n' + code(s.Examples);
  if (s.Flags) md += '\n**Flags**\n\n' + code(s.Flags);
  md += '\n';
  for (const sub of subcommands(s)) md += section([...path, sub], Math.min(depth + 1, 4));
  return md;
}

const root = parse(help([]));
// The root's help lists its commands in groups (Clusters, Delivering to
// clusters...): every section that isn't one of cobra's own.
const NOT_GROUPS = new Set(['Usage', 'Flags', 'Global Flags', 'Examples', 'Aliases', 'Additional Commands', 'Available Commands']);
const groups = Object.entries(root)
  .filter(([k]) => k !== 'description' && !NOT_GROUPS.has(k))
  .map(([title, text]) => ({
    title,
    commands: text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const [name, ...rest] = l.split(/\s+/);
        return { name, summary: rest.join(' ') };
      }),
  }));
if (root['Available Commands']) groups.push({ title: 'Commands', commands: subcommands(root).map((name) => ({ name, summary: '' })) });
const top = groups.flatMap((g) => g.commands.map((c) => c.name)).filter((n) => n !== 'help' && n !== 'completion');
const summaries = Object.fromEntries(groups.flatMap((g) => g.commands.map((c) => [c.name, c.summary])));

mkdirSync(out, { recursive: true });
for (const f of readdirSync(out)) if (f.endsWith('.mdx')) rmSync(join(out, f));

const global = parse(help(['cluster'])); // any command shows the global flags
writeFileSync(
  join(out, 'index.mdx'),
  `---
title: CLI reference
description: Every hyve command, generated from the binary's own help.
sidebar:
  order: 0
  label: Overview
---

Generated from \`hyve --help\` by \`scripts/gen-cli.mjs\`. Each command's own \`--help\` says the same.

${description(root.description)}

${groups
  .map(
    (g) => `## ${g.title}

| Command | What it does |
|---|---|
${g.commands
  .filter((c) => top.includes(c.name))
  .map((c) => `| [\`${c.name}\`](/docs/cli/${c.name}) | ${prose(c.summary)} |`)
  .join('\n')}`,
  )
  .join('\n\n')}

## Flags on every command

${code(global['Global Flags'] || root.Flags)}`,
);

top.forEach((c, i) => {
  const md = section([c], 2);
  writeFileSync(
    join(out, `${c}.mdx`),
    `---
title: hyve ${c}
description: ${JSON.stringify(summaries[c] || `hyve ${c}`)}
sidebar:
  order: ${i + 1}
  label: ${c}
---

{/* Generated by scripts/gen-cli.mjs from hyve --help. Don't edit by hand. */}

${md.replace(/^## hyve [^\n]+\n\n/, '')}`,
  );
});

rmSync(home, { recursive: true, force: true });
console.log(`wrote ${top.length + 1} pages to ${out}`);
