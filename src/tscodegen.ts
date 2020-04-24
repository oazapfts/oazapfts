import fs from "fs";
import ts, { createStringLiteral } from "typescript";

ts.parseIsolatedEntityName;
type KeywordTypeName =
  | "any"
  | "number"
  | "object"
  | "string"
  | "boolean"
  | "undefined"
  | "null";

export const questionToken = ts.createToken(ts.SyntaxKind.QuestionToken);

export function createQuestionToken(token?: boolean | ts.QuestionToken) {
  if (!token) return undefined;
  if (token === true) return questionToken;
  return token;
}

export function createKeywordType(type: KeywordTypeName) {
  switch (type) {
    case "any":
      return ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
    case "number":
      return ts.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
    case "object":
      return ts.createKeywordTypeNode(ts.SyntaxKind.ObjectKeyword);
    case "string":
      return ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
    case "boolean":
      return ts.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
    case "undefined":
      return ts.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword);
    case "null":
      return ts.createKeywordTypeNode(ts.SyntaxKind.NullKeyword);
  }
}

export const keywordType: {
  [type: string]: ts.KeywordTypeNode;
} = {
  any: ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
  number: ts.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
  object: ts.createKeywordTypeNode(ts.SyntaxKind.ObjectKeyword),
  string: ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
  boolean: ts.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
  undefined: ts.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
  null: ts.createKeywordTypeNode(ts.SyntaxKind.NullKeyword),
};

export const modifier = {
  async: ts.createModifier(ts.SyntaxKind.AsyncKeyword),
  export: ts.createModifier(ts.SyntaxKind.ExportKeyword),
};

export function createTypeAliasDeclaration({
  decorators,
  modifiers,
  name,
  typeParameters,
  type,
}: {
  decorators?: Array<ts.Decorator>;
  modifiers?: Array<ts.Modifier>;
  name: string | ts.Identifier;
  typeParameters?: Array<ts.TypeParameterDeclaration>;
  type: ts.TypeNode;
}) {
  return ts.createTypeAliasDeclaration(
    decorators,
    modifiers,
    name,
    typeParameters,
    type
  );
}

export function toExpression(ex: ts.Expression | string) {
  if (typeof ex === "string") return ts.createIdentifier(ex);
  return ex;
}

export function createCall(
  expression: ts.Expression | string,
  {
    typeArgs,
    args,
  }: {
    typeArgs?: Array<ts.TypeNode>;
    args?: Array<ts.Expression>;
  } = {}
) {
  return ts.createCall(toExpression(expression), typeArgs, args);
}

export function createMethodCall(
  method: string,
  opts: {
    typeArgs?: Array<ts.TypeNode>;
    args?: Array<ts.Expression>;
  }
) {
  return createCall(ts.createPropertyAccess(ts.createThis(), method), opts);
}

export function createObjectLiteral(props: [string, string | ts.Expression][]) {
  return ts.createObjectLiteral(
    props.map(([name, identifier]) =>
      createPropertyAssignment(name, toExpression(identifier))
    ),
    true
  );
}

export function createPropertyAssignment(
  name: string,
  expression: ts.Expression
) {
  if (ts.isIdentifier(expression)) {
    if (expression.text === name) {
      return ts.createShorthandPropertyAssignment(name);
    }
  }
  return ts.createPropertyAssignment(propertyName(name), expression);
}

export function block(...statements: ts.Statement[]) {
  return ts.createBlock(statements, true);
}

export function createArrowFunction(
  parameters: ts.ParameterDeclaration[],
  body: ts.ConciseBody,
  {
    modifiers,
    typeParameters,
    type,
    equalsGreaterThanToken,
  }: {
    modifiers?: ts.Modifier[];
    typeParameters?: ts.TypeParameterDeclaration[];
    type?: ts.TypeNode;
    equalsGreaterThanToken?: ts.EqualsGreaterThanToken;
  } = {}
) {
  return ts.createArrowFunction(
    modifiers,
    typeParameters,
    parameters,
    type,
    equalsGreaterThanToken,
    body
  );
}

