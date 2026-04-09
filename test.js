import { test } from 'node:test';
import assert from 'node:assert/strict';
import { remark } from 'remark';
import remarkPoemElement from './index.js';

async function process(md) {
  const tree = remark().use(remarkPoemElement).parse(md);
  remark().use(remarkPoemElement).runSync(tree);
  return tree;
}

test('transforms ```poem fenced block into <poem-element>', async () => {
  const tree = await process('```poem\nLine one\nLine two\n```');
  const node = tree.children[0];
  assert.equal(node.type, 'html');
  assert.match(node.value, /^<poem-element/);
  assert.match(node.value, /shadowrootmode="open"/);
  assert.match(node.value, /Line one/);
});

test('passes attributes through to the element', async () => {
  const tree = await process('```poem numbers\nLine one\n```');
  assert.match(tree.children[0].value, /<poem-element numbers/);
});

test('hyphenated attributes work', async () => {
  const tree = await process('```poem numbers numbers-position=outside\nLine one\n```');
  assert.match(tree.children[0].value, /numbers-position="outside"/);
});

test('quoted attribute values preserve spaces', async () => {
  const tree = await process('```poem title="Buffalo Bill" author="ee cummings"\nLine\n```');
  const html = tree.children[0].value;
  assert.match(html, /<span slot="title">Buffalo Bill<\/span>/);
  assert.match(html, /<span slot="author">ee cummings<\/span>/);
});

test('non-poem code blocks are left alone', async () => {
  const tree = await process('```js\nconsole.log("hi")\n```');
  assert.equal(tree.children[0].type, 'code');
  assert.equal(tree.children[0].lang, 'js');
});
