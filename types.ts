
export interface FormatOptions {
  tabWidth: number;
  useTabs: boolean;
  quoteStyle: 'double' | 'single';
  formatSql: boolean;
  attributeThreshold: number;
  pascalCaseBuiltInFunctions: boolean;
  preferNewOverCreateObject: boolean;
}

export enum NodeType {
  ROOT = 'ROOT',
  TAG = 'TAG',
  TEXT = 'TEXT',
  COMMENT = 'COMMENT',
}

export interface BaseNode {
    type: NodeType;
    parent: NodeWithChildren | null;
}

export interface NodeWithChildren extends BaseNode {
    children: AstNode[];
}

export interface RootNode extends NodeWithChildren {
    type: NodeType.ROOT;
}

export interface TagNode extends NodeWithChildren {
    type: NodeType.TAG;
    tagName: string;
    attributes: Record<string, string | null>;
    isSelfClosing: boolean;
    preserveContent: boolean;
    // For chaining <cfif>/<cfelseif>/<cfelse>
    alternate?: TagNode;
}

export interface TextNode extends BaseNode {
    type: NodeType.TEXT;
    content: string;
}

export interface CommentNode extends BaseNode {
    type: NodeType.COMMENT;
    content: string;
}

export type AstNode = TagNode | TextNode | CommentNode;
