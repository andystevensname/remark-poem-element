import { visit } from 'unist-util-visit';
import { renderPoemElement } from 'poem-element/ssr';

const SLOT_KEYS = new Set(['title', 'author']);

function parseMeta(meta) {
  if (!meta) return { attrs: {}, slots: {} };
  const attrs = {};
  const slots = {};
  for (const token of meta.match(/[\w][\w-]*(?:=(?:"[^"]*"|\S+))?/g) ?? []) {
    const eq = token.indexOf('=');
    if (eq === -1) {
      attrs[token] = '';
    } else {
      const key = token.slice(0, eq);
      const val = token.slice(eq + 1).replace(/^"|"$/g, '');
      if (SLOT_KEYS.has(key)) {
        slots[key] = val;
      } else {
        attrs[key] = val;
      }
    }
  }
  return { attrs, slots };
}

export default function remarkPoemElement() {
  return (tree) => {
    visit(tree, 'code', (node, index, parent) => {
      if (node.lang !== 'poem') return;

      const { attrs, slots } = parseMeta(node.meta);
      let html = renderPoemElement(node.value, attrs, slots);

      let slotHtml = '';
      if (slots.title) slotHtml += `<span slot="title">${slots.title}</span>`;
      if (slots.author) slotHtml += `<span slot="author">${slots.author}</span>`;
      if (slotHtml) {
        html = html.replace('</poem-element>', slotHtml + '</poem-element>');
      }

      parent.children[index] = { type: 'html', value: html };
    });
  };
}