export function createFunctionDeclaration(
  name: string | ts.Identifier | undefined,
  {
    decorators,
    modifiers,
    asteriskToken,
    typeParameters,
    type,
  }: {
    decorators?: ts.Decorator[];
    modifiers?: ts.Modifier[];
    asteriskToken?: ts.AsteriskToken;
    typeParameters?: ts.TypeParameterDeclaration[];
    type?: ts.TypeNode;
  },
  parameters: ts.ParameterDeclaration[],
  body?: ts.Block
): ts.FunctionDeclaration {
  return ts.createFunctionDeclaration(
    decorators,
    modifiers,
    asteriskToken,
    name,
    typeParameters,
    parameters,
    type,
    body
  );
}

export function createClassDeclaration({
  decorators,
  modifiers,
  name,
  typeParameters,
  heritageClauses,
  members,
}: {
  decorators?: Array<ts.Decorator>;
  modifiers?: Array<ts.Modifier>;
  name?: string | ts.Identifier;
  typeParameters?: Array<ts.TypeParameterDeclaration>;
  heritageClauses?: Array<ts.HeritageClause>;
  members: Array<ts.ClassElement>;
}) {
  return ts.createClassDeclaration(
    decorators,
    modifiers,
    name,
    typeParameters,
    heritageClauses,
    members
  );
}

export function createConstructor({
  decorators,
  modifiers,
  parameters,
  body,
}: {
  decorators?: Array<ts.Decorator>;
  modifiers?: Array<ts.Modifier>;
  parameters: Array<ts.ParameterDeclaration>;
  body?: ts.Block;
}) {
  return ts.createConstructor(decorators, modifiers, parameters, body);
}

export function createMethod(
  name:
    | string
    | ts.Identifier
    | ts.StringLiteral
    | ts.NumericLiteral
    | ts.ComputedPropertyName,
  {
    decorators,
    modifiers,
    asteriskToken,
    questionToken,
    typeParameters,
    type,
  }: {
    decorators?: ts.Decorator[];
    modifiers?: ts.Modifier[];
    asteriskToken?: ts.AsteriskToken;
    questionToken?: ts.QuestionToken | boolean;
    typeParameters?: ts.TypeParameterDeclaration[];
    type?: ts.TypeNode;
  } = {},
  parameters: ts.ParameterDeclaration[] = [],
  body?: ts.Block
): ts.MethodDeclaration {
  return ts.createMethod(
    decorators,
    modifiers,
    asteriskToken,
    name,
    createQuestionToken(questionToken),
    typeParameters,
    parameters,
    type,
    body
  );
}

export function createParameter(
  name: string | ts.BindingName,
  {
    decorators,
    modifiers,
    dotDotDotToken,
    questionToken,
    type,
    initializer,
  }: {
    decorators?: Array<ts.Decorator>;
    modifiers?: Array<ts.Modifier>;
    dotDotDotToken?: ts.DotDotDotToken;
    questionToken?: ts.QuestionToken | boolean;
    type?: ts.TypeNode;
    initializer?: ts.Expression;
  }
): ts.ParameterDeclaration {
  return ts.createParameter(
    decorators,
    modifiers,
    dotDotDotToken,
    name,
    createQuestionToken(questionToken),
    type,
    initializer
  );
}

function propertyName(name: string | ts.PropertyName): ts.PropertyName {
  if (typeof name === "string") {
    return isValidIdentifier(name)
      ? ts.createIdentifier(name)
      : ts.createStringLiteral(name);
  }
  return name;
}

export function createPropertySignature({
  modifiers,
  name,
  questionToken,
  type,
  initializer,
}: {
  modifiers?: Array<ts.Modifier>;
  name: ts.PropertyName | string;
  questionToken?: ts.QuestionToken | boolean;
  type?: ts.TypeNode;
  initializer?: ts.Expression;
}) {
  return ts.createPropertySignature(
    modifiers,
    propertyName(name),
    createQuestionToken(questionToken),
    type,
    initializer
  );
}

export function createIndexSignature(
  type: ts.TypeNode,
  {
    decorators,
    modifiers,
    indexName = "key",
    indexType = keywordType.string,
  }: {
    indexName?: string;
    indexType?: ts.TypeNode;
    decorators?: Array<ts.Decorator>;
    modifiers?: Array<ts.Modifier>;
  } = {}
) {
  return ts.createIndexSignature(
    decorators,
    modifiers,
    [createParameter(indexName, { type: indexType })],
    type
  );
}

