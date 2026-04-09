# remark-poem-element

A [remark](https://github.com/remarkjs/remark) plugin that transforms fenced code blocks tagged `poem` into [`<poem-element>`](https://github.com/andystevensname/poem-element) custom elements with full Declarative Shadow DOM SSR.

## Why

Standard Markdown has no semantic way to express poetry. `<p>` flattens line breaks, `<pre>` is generic preformatted text, and inline HTML is verbose. This plugin lets you write poems in Markdown using the familiar fenced code block syntax — `` ```poem `` — and get a fully semantic, accessible, server-rendered web component in return. If a Markdown processor doesn't have this plugin installed, the content still renders as a normal code block, so the source remains portable.

## Install

```sh
npm install remark-poem-element poem-element
```

`poem-element` and `unist-util-visit` are peer dependencies.

## Usage

```js
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import remarkPoemElement from 'remark-poem-element';

const md = `
\`\`\`poem numbers title="Sonnet 43" author="Elizabeth Barrett Browning"
How do I love thee? Let me count the ways.
I love thee to the depth and breadth and height
\`\`\`
`;

const html = await remark()
  .use(remarkPoemElement)
  .use(remarkHtml, { sanitize: false })
  .process(md);

console.log(String(html));
```

## Syntax

A fenced code block with the `poem` info string becomes a `<poem-element>`. Anything after `poem` on the opening line becomes attributes:

````md
```poem numbers wrap=indent title="Buffalo Bill 's" author="ee cummings"
Buffalo Bill 's
defunct
               who used to
               ride a watersmooth-silver
                                                              stallion
```
````

### Attributes

Any attribute supported by `poem-element` can be passed through. See the [poem-element documentation](https://github.com/andystevensname/poem-element) for the full list. Common ones:

- `numbers` — show line numbers (defaults to every 5th line)
- `wrap` — `true`, `indent`, or `indent-arrow`
- `numbers-layout` — `list` or `grid`
- `numbers-position` — `outside`

Boolean attributes use the bare name (`numbers`); value attributes use `key=value` or `key="value with spaces"`.

### Slots

Two attributes are special-cased as slotted light-DOM content:

- `title` — rendered into the `<slot name="title">`
- `author` — rendered into the `<slot name="author">`

These appear above the poem inside the shadow DOM and can be styled from the host page using `[slot="title"]` and `[slot="author"]` selectors on `poem-element`.

## How it works

The plugin walks the [mdast](https://github.com/syntax-tree/mdast) tree, finds `code` nodes with `lang === 'poem'`, parses the `meta` string into attributes and slots, then calls `renderPoemElement()` from `poem-element/ssr` to produce a complete HTML string with `<template shadowrootmode="open">`. The result is inserted as a raw HTML node, replacing the original code block.

Because the output is Declarative Shadow DOM, the browser parses it into a real shadow root immediately during HTML parsing — no JavaScript required for the initial render. The `<poem-element>` custom element script can be loaded later (or never) and the page will still render correctly.

## License

MIT
