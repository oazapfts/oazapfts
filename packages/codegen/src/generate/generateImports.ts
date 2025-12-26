import ts from "typescript";
import type { Import, ImportSpecifier } from "../context";

/**
 * Convert an Import definition to a TypeScript ImportDeclaration AST node.
 *
 * Supported formats:
 * - string: side-effect import `import "module";`
 * - [specifiers[], { from }]: named imports `import { a, b } from "module";`
 * - [default, { from }]: default import `import X from "module";`
 * - [default, specifiers[], { from }]: default + named `import X, { a } from "module";`
 * - [{ namespace }, { from }]: namespace import `import * as X from "module";`
 */
export function createImportStatement(imp: Import): ts.ImportDeclaration {
  // Side-effect import: import "module";
  if (typeof imp === "string") {
    return ts.factory.createImportDeclaration(
      undefined,
      undefined,
      ts.factory.createStringLiteral(imp),
    );
  }

  // Namespace import: [{ namespace: "X" }, { from: "module" }]
  if (imp.length === 2 && typeof imp[0] === "object" && "namespace" in imp[0]) {
    const [{ namespace }, { from }] = imp as [
      { namespace: string },
      { from: string },
    ];
    return ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(
        false,
        undefined,
        ts.factory.createNamespaceImport(
          ts.factory.createIdentifier(namespace),
        ),
      ),
      ts.factory.createStringLiteral(from),
    );
  }

  // Default import: ["Default", { from: "module" }]
  if (
    imp.length === 2 &&
    typeof imp[0] === "string" &&
    typeof imp[1] === "object" &&
    "from" in imp[1]
  ) {
    const [defaultName, { from }] = imp as [string, { from: string }];
    return ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(
        false,
        ts.factory.createIdentifier(defaultName),
        undefined,
      ),
      ts.factory.createStringLiteral(from),
    );
  }

  // Named imports: [[specifiers], { from: "module" }]
  if (imp.length === 2 && Array.isArray(imp[0])) {
    const [specifiers, { from }] = imp as [
      (ImportSpecifier | string)[],
      { from: string },
    ];
    return ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(
        false,
        undefined,
        ts.factory.createNamedImports(specifiers.map(createImportSpecifier)),
      ),
      ts.factory.createStringLiteral(from),
    );
  }

  // Default + named imports: ["Default", [specifiers], { from: "module" }]
  if (imp.length === 3) {
    const [defaultName, specifiers, { from }] = imp as [
      string,
      (ImportSpecifier | string)[],
      { from: string },
    ];
    return ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(
        false,
        ts.factory.createIdentifier(defaultName),
        ts.factory.createNamedImports(specifiers.map(createImportSpecifier)),
      ),
      ts.factory.createStringLiteral(from),
    );
  }

  throw new Error(`Invalid import format: ${JSON.stringify(imp)}`);
}

function createImportSpecifier(
  spec: ImportSpecifier | string,
): ts.ImportSpecifier {
  if (typeof spec === "string") {
    return ts.factory.createImportSpecifier(
      false,
      undefined,
      ts.factory.createIdentifier(spec),
    );
  }
  return ts.factory.createImportSpecifier(
    false,
    spec.as ? ts.factory.createIdentifier(spec.name) : undefined,
    ts.factory.createIdentifier(spec.as || spec.name),
  );
}
