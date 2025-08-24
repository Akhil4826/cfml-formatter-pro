import { type FormatOptions, type AstNode, NodeType, type TagNode, type RootNode, type NodeWithChildren } from '../types';

// Type guard to check if a node is a TagNode
function isTagNode(node: NodeWithChildren): node is TagNode {
  return node.type === NodeType.TAG;
}

// A simplified regex-based tokenizer to split code into tags, comments, and text
const TOKENIZER_REGEX = /(<!--.*?-->|<\/?[a-zA-Z][^>]*>|[^<]+)/gs;
const TAG_REGEX = /<(\/)?([a-zA-Z0-9_:-]+)([^>]*)>/;
const ATTR_REGEX = /([a-zA-Z0-9_:-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^ \/>\s]+)))?/g;

const SELF_CLOSING_TAGS = new Set(['cfset', 'cfparam', 'cfqueryparam', 'br', 'hr', 'img', 'input', 'meta', 'link']);
const PRESERVE_CONTENT_TAGS = new Set(['cfquery', 'cfscript', 'script', 'style']);
const CHAINABLE_TAGS = new Set(['cfif', 'cftry', 'cfelseif', 'cfcatch']);
const CHAIN_CONTINUATION_TAGS = new Set(['cfelseif', 'cfelse', 'cfcatch']);

// --- Code Modernization Helpers ---

function pascalCaseBuiltInFunctions(code: string): string {
    // A non-exhaustive list of common CF functions
    const functions = ['arrayLen', 'listLen', 'writeOutput', 'isDefined', 'structNew', 'queryNew'];
    let processedCode = code;
    functions.forEach(func => {
        const capitalized = func.charAt(0).toUpperCase() + func.slice(1);
        // Regex to match function calls, avoiding properties of objects
        const regex = new RegExp(`\\b${func}\\b(?=\\s*\\()`, 'gi');
        processedCode = processedCode.replace(regex, capitalized);
    });
    return processedCode;
}

