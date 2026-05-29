import { describe, it, expect } from 'vitest';
import { parseDictionaryEntry } from './parse';

const full = JSON.stringify({
  headword: 'serendipity',
  phonetic: { us: '/ˌsɛrənˈdɪpɪti/', uk: '/ˌsɛrənˈdɪpɪti/' },
  partOfSpeech: '名词',
  senses: ['意外发现美好事物的能力或现象。', '机缘巧合。'],
  example: { source: 'Finding that book was pure serendipity.', target: '找到那本书纯属机缘巧合。' },
});

describe('parseDictionaryEntry', () => {
  it('parses a complete entry with US/UK phonetics', () => {
    const e = parseDictionaryEntry(full);
    expect(e).not.toBeNull();
    expect(e!.headword).toBe('serendipity');
    expect(e!.phonetic).toEqual({ us: '/ˌsɛrənˈdɪpɪti/', uk: '/ˌsɛrənˈdɪpɪti/' });
    expect(e!.partOfSpeech).toBe('名词');
    expect(e!.senses).toEqual(['意外发现美好事物的能力或现象。', '机缘巧合。']);
    expect(e!.example).toEqual({ source: 'Finding that book was pure serendipity.', target: '找到那本书纯属机缘巧合。' });
  });

  it('strips ```json code fences', () => {
    const fenced = '```json\n' + full + '\n```';
    expect(parseDictionaryEntry(fenced)?.headword).toBe('serendipity');
  });

  it('keeps only the variants present (e.g. US only)', () => {
    const e = parseDictionaryEntry(JSON.stringify({ headword: 'color', phonetic: { us: '/ˈkʌlər/', uk: '' }, senses: ['颜色'], example: null }));
    expect(e!.phonetic).toEqual({ us: '/ˈkʌlər/' });
  });

  it('treats a null/empty phonetic as absent (phrases & CJK get no phonetic)', () => {
    const e = parseDictionaryEntry(JSON.stringify({ headword: '模块', phonetic: null, partOfSpeech: '名词', senses: ['标准化的可组合单元。'], example: null }));
    expect(e).not.toBeNull();
    expect(e!.phonetic).toBeUndefined();
    expect(e!.example).toBeUndefined();
    const phrase = parseDictionaryEntry(JSON.stringify({ headword: 'machine learning', phonetic: { us: '', uk: '' }, senses: ['机器学习'], example: null }));
    expect(phrase!.phonetic).toBeUndefined();
  });

  it('accepts a proper noun with a single gloss and no part of speech', () => {
    const e = parseDictionaryEntry(JSON.stringify({ headword: 'NASA', phonetic: '', partOfSpeech: '', senses: ['美国国家航空航天局。'], example: null }));
    expect(e).not.toBeNull();
    expect(e!.partOfSpeech).toBeUndefined();
    expect(e!.senses).toHaveLength(1);
  });

  it('returns null for non-JSON text', () => {
    expect(parseDictionaryEntry('模块: a standard unit')).toBeNull();
    expect(parseDictionaryEntry('')).toBeNull();
  });

  it('returns null when headword is missing', () => {
    expect(parseDictionaryEntry(JSON.stringify({ senses: ['x'] }))).toBeNull();
  });

  it('returns null when there are no senses and no example (too thin to render)', () => {
    expect(parseDictionaryEntry(JSON.stringify({ headword: 'x', senses: [], example: null }))).toBeNull();
  });

  it('drops blank senses', () => {
    const e = parseDictionaryEntry(JSON.stringify({ headword: 'x', senses: ['real', '', '  '], example: null }));
    expect(e!.senses).toEqual(['real']);
  });
});
