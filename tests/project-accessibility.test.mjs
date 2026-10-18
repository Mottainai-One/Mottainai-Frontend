import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import ts from "typescript";
import { getContrastRatio } from "../src/utils/accessibilityColorContrast.ts";

const sourceRoot = path.resolve("src");
const accessibilityCss = await readFile(path.resolve("src/styles/accessibility.css"), "utf8");
const documentHtml = await readFile(path.resolve("index.html"), "utf8");

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(entries.map((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
  }));
  return nestedFiles.flat();
}

function walk(node, visitor) {
  visitor(node);
  ts.forEachChild(node, (child) => walk(child, visitor));
}

const sourceFiles = await listFiles(sourceRoot);
const typedSourceFiles = sourceFiles.filter((file) => /\.(?:ts|tsx)$/.test(file));

test("src contains no JavaScript source files", () => {
  assert.deepEqual(sourceFiles.filter((file) => /\.(?:js|jsx)$/.test(file)), []);
});

test("src has no explicit any types, unsafe HTML injection, or direct fetch calls", async () => {
  const violations = [];
  for (const file of typedSourceFiles) {
    const source = ts.createSourceFile(file, await readFile(file, "utf8"), ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    walk(source, (node) => {
      if (node.kind === ts.SyntaxKind.AnyKeyword) violations.push(`${file}: any`);
      if (ts.isJsxAttribute(node) && node.name.getText(source) === "dangerouslySetInnerHTML") violations.push(`${file}: dangerouslySetInnerHTML`);
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "fetch" && !file.includes(`${path.sep}services${path.sep}`)) {
        violations.push(`${file}: fetch outside services`);
      }
      if (ts.isJsxAttribute(node) && node.name.getText(source) === "key" && node.initializer && ts.isJsxExpression(node.initializer) && node.initializer.expression?.getText(source) === "index") {
        violations.push(`${file}: key={index}`);
      }
    });
  }
  assert.deepEqual(violations, []);
});

test("useState values are not mutated directly", async () => {
  const mutatingMethods = new Set(["push", "pop", "splice", "sort", "reverse", "shift", "unshift", "fill", "copyWithin"]);
  const violations = [];
  for (const file of typedSourceFiles) {
    const source = ts.createSourceFile(file, await readFile(file, "utf8"), ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const stateNames = new Set();
    walk(source, (node) => {
      if (!ts.isVariableDeclaration(node) || !node.initializer || !ts.isArrayBindingPattern(node.name)) return;
      if (!ts.isCallExpression(node.initializer) || !ts.isIdentifier(node.initializer.expression) || node.initializer.expression.text !== "useState") return;
      const stateValue = node.name.elements[0]?.name;
      if (stateValue && ts.isIdentifier(stateValue)) stateNames.add(stateValue.text);
    });

    const rootIdentifier = (node) => {
      let current = node;
      while (ts.isPropertyAccessExpression(current) || ts.isElementAccessExpression(current) || ts.isParenthesizedExpression(current)) {
        current = ts.isParenthesizedExpression(current) ? current.expression : current.expression;
      }
      return ts.isIdentifier(current) ? current.text : null;
    };
    walk(source, (node) => {
      if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
        const root = rootIdentifier(node.expression.expression);
        if (root && stateNames.has(root) && mutatingMethods.has(node.expression.name.text)) {
          violations.push(`${file}: ${root}.${node.expression.name.text}()`);
        }
      }
      if (ts.isBinaryExpression(node) && node.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && node.operatorToken.kind <= ts.SyntaxKind.LastAssignment) {
        const root = rootIdentifier(node.left);
        if (root && stateNames.has(root)) violations.push(`${file}: atribuição direta em ${root}`);
      }
    });
  }
  assert.deepEqual(violations, []);
});

