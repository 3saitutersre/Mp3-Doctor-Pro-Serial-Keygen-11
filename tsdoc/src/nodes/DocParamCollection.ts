// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.

import { DocNodeKind, DocNode, type IDocNodeParameters } from './DocNode';
import type { DocParamBlock } from './DocParamBlock';

/**
 * Constructor parameters for {@link DocParamCollection}.
 */
export interface IDocParamCollectionParameters extends IDocNodeParameters {}

/**
 * Represents a collection of DocParamBlock objects and provides efficient operations for looking up the
 * documentation for a specified parameter name.
 */
export class DocParamCollection extends DocNode {
  private readonly _blocks: DocParamBlock[] = [];
  private _blocksByName: Map<string, DocParamBlock> | undefined;

  /**
   * Don't call this directly.  Instead use {@link TSDocParser}
   * @internal
   */
  public constructor(parameters: IDocParamCollectionParameters) {
    super(parameters);
  }

  /** @override */
  public get kind(): DocNodeKind | string {
    return DocNodeKind.ParamCollection;
  }

  /**
   * Provide an iterator for callers that support it.
   */
  public [Symbol.iterator](): IterableIterator<DocParamBlock> {
    return this._blocks[Symbol.iterator]();
  }

  /**
   * Returns the blocks in this collection.
   */
  public get blocks(): ReadonlyArray<DocParamBlock> {
    return this._blocks;
  }

  /**
   * Returns the number of blocks in this collection.
   */
  public get count(): number {
    return this._blocks.length;
  }

  /**
   * Adds a new block to the collection.
   */
  public add(docParamBlock: DocParamBlock): void {
    this._blocks.push(docParamBlock);

    // Allocate the map on demand, since most DocComment parameter collections will be empty
    if (this._blocksByName === undefined) {
      this._blocksByName = new Map<string, DocParamBlock>();
    }

    // The first block to be added takes precedence
    if (!this._blocksByName.has(docParamBlock.parameterName)) {
      this._blocksByName.set(docParamBlock.parameterName, docParamBlock);
    }
  }

  /**
   * Removes all blocks from the collection
   */
  public clear(): void {
    this._blocks.length = 0;
    this._blocksByName = undefined;
  }

  /**
   * Returns the first block whose `parameterName` matches the specified string.
   *
   * @remarks
   * If the collection was parsed from an input containing errors, there could potentially be more than
   * one DocParamBlock with the same name.  In this situation, tryGetBlockByName() will return the first match
   * that it finds.
   *
   * This lookup is optimized using a dictionary.
   */
  public tryGetBlockByName(parameterName: string): DocParamBlock | undefined {
    if (this._blocksByName) {
      return this._blocksByName.get(parameterName);
    }
    return undefined;
  }

  /** @override */
  protected onGetChildNodes(): ReadonlyArray<DocNode | undefined> {
    return this._blocks;
  }
}
