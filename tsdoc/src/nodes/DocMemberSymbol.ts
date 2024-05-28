// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.

import { DocNodeKind, DocNode, type IDocNodeParameters, type IDocNodeParsedParameters } from './DocNode';
import type { DocDeclarationReference } from './DocDeclarationReference';
import type { TokenSequence } from '../parser/TokenSequence';
import { DocExcerpt, ExcerptKind } from './DocExcerpt';

/**
 * Constructor parameters for {@link DocMemberSymbol}.
 */
export interface IDocMemberSymbolParameters extends IDocNodeParameters {
  symbolReference: DocDeclarationReference;
}

/**
 * Constructor parameters for {@link DocMemberSymbol}.
 */
export interface IDocMemberSymbolParsedParameters extends IDocNodeParsedParameters {
  leftBracketExcerpt: TokenSequence;
  spacingAfterLeftBracketExcerpt?: TokenSequence;

  symbolReference: DocDeclarationReference;

  rightBracketExcerpt: TokenSequence;
}

/**
 * Represents a reference to an ECMAScript 6 symbol that is used
 * to identify a member declaration.
 *
 * @example
 *
 * In the declaration reference `{@link MyClass.([MySymbols.example]:instance)}`,
 * the member symbol `[MySymbols.example]` might be used to reference a property
 * of the class.
 */
export class DocMemberSymbol extends DocNode {
  private readonly _leftBracketExcerpt: DocExcerpt | undefined;
  private readonly _spacingAfterLeftBracketExcerpt: DocExcerpt | undefined;

  private readonly _symbolReference: DocDeclarationReference;

  private readonly _rightBracketExcerpt: DocExcerpt | undefined;

  /**
   * Don't call this directly.  Instead use {@link TSDocParser}
   * @internal
   */
  public constructor(parameters: IDocMemberSymbolParameters | IDocMemberSymbolParsedParameters) {
    super(parameters);

    if (DocNode.isParsedParameters(parameters)) {
      this._leftBracketExcerpt = new DocExcerpt({
        configuration: this.configuration,
        excerptKind: ExcerptKind.DocMemberSymbol_LeftBracket,
        content: parameters.leftBracketExcerpt
      });

      if (parameters.spacingAfterLeftBracketExcerpt) {
        this._spacingAfterLeftBracketExcerpt = new DocExcerpt({
          configuration: this.configuration,
          excerptKind: ExcerptKind.Spacing,
          content: parameters.spacingAfterLeftBracketExcerpt
        });
      }

      this._rightBracketExcerpt = new DocExcerpt({
        configuration: this.configuration,
        excerptKind: ExcerptKind.DocMemberSymbol_RightBracket,
        content: parameters.rightBracketExcerpt
      });
    }

    this._symbolReference = parameters.symbolReference;
  }

  /** @override */
  public get kind(): DocNodeKind | string {
    return DocNodeKind.MemberSymbol;
  }

  /**
   * The declaration reference for the ECMAScript 6 symbol that will act as
   * the identifier for the member.
   */
  public get symbolReference(): DocDeclarationReference {
    return this._symbolReference;
  }

  /** @override */
  protected onGetChildNodes(): ReadonlyArray<DocNode | undefined> {
    return [
      this._leftBracketExcerpt,
      this._spacingAfterLeftBracketExcerpt,
      this._symbolReference,
      this._rightBracketExcerpt
    ];
  }
}