test("every form input has an explicit matching label and images declare alt text", async () => {
  const violations = [];
  for (const file of typedSourceFiles.filter((entry) => entry.endsWith(".tsx"))) {
    const source = ts.createSourceFile(file, await readFile(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const inputs = [];
    const labels = new Set();
    const imageNodes = [];
    walk(source, (node) => {
      if (!ts.isJsxOpeningElement(node) && !ts.isJsxSelfClosingElement(node)) return;
      const tagName = node.tagName.getText(source);
      const attributes = node.attributes.properties;
      const attribute = (name) => attributes.find((item) => ts.isJsxAttribute(item) && item.name.getText(source) === name);
      const attributeValue = (name) => {
        const initializer = attribute(name)?.initializer;
        if (initializer && ts.isStringLiteral(initializer)) return `string:${initializer.text}`;
        if (initializer && ts.isJsxExpression(initializer) && initializer.expression) return `expression:${initializer.expression.getText(source)}`;
        return null;
      };

      if (tagName === "label" && attributeValue("htmlFor")) labels.add(attributeValue("htmlFor"));
      if (tagName === "input" && attributeValue("type") !== "string:hidden") {
        inputs.push({ id: attributeValue("id"), label: attributeValue("aria-label") });
      }
      if (tagName === "img") imageNodes.push(attribute("alt"));
    });

    for (const input of inputs) {
      if (!input.id || !labels.has(input.id)) violations.push(`${file}: input sem label htmlFor correspondente`);
    }
    for (const image of imageNodes) {
      if (!image) violations.push(`${file}: imagem sem atributo alt`);
    }
  }
  assert.deepEqual(violations, []);
});

test("interactive actions do not use clickable divs", async () => {
  const violations = [];
  for (const file of typedSourceFiles.filter((entry) => entry.endsWith(".tsx"))) {
    const source = ts.createSourceFile(file, await readFile(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    walk(source, (node) => {
      if (!ts.isJsxOpeningElement(node) && !ts.isJsxSelfClosingElement(node)) return;
      if (node.tagName.getText(source) === "div" && node.attributes.properties.some((attribute) => ts.isJsxAttribute(attribute) && attribute.name.getText(source) === "onClick")) {
        violations.push(`${file}: div com onClick`);
      }
    });
  }
  assert.deepEqual(violations, []);
});

test("high-use text colors meet WCAG AA contrast on white", () => {
  assert.ok(getContrastRatio("#a84b00", "#ffffff") >= 4.5);
  assert.ok(getContrastRatio("#783800", "#ffffff") >= 4.5);
  assert.ok(getContrastRatio("#625d58", "#ffffff") >= 4.5);
  assert.ok(getContrastRatio("#a84b00", "#ffffff") >= 3, "focus indicator meets non-text contrast");
});

test("document language, skip links, landmarks, focus, and high-contrast mode are present", async () => {
  assert.match(documentHtml, /<html\s+lang="pt-BR"/i);
  const [authLayout, mainLayout] = await Promise.all([
    readFile(path.resolve("src/components/AuthLayout/index.tsx"), "utf8"),
    readFile(path.resolve("src/components/MainLayout/index.tsx"), "utf8"),
  ]);
  assert.match(authLayout, /<a[^>]+href="#auth-main"[^>]*>\s*Pular para o conteúdo principal/);
  assert.match(authLayout, /<main[^>]+id="auth-main"/);
  assert.match(mainLayout, /<a[^>]+href="#main-content"/);
  assert.match(mainLayout, /<main[^>]+id="main-content"/);
  assert.match(accessibilityCss, /:focus-visible\s*\{[\s\S]*?outline:\s*3px solid/);
  assert.match(accessibilityCss, /html\[data-a11y-contrast="high"\] body[\s\S]*?background-color:\s*#000\s*!important/);
  assert.match(accessibilityCss, /html\[data-a11y-contrast="high"\] body #root a[\s\S]*?color:\s*#ffeb3b\s*!important/);
  assert.match(accessibilityCss, /html\[data-a11y-contrast="high"\] body #root :where\(button, input, select, textarea\)[\s\S]*?border:\s*2px solid #fff\s*!important/);
  assert.ok(getContrastRatio("#ffffff", "#000000") >= 7);
  assert.ok(getContrastRatio("#ffeb3b", "#000000") >= 7);
});
