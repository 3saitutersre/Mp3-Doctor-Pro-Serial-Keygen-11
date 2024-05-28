// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.

import { DocNodeKind, type IDocNodeParameters, type IDocNodeParsedParameters, DocNode } from './DocNode';
import type { TokenSequence } from '../parser/TokenSequence';
import { DocExcerpt, ExcerptKind } from './DocExcerpt';

/**
 * Constructor parameters for {@link DocPlainText}.
 */
export interface IDocPlainTextParameters extends IDocNodeParameters {
  text: string;
}

/**
 * Constructor parameters for {@link DocPlainText}.
 */
export interface IDocPlainTextParsedParameters extends IDocNodeParsedParameters {
  textExcerpt: TokenSequence;
}

/**
 * Represents a span of comment text that is considered by the parser
 * to contain no special symbols or meaning.
 *
 * @remarks
 * The text content must not contain newline characters.
 * Use DocSoftBreak to represent manual line splitting.
 */
export class DocPlainText extends DocNode {
  // TODO: We should also prohibit "\r", but this requires updating LineExtractor
  // to interpret a lone "\r" as a newline
  private static readonly _newlineCharacterRegExp: RegExp = /[\n]/;

  private _text: string | undefined;
  private readonly _textExcerpt: DocExcerpt | undefined;

  /**
   * Don't call this directly.  Instead use {@link TSDocParser}
   * @internal
   */
  public constructor(parameters: IDocPlainTextParameters | IDocPlainTextParsedParameters) {
    super(parameters);

    if (DocNode.isParsedParameters(parameters)) {
      this._textExcerpt = new DocExcerpt({
        configuration: this.configuration,
        excerptKind: ExcerptKind.PlainText,
        content: parameters.textExcerpt
      });
    } else {
      if (DocPlainText._newlineCharacterRegExp.test(parameters.text)) {
        // Use DocSoftBreak to represent manual line splitting
        throw new Error('The DocPlainText content must not contain newline characters');
      }

      this._text = parameters.text;
    }
  }

  /** @override */
  public get kind(): DocNodeKind | string {
    return DocNodeKind.PlainText;
  }

  /**
   * The text content.
   */
  public get text(): string {
    if (this._text === undefined) {
      this._text = this._textExcerpt!.content.toString();
    }
    return this._text;
  }

  public get textExcerpt(): TokenSequence | undefined {
    if (this._textExcerpt) {
      return this._textExcerpt.content;
    } else {
      return undefined;
    }
  }

  /** @override */
  protected onGetChildNodes(): ReadonlyArray<DocNode | undefined> {
    return [this._textExcerpt];
  }
}
