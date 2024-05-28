// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.

import { TSDocParser } from '../TSDocParser';
import { Tokenizer } from '../Tokenizer';
import { type Token, TokenKind } from '../Token';
import { TestHelpers } from './TestHelpers';
import type { ParserContext } from '../ParserContext';

interface ISnapshotItem {
  indexOfLine: number;
  line: string;
  span: string;
  tokenKind: string;
}

function matchSnapshot(buffer: string): void {
  const tsdocParser: TSDocParser = new TSDocParser();
  const parserContext: ParserContext = tsdocParser.parseString(buffer);
  const tokens: Token[] = parserContext.tokens;

  const items: ISnapshotItem[] = [];

  for (const token of tokens) {
    items.push({
      indexOfLine: parserContext.lines.indexOf(token.line),
      line: '>' + TestHelpers.getEscaped(token.line.toString()) + '<',
      span: TestHelpers.formatLineSpan(token.line, token.range),
      tokenKind: TokenKind[token.kind]
    });

    if (token.kind === TokenKind.EndOfInput) {
      break;
    }
  }

  expect({
    buffer: TestHelpers.getEscaped(buffer),
    tokens: items
  }).toMatchSnapshot();
}

test('Tokenizer.isPunctuation()', () => {
  expect(Tokenizer.isPunctuation(TokenKind.OtherPunctuation)).toEqual(true);
  expect(Tokenizer.isPunctuation(TokenKind.DoubleQuote)).toEqual(true);
  expect(Tokenizer.isPunctuation(TokenKind.Slash)).toEqual(true);

  expect(Tokenizer.isPunctuation(TokenKind.EndOfInput)).toEqual(false);
  expect(Tokenizer.isPunctuation(TokenKind.Spacing)).toEqual(false);
  expect(Tokenizer.isPunctuation(TokenKind.AsciiWord)).toEqual(false);
});

test('00 Tokenizer simple case', () => {
  matchSnapshot(
    [
      '/**',
      ' * line 1 ', // extra space at end of line
      ' * line 2',
      ' */'
    ].join('\n')
  );
});

test('01 Tokenizer degenerate cases', () => {
  matchSnapshot('/***/');

  matchSnapshot(['/**', ' *', ' */'].join('\n'));

  matchSnapshot(['/**', ' ', ' ', ' */'].join('\n'));
});

test('02 Backslash escapes: positive examples', () => {
  matchSnapshot(['/**', ' * \\$\\@param', ' * double-backslash: \\\\', ' */'].join('\n'));
});

test('03 Backslash escapes: negative examples', () => {
  matchSnapshot(['/**', ' * letter: \\A space: \\  end of line: \\', ' */'].join('\n'));
});

test('04 General characters', () => {
  matchSnapshot(['/**', ' * !"#$%&\'()*+,-./:;<=>?@[]^_`{|}~', ' */'].join('\n'));
});

test('05 Spacing characters', () => {
  matchSnapshot(['/**', ' * space:  tab: \t  form feed: \f end', ' */'].join('\n'));
});
