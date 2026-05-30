import { describe, it, expect, beforeEach } from 'vitest';
import { collectBlocks } from './collectBlocks';

function setBody(html: string) {
  document.body.innerHTML = html;
}

describe('collectBlocks', () => {
  beforeEach(() => setBody(''));

  it('collects paragraph and heading blocks', () => {
    setBody('<h1>Title here friend</h1><p>This is a real sentence of text.</p>');
    const blocks = collectBlocks(document.body, 'zh-CN');
    expect(blocks.map((b) => b.tagName)).toEqual(['H1', 'P']);
  });

  it('skips script, style, code and pre', () => {
    setBody(
      '<p>Translate this please now</p><pre>code()</pre><code>x=1</code><script>var a=1</script>',
    );
    const blocks = collectBlocks(document.body, 'zh-CN');
    expect(blocks.map((b) => b.tagName)).toEqual(['P']);
  });

  it('skips editable controls', () => {
    setBody(
      '<p>Real translatable text content</p><textarea>editable</textarea><div contenteditable="true">edit me</div>',
    );
    const blocks = collectBlocks(document.body, 'zh-CN');
    expect(blocks.map((b) => b.tagName)).toEqual(['P']);
  });

  it('skips whitespace-only and too-short blocks', () => {
    setBody('<p>   </p><p>ok</p><p>This one is long enough to translate.</p>');
    const blocks = collectBlocks(document.body, 'zh-CN');
    expect(blocks).toHaveLength(1);
    expect(blocks[0]!.textContent).toContain('long enough');
  });

  it('skips blocks already in the target language', () => {
    setBody('<p>这是一段已经是中文的内容文字</p><p>This is English content to translate.</p>');
    const blocks = collectBlocks(document.body, 'zh-CN');
    expect(blocks).toHaveLength(1);
    expect(blocks[0]!.textContent).toContain('English');
  });

  it('does not collect a block whose child block is also collected (no nesting double-count)', () => {
    setBody('<div><p>Inner paragraph text content here.</p></div>');
    const blocks = collectBlocks(document.body, 'zh-CN');
    expect(blocks.map((b) => b.tagName)).toEqual(['P']);
  });

  it('collects an ancestor with direct text AND a nested block, not the inner block (no content drop)', () => {
    setBody('<ul><li>Intro text before the nested list<ul><li>Nested item text here</li></ul></li></ul>');
    const blocks = collectBlocks(document.body, 'zh-CN');
    expect(blocks).toHaveLength(1);
    expect(blocks[0]!.textContent).toContain('Intro text before');
  });

  it('still skips a pure container block (no direct text) in favour of its inner block', () => {
    setBody('<blockquote><p>Quoted paragraph text content here.</p></blockquote>');
    const blocks = collectBlocks(document.body, 'zh-CN');
    expect(blocks.map((b) => b.tagName)).toEqual(['P']);
  });

  it('ignores already-injected bilingual nodes', () => {
    setBody('<p>Source paragraph text content here.</p><p class="bt-bilingual">译文</p>');
    const blocks = collectBlocks(document.body, 'zh-CN');
    expect(blocks.map((b) => b.className)).toEqual(['']);
  });

  it('scopes to the main landmark when present', () => {
    setBody('<p id="out">Outside main, should be skipped.</p><main><p id="in">Inside the main region.</p></main>');
    const blocks = collectBlocks(document.body, 'zh-CN');
    expect(blocks.map((b) => b.id)).toEqual(['in']);
  });

  it('skips page chrome when falling back to body (no main)', () => {
    setBody('<header><p>Header tagline text here.</p></header><nav><p>Nav links text here.</p></nav><div><p>Body content paragraph text.</p></div><footer><p>Footer text content here.</p></footer>');
    const blocks = collectBlocks(document.body, 'zh-CN');
    expect(blocks.map((b) => b.textContent)).toEqual(['Body content paragraph text.']);
  });

  it('skips chrome even inside the main landmark', () => {
    setBody('<main><nav><p>In-page TOC nav text.</p></nav><p>Real article body text here.</p></main>');
    const blocks = collectBlocks(document.body, 'zh-CN');
    expect(blocks.map((b) => b.textContent)).toEqual(['Real article body text here.']);
  });
});
