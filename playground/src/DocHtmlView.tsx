import * as React from 'react';
import * as tsdoc from '@microsoft/tsdoc';

export interface IDocHtmlViewProps {
  style?: React.CSSProperties;
  docComment: tsdoc.DocComment;
}

export class DocHtmlView extends React.Component<IDocHtmlViewProps> {
  public render(): React.ReactNode {
    const docComment: tsdoc.DocComment = this.props.docComment;

    const outputElements: React.ReactNode[] = [];

    // Summary
    if (docComment.summarySection) {
      outputElements.push(
        <React.Fragment key="summary">
          <h2 className="doc-heading">Summary</h2>
          {this._renderContainer(docComment.summarySection)}
        </React.Fragment>
      );
    }

    // Parameters
    if (docComment.params.count > 0) {
      const rows: React.ReactNode[] = [];

      for (const paramBlock of docComment.params.blocks) {
        rows.push(
          <tr key={`param_${rows.length}`}>
            <td>{paramBlock.parameterName}</td>
            <td>{this._renderContainer(paramBlock.content)}</td>
          </tr>
        );
      }

      outputElements.push(
        <React.Fragment key="parameters">
          <h2 className="doc-heading">Parameters</h2>
          <table className="doc-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
        </React.Fragment>
      );
    }

    // Returns
    if (docComment.returnsBlock) {
      outputElements.push(
        <React.Fragment key="returns">
          <h2 className="doc-heading">Return Value</h2>
          {this._renderContainer(docComment.returnsBlock.content)}
        </React.Fragment>
      );
    }

    if (docComment.remarksBlock) {
      outputElements.push(
        <React.Fragment key="remarks">
          <h2 className="doc-heading">Remarks</h2>
          {this._renderContainer(docComment.remarksBlock.content)}
        </React.Fragment>
      );
    }

    const exampleBlocks: tsdoc.DocBlock[] = docComment.customBlocks.filter(
      (x) => x.blockTag.tagNameWithUpperCase === tsdoc.StandardTags.example.tagNameWithUpperCase
    );

    let exampleNumber: number = 1;
    for (const exampleBlock of exampleBlocks) {
      const heading: string = exampleBlocks.length > 1 ? `Example ${exampleNumber}` : 'Example';

      outputElements.push(
        <React.Fragment key="seeAlso">
          <h2 className="doc-heading">{heading}</h2>
          {this._renderContainer(exampleBlock.content)}
        </React.Fragment>
      );

      ++exampleNumber;
    }

    if (docComment.seeBlocks.length > 0) {
      const listItems: React.ReactNode[] = [];
      for (const seeBlock of docComment.seeBlocks) {
        listItems.push(<li key={`item_${listItems.length}`}>{this._renderContainer(seeBlock.content)}</li>);
      }

      outputElements.push(
        <React.Fragment key="seeAlso">
          <h2 className="doc-heading">See Also</h2>
          <ul>{listItems}</ul>
        </React.Fragment>
      );
    }

    const modifierTags: ReadonlyArray<tsdoc.DocBlockTag> = docComment.modifierTagSet.nodes;

    if (modifierTags.length > 0) {
      const modifierElements: React.ReactNode[] = [];

      for (const modifierTag of modifierTags) {
        const key: string = `modifier_${modifierElements.length}`;
        modifierElements.push(
          <React.Fragment key={key}>
            {' '}
            <code className="doc-code-span">{modifierTag.tagName}</code>
          </React.Fragment>
        );
      }

      outputElements.push(
        <React.Fragment key="modifiers">
          <h2 className="doc-heading">Modifiers</h2>
          {modifierElements}
        </React.Fragment>
      );
    }

    return <div style={this.props.style}> {outputElements} </div>;
  }

  private _renderContainer(section: tsdoc.DocNodeContainer): React.ReactNode {
    const elements: React.ReactNode[] = [];
    for (const node of section.nodes) {
      const key: string = `key_${elements.length}`;
      elements.push(this._renderDocNode(node, key));
    }
    return <React.Fragment>{elements}</React.Fragment>;
  }

  private _renderDocNode(node: tsdoc.DocNode, key: string): React.ReactNode | undefined {
    switch (node.kind) {
      case 'CodeSpan':
        return (
          <code key={key} className="doc-code-span">
            {(node as tsdoc.DocCodeSpan).code}
          </code>
        );
      case 'ErrorText':
        return <React.Fragment key={key}>{(node as tsdoc.DocErrorText).text}</React.Fragment>;
      case 'EscapedText':
        return <React.Fragment key={key}>{(node as tsdoc.DocEscapedText).decodedText}</React.Fragment>;
      case 'FencedCode':
        const docFencedCode: tsdoc.DocFencedCode = node as tsdoc.DocFencedCode;
        return (
          <pre key={key} className="doc-fenced-code">
            <code key={key}>{docFencedCode.code}</code>
          </pre>
        );
        break;
      case 'LinkTag':
        const linkTag: tsdoc.DocLinkTag = node as tsdoc.DocLinkTag;
        if (linkTag.urlDestination) {
          const linkText: string = linkTag.linkText || linkTag.urlDestination;
          return (
            <a key={key} href="#">
              {linkText}
            </a>
          );
        } else {
          let identifier: string = '';
          if (linkTag.codeDestination) {
            // TODO: The library should provide a default rendering for this
            const memberReferences: ReadonlyArray<tsdoc.DocMemberReference> =
              linkTag.codeDestination.memberReferences;
            if (memberReferences.length > 0) {
              const memberIdentifier: tsdoc.DocMemberIdentifier | undefined =
                memberReferences[memberReferences.length - 1].memberIdentifier;
              if (memberIdentifier) {
                identifier = memberIdentifier.identifier;
              }
            }
          }
          const linkText: string = linkTag.linkText || identifier || '???';
          return (
            <a key={key} href="#">
              {linkText}
            </a>
          );
        }
      case 'Paragraph':
        // Collapse spaces in the paragraph
        const transformedParagraph: tsdoc.DocParagraph = tsdoc.DocNodeTransforms.trimSpacesInParagraph(
          node as tsdoc.DocParagraph
        );

        return <p key={key}>{this._renderContainer(transformedParagraph)}</p>;
      case 'PlainText':
        return <React.Fragment key={key}>{(node as tsdoc.DocPlainText).text}</React.Fragment>;
      case 'SoftBreak':
        return <React.Fragment key={key}> </React.Fragment>;
    }
    return undefined;
  }
}