function rewriteCreateObjectToNew(code: string): string {
    const regex = /createObject\s*\(\s*["']component["']\s*,\s*["']([^"']+)["']\s*\)/gi;
    return code.replace(regex, (match, componentPath) => `new ${componentPath}()`);
}


// --- SQL Formatter ---

function formatSql(sql: string, options: FormatOptions, baseIndent: string): string {
    const indent = (options.useTabs ? '\t' : ' '.repeat(options.tabWidth));
    let formatted = sql;

    // Standardize keywords to uppercase
    const keywords = ['SELECT', 'FROM', 'LEFT JOIN', 'INNER JOIN', 'ON', 'WHERE', 'GROUP BY', 'ORDER BY', 'AND', 'OR'];
    keywords.forEach(kw => {
        formatted = formatted.replace(new RegExp(`\\b${kw}\\b`, 'gi'), kw.toUpperCase());
    });

    // Break lines on major keywords
    formatted = formatted.replace(/\s+(FROM|LEFT JOIN|INNER JOIN|WHERE|GROUP BY|ORDER BY)/g, '\n' + baseIndent + indent + '$1');

    // Format SELECT columns
    formatted = formatted.replace(/SELECT\s+(DISTINCT\s+)?(.*?)\s+FROM/s, (match, distinct, columns) => {
        const cols = columns.split(',')
            .map(c => c.trim())
            .filter(Boolean)
            .join(',\n' + baseIndent + indent + indent);
        return `SELECT ${distinct || ''}\n${baseIndent}${indent}${indent}${cols}\n`;
    });
    
    // Format WHERE/AND/OR clauses
    formatted = formatted.replace(/\s+(WHERE|AND|OR)\s+/g, `\n${baseIndent}${indent}  $1 `);

    return formatted.trim();
}


// --- Parser ---

function parseAttributes(attrString: string | undefined): Record<string, string | null> {
    if (!attrString) return {};
    const attributes: Record<string, string | null> = {};
    let match;
    while ((match = ATTR_REGEX.exec(attrString)) !== null) {
        const key = match[1];
        const value = match[2] ?? match[3] ?? match[4] ?? null;
        attributes[key.toLowerCase()] = value;
    }
    return attributes;
}

function parseCfml(code: string): RootNode {
    const tokens = code.match(TOKENIZER_REGEX) || [];
    const root: RootNode = { type: NodeType.ROOT, children: [], parent: null };
    const stack: NodeWithChildren[] = [root];

    const getCurrentParent = () => stack[stack.length - 1];

    for (const token of tokens) {
        const trimmedToken = token.trim();
        if (!trimmedToken) continue;

        const parent = getCurrentParent();

        if (trimmedToken.startsWith('<!--')) {
            const node: AstNode = { type: NodeType.COMMENT, content: trimmedToken.slice(4, -3).trim(), parent };
            parent.children.push(node);
            continue;
        }

        if (trimmedToken.startsWith('<')) {
            const tagMatch = trimmedToken.match(TAG_REGEX);
            if (!tagMatch) { // Malformed tag, treat as text
                const node: AstNode = { type: NodeType.TEXT, content: token, parent };
                parent.children.push(node);
                continue;
            }

            const [, isClosingSlash, tagName, attrString] = tagMatch;
            const lowerTagName = tagName.toLowerCase();

            if (isClosingSlash) {
                if (isTagNode(parent) && parent.tagName === lowerTagName) {
                    stack.pop();
                } // Ignore mismatched closing tags for robustness
                continue;
            }
            
            const isSelfClosing = SELF_CLOSING_TAGS.has(lowerTagName) || trimmedToken.endsWith('/>');
            const node: TagNode = {
                type: NodeType.TAG,
                tagName: lowerTagName,
                attributes: parseAttributes(attrString),
                children: [],
                isSelfClosing,
                preserveContent: PRESERVE_CONTENT_TAGS.has(lowerTagName),
                parent
            };

            // Handle <cfelse>, <cfelseif> chaining
            if (CHAIN_CONTINUATION_TAGS.has(lowerTagName) && parent.type === NodeType.TAG) {
                // Find the last cfif/cftry on the same level to chain to
                let lastChainableSibling: TagNode | undefined;
                for (let i = parent.children.length - 1; i >= 0; i--) {
                    const sibling = parent.children[i];
                    if (sibling.type === NodeType.TAG && CHAINABLE_TAGS.has(sibling.tagName)) {
                        lastChainableSibling = sibling;
                        break;
                    }
                }
                
                if (lastChainableSibling) {
                    // Find the end of the chain and attach
                    let chainEnd = lastChainableSibling;
                    while (chainEnd.alternate) {
                        chainEnd = chainEnd.alternate;
                    }
                    chainEnd.alternate = node;
                } else {
                     parent.children.push(node); // Fallback if no chainable tag found
                }
            } else {
                 parent.children.push(node);
            }

            if (!isSelfClosing) {
                stack.push(node);
            }
        } else { // Text node
            const node: AstNode = { type: NodeType.TEXT, content: token, parent };
            parent.children.push(node);
        }
    }
    if (stack.length > 1) {
        console.warn(`Unclosed tags found: ${stack.slice(1).map(t => ((t as TagNode).tagName)).join(', ')}`);
    }
    return root;
}


// --- Printer ---

function printAst(nodes: AstNode[], options: FormatOptions, indentLevel = 0): string {
    let output = '';
    const indent = options.useTabs ? '\t'.repeat(indentLevel) : ' '.repeat(indentLevel * options.tabWidth);
    const quote = options.quoteStyle === 'single' ? "'" : '"';

    for (const node of nodes) {
        switch (node.type) {
            case NodeType.TEXT:
                const trimmedContent = node.content.trim();
                if (trimmedContent) output += `${indent}${trimmedContent}\n`;
                break;
            
            case NodeType.COMMENT:
                output += `${indent}<!--- ${node.content} --->\n`;
                break;

            case NodeType.TAG:
                // Don't print alternates directly, they are handled by their parent
                if (node.parent && isTagNode(node.parent) && node.parent.alternate === node) {
                    continue;
                }
                
                let attrs = Object.entries(node.attributes)
                    .map(([key, value]) => {
                        if (value === null) return key;
                        let processedValue = value;
                        if (options.pascalCaseBuiltInFunctions) {
                            processedValue = pascalCaseBuiltInFunctions(processedValue);
                        }
                        if (options.preferNewOverCreateObject) {
                            processedValue = rewriteCreateObjectToNew(processedValue);
                        }
                        return `${key}=${quote}${processedValue}${quote}`;
                    });

                let attrStr = '';
                if (attrs.length > 0) {
                    if (attrs.length > options.attributeThreshold) {
                        const attrIndent = indent + (options.useTabs ? '\t' : ' '.repeat(options.tabWidth));
                        attrStr = `\n${attrs.map(a => `${attrIndent}${a}`).join('\n')}\n${indent}`;
                    } else {
                        attrStr = ` ${attrs.join(' ')}`;
                    }
                }
                
                output += `${indent}<${node.tagName}${attrStr}${node.isSelfClosing ? ' /' : ''}>\n`;

                if (!node.isSelfClosing) {
                    if (node.preserveContent && node.children.length > 0 && node.children[0].type === NodeType.TEXT) {
                         let content = node.children.map(c => (c as any).content || '').join('').trim();
                         if (node.tagName === 'cfquery' && options.formatSql) {
                             output += formatSql(content, options, indent) + '\n';
                         } else {
                            if (options.pascalCaseBuiltInFunctions) content = pascalCaseBuiltInFunctions(content);
                            if (options.preferNewOverCreateObject) content = rewriteCreateObjectToNew(content);
                            content.split('\n').forEach(line => {
                                output += `${indent}${(options.useTabs ? '\t' : ' '.repeat(options.tabWidth))}${line.trim()}\n`;
                            });
                         }
                    } else if (node.children.length > 0) {
                        output += printAst(node.children, options, indentLevel + 1);
                    }
                    
                    if (node.alternate) {
                        output += printAst([node.alternate], options, indentLevel);
                    }
                    
                    output += `${indent}</${node.tagName}>\n`;
                }
                break;
        }
    }
    return output;
}

export function formatCfml(code: string, options: FormatOptions): string {
    const ast = parseCfml(code);
    return printAst(ast.children, options).trim();
}