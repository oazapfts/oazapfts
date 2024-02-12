import ts from "typescript";
import { toIdentifier } from "./generate";

const factory = ts.factory;

export const questionToken = factory.createToken(ts.SyntaxKind.QuestionToken);

export function createQuestionToken(token?: boolean | ts.QuestionToken) {
  if (!token) return undefined;
  if (token === true) return questionToken;
  return token;
}

export const keywordType = {
  any: factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
  number: factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
  object: factory.createKeywordTypeNode(ts.SyntaxKind.ObjectKeyword),
  string: factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
  boolean: factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
  undefined: factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
  void: factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
  null: factory.createLiteralTypeNode(factory.createNull()),
};

type KeywordTypeName = keyof typeof keywordType;

export function createKeywordType(type: KeywordTypeName) {
  return keywordType[type];
}

export const modifier = {
  async: factory.createModifier(ts.SyntaxKind.AsyncKeyword),
  export: factory.createModifier(ts.SyntaxKind.ExportKeyword),
};

export function createLiteral(v: string | boolean | number) {
  switch (typeof v) {
    case "string":
      return factory.createStringLiteral(v);
    case "boolean":
      return v ? factory.createTrue() : factory.createFalse();
    case "number":
      return factory.createNumericLiteral(String(v));
  }
}

export function createEnumTypeNode(values: Array<string | boolean | number>) {
  const types = values.map((v) =>
    v === null
      ? keywordType.null
      : factory.createLiteralTypeNode(createLiteral(v)),
  );
  return types.length > 1 ? factory.createUnionTypeNode(types) : types[0];
}

export function createTypeAliasDeclaration({
  modifiers,
  name,
  typeParameters,
  type,
}: {
  modifiers?: Array<ts.Modifier>;
  name: string | ts.Identifier;
  typeParameters?: Array<ts.TypeParameterDeclaration>;
  type: ts.TypeNode;
}) {
  return factory.createTypeAliasDeclaration(
    modifiers,
    name,
    typeParameters,
    type,
  );
}

export function createInterfaceAliasDeclaration({
  modifiers,
  name,
  typeParameters,
  type,
  inheritedNodeNames,
}: {
  modifiers?: Array<ts.Modifier>;
  name: string | ts.Identifier;
  typeParameters?: Array<ts.TypeParameterDeclaration>;
  type: ts.TypeNode;
  inheritedNodeNames?: (string | ts.Identifier)[];
}) {
  const heritageClauses = inheritedNodeNames
    ? [
        factory.createHeritageClause(
          ts.SyntaxKind.ExtendsKeyword,
          inheritedNodeNames.map((name) => {
            const extendedInterfaceName =
              typeof name === "string" ? name : name.escapedText.toString();
            return factory.createExpressionWithTypeArguments(
              factory.createIdentifier(
                toIdentifier(extendedInterfaceName, true),
              ),
              undefined,
            );
          }),
        ),
      ]
    : [];
  return factory.createInterfaceDeclaration(
    modifiers,
    name,
    typeParameters,
    heritageClauses,
    (type as ts.TypeLiteralNode).members,
  );
}

export function toExpression(ex: ts.Expression | string) {
  if (typeof ex === "string") return factory.createIdentifier(ex);
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
  } = {},
) {
  return factory.createCallExpression(toExpression(expression), typeArgs, args);
}

export function createMethodCall(
  method: string,
  opts: {
    typeArgs?: Array<ts.TypeNode>;
    args?: Array<ts.Expression>;
  },
) {
  return createCall(
    factory.createPropertyAccessExpression(factory.createThis(), method),
    opts,
  );
}

export function createObjectLiteral(props: [string, string | ts.Expression][]) {
  return factory.createObjectLiteralExpression(
    props.map(([name, identifier]) =>
      createPropertyAssignment(name, toExpression(identifier)),
    ),
    true,
  );
}

export function createPropertyAssignment(
  name: string,
  expression: ts.Expression,
) {
  if (ts.isIdentifier(expression)) {
    if (expression.text === name) {
      return factory.createShorthandPropertyAssignment(name);
    }
  }
  return factory.createPropertyAssignment(propertyName(name), expression);
}

export function block(...statements: ts.Statement[]) {
  return factory.createBlock(statements, true);
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
  } = {},
) {
  return factory.createArrowFunction(
    modifiers,
    typeParameters,
    parameters,
    type,
    equalsGreaterThanToken,
    body,
  );
}

export function createFunctionDeclaration(
  name: string | ts.Identifier | undefined,
  {
    modifiers,
    asteriskToken,
    typeParameters,
    type,
  }: {
    modifiers?: ts.Modifier[];
    asteriskToken?: ts.AsteriskToken;
    typeParameters?: ts.TypeParameterDeclaration[];
    type?: ts.TypeNode;
  },
  parameters: ts.ParameterDeclaration[],
  body?: ts.Block,
): ts.FunctionDeclaration {
  return factory.createFunctionDeclaration(
    modifiers,
    asteriskToken,
    name,
    typeParameters,
    parameters,
    type,
    body,
  );
}

export function createClassDeclaration({
  modifiers,
  name,
  typeParameters,
  heritageClauses,
  members,
}: {
  modifiers?: Array<ts.Modifier>;
  name?: string | ts.Identifier;
  typeParameters?: Array<ts.TypeParameterDeclaration>;
  heritageClauses?: Array<ts.HeritageClause>;
  members: Array<ts.ClassElement>;
}) {
  return factory.createClassDeclaration(
    modifiers,
    name,
    typeParameters,
    heritageClauses,
    members,
  );
}