export function createObjectBinding(
  elements: Array<{
    name: string | ts.BindingName;
    dotDotDotToken?: ts.DotDotDotToken;
    propertyName?: string | ts.PropertyName;
    initializer?: ts.Expression;
  }>
) {
  return ts.createObjectBindingPattern(
    elements.map(({ dotDotDotToken, propertyName, name, initializer }) =>
      ts.createBindingElement(dotDotDotToken, propertyName, name, initializer)
    )
  );
}

export function createTemplateString(
  head: string,
  spans: Array<{ literal: string; expression: ts.Expression }>
) {
  if (!spans.length) return ts.createStringLiteral(head);
  return ts.createTemplateExpression(
    ts.createTemplateHead(head),
    spans.map(({ expression, literal }, i) =>
      ts.createTemplateSpan(
        expression,
        i === spans.length - 1
          ? ts.createTemplateTail(literal)
          : ts.createTemplateMiddle(literal)
      )
    )
  );
}

export function findNode<T extends ts.Node>(
  nodes: ts.NodeArray<ts.Node>,
  kind: T extends { kind: infer K } ? K : never,
  test?: (node: T) => boolean | undefined
): T {
  const node = nodes.find(
    (s) => s.kind === kind && (!test || test(s as T))
  ) as T;
  if (!node) throw new Error(`Node not found: ${kind}`);
  return node;
}

export function getName(name: ts.Node) {
  if (ts.isIdentifier(name)) {
    return name.escapedText;
  }
  if (ts.isLiteralExpression(name)) {
    return name.text;
  }
  return "";
}

export function getFirstDeclarationName(n: ts.VariableStatement) {
  const name = ts.getNameOfDeclaration(n.declarationList.declarations[0]);
  return name ? getName(name) : "";
}

export function findFirstVariableDeclaration(
  nodes: ts.NodeArray<ts.Node>,
  name: string
) {
  const statement = findNode<ts.VariableStatement>(
    nodes,
    ts.SyntaxKind.VariableStatement,
    (n) => getFirstDeclarationName(n) === name
  );
  const [first] = statement.declarationList.declarations;
  if (!first) throw new Error("Missing declaration");
  return first;
}

export function changePropertyValue(
  o: ts.ObjectLiteralExpression,
  property: string,
  value: ts.Expression
) {
  const p = o.properties.find(
    (p) => ts.isPropertyAssignment(p) && getName(p.name) === property
  );
  if (p && ts.isPropertyAssignment(p)) {
    p.initializer = value;
  } else {
    throw new Error(`No such property: ${property}`);
  }
}

export function appendNodes<T extends ts.Node>(
  array: ts.NodeArray<T>,
  ...nodes: T[]
) {
  return ts.createNodeArray([...array, ...nodes]);
}

export function addComment<T extends ts.Node>(node: T, comment?: string) {
  if (!comment) return node;
  return ts.addSyntheticLeadingComment(
    node,
    ts.SyntaxKind.MultiLineCommentTrivia,
    `*\n * ${comment.replace(/\n/g, "\n * ")}\n `,
    true
  );
}

export function parseFile(file: string) {
  return ts.createSourceFile(
    file,
    fs.readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ false,
    ts.ScriptKind.TS
  );
}

const printer = ts.createPrinter({
  newLine: ts.NewLineKind.LineFeed,
});

export function printNode(node: ts.Node) {
  const file = ts.createSourceFile(
    "someFileName.ts",
    "",
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ false,
    ts.ScriptKind.TS
  );
  return printer.printNode(ts.EmitHint.Unspecified, node, file);
}

export function printNodes(nodes: ts.Node[]) {
  const file = ts.createSourceFile(
    "someFileName.ts",
    "",
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ false,
    ts.ScriptKind.TS
  );
  return nodes
    .map((node) => printer.printNode(ts.EmitHint.Unspecified, node, file))
    .join("\n");
}

export function printFile(sourceFile: ts.SourceFile) {
  return printer.printFile(sourceFile);
}

export function isValidIdentifier(str: string) {
  if (!str.length || str.trim() !== str) return false;
  const node = ts.parseIsolatedEntityName(str, ts.ScriptTarget.Latest);
  return (
    !!node &&
    node.kind === ts.SyntaxKind.Identifier &&
    !("originalKeywordKind" in node)
  );
}