export function createConstructor({
  modifiers,
  parameters,
  body,
}: {
  modifiers?: Array<ts.Modifier>;
  parameters: Array<ts.ParameterDeclaration>;
  body?: ts.Block;
}) {
  return factory.createConstructorDeclaration(modifiers, parameters, body);
}

export function createMethod(
  name:
    | string
    | ts.Identifier
    | ts.StringLiteral
    | ts.NumericLiteral
    | ts.ComputedPropertyName,
  {
    modifiers,
    asteriskToken,
    questionToken,
    typeParameters,
    type,
  }: {
    modifiers?: ts.Modifier[];
    asteriskToken?: ts.AsteriskToken;
    questionToken?: ts.QuestionToken | boolean;
    typeParameters?: ts.TypeParameterDeclaration[];
    type?: ts.TypeNode;
  } = {},
  parameters: ts.ParameterDeclaration[] = [],
  body?: ts.Block,
): ts.MethodDeclaration {
  return factory.createMethodDeclaration(
    modifiers,
    asteriskToken,
    name,
    createQuestionToken(questionToken),
    typeParameters,
    parameters,
    type,
    body,
  );
}

export function createParameter(
  name: string | ts.BindingName,
  {
    modifiers,
    dotDotDotToken,
    questionToken,
    type,
    initializer,
  }: {
    modifiers?: Array<ts.Modifier>;
    dotDotDotToken?: ts.DotDotDotToken;
    questionToken?: ts.QuestionToken | boolean;
    type?: ts.TypeNode;
    initializer?: ts.Expression;
  },
): ts.ParameterDeclaration {
  return factory.createParameterDeclaration(
    modifiers,
    dotDotDotToken,
    name,
    createQuestionToken(questionToken),
    type,
    initializer,
  );
}

function propertyName(name: string | ts.PropertyName): ts.PropertyName {
  if (typeof name === "string") {
    return isValidIdentifier(name)
      ? factory.createIdentifier(name)
      : factory.createStringLiteral(name);
  }
  return name;
}

export function createPropertySignature({
  modifiers,
  name,
  questionToken,
  type,
}: {
  modifiers?: Array<ts.Modifier>;
  name: ts.PropertyName | string;
  questionToken?: ts.QuestionToken | boolean;
  type?: ts.TypeNode;
}) {
  return factory.createPropertySignature(
    modifiers,
    propertyName(name),
    createQuestionToken(questionToken),
    type,
  );
}

export function createIndexSignature(
  type: ts.TypeNode,
  {
    modifiers,
    indexName = "key",
    indexType = keywordType.string,
  }: {
    indexName?: string;
    indexType?: ts.TypeNode;
    modifiers?: Array<ts.Modifier>;
  } = {},
) {
  return factory.createIndexSignature(
    modifiers,
    [createParameter(indexName, { type: indexType })],
    type,
  );
}

export function createObjectBinding(
  elements: Array<{
    name: string | ts.BindingName;
    dotDotDotToken?: ts.DotDotDotToken;
    propertyName?: string | ts.PropertyName;
    initializer?: ts.Expression;
  }>,
) {
  return factory.createObjectBindingPattern(
    elements.map(({ dotDotDotToken, propertyName, name, initializer }) =>
      factory.createBindingElement(
        dotDotDotToken,
        propertyName,
        name,
        initializer,
      ),
    ),
  );
}

export function createTemplateString(
  head: string,
  spans: Array<{ literal: string; expression: ts.Expression }>,
) {
  if (!spans.length) return factory.createStringLiteral(head);
  return factory.createTemplateExpression(
    factory.createTemplateHead(head),
    spans.map(({ expression, literal }, i) =>
      factory.createTemplateSpan(
        expression,
        i === spans.length - 1
          ? factory.createTemplateTail(literal)
          : factory.createTemplateMiddle(literal),
      ),
    ),
  );
}

export function findNode<T extends ts.Node>(
  nodes: ts.NodeArray<ts.Node>,
  kind: T extends { kind: infer K } ? K : never,
  test?: (node: T) => boolean | undefined,
): T {
  const node = nodes.find(
    (s) => s.kind === kind && (!test || test(s as T)),
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
  name: string,
) {
  const statement = findNode<ts.VariableStatement>(
    nodes,
    ts.SyntaxKind.VariableStatement,
    (n) => getFirstDeclarationName(n) === name,
  );
  const [first] = statement.declarationList.declarations;
  if (!first) throw new Error("Missing declaration");
  return first;
}

export function changePropertyValue(
  o: ts.ObjectLiteralExpression,
  property: string,
  value: ts.Expression,
) {
  const p = o.properties.find(
    (p) => ts.isPropertyAssignment(p) && getName(p.name) === property,
  );
  if (p && ts.isPropertyAssignment(p)) {
    // p.initializer is readonly, this might break in a future TS version, but works fine for now.
    Object.assign(p, { initializer: value });
  } else {
    throw new Error(`No such property: ${property}`);
  }
}

export function appendNodes<T extends ts.Node>(
  array: ts.NodeArray<T>,
  ...nodes: T[]
) {
  return factory.createNodeArray([...array, ...nodes]);
}

export function addComment<T extends ts.Node>(node: T, comment?: string) {
  if (!comment) return node;
  return ts.addSyntheticLeadingComment(
    node,
    ts.SyntaxKind.MultiLineCommentTrivia,
    `*\n * ${comment.replace(/\n/g, "\n * ")}\n `,
    true,
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
    ts.ScriptKind.TS,
  );
  return printer.printNode(ts.EmitHint.Unspecified, node, file);
}

export function printNodes(nodes: ts.Node[]) {
  const file = ts.createSourceFile(
    "someFileName.ts",
    "",
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ false,
    ts.ScriptKind.TS,
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
    ts.identifierToKeywordKind(node) === undefined
  );
}
