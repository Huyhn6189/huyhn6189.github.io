// src/index.ts
import { parse } from "@babel/parser";
import MagicString from "magic-string";
import path from "path";
import { walk } from "estree-walker";
var VALID_EXTENSIONS = /* @__PURE__ */ new Set([".jsx", ".tsx"]);
function dyadTagger() {
  return {
    name: "vite-plugin-dyad-tagger",
    apply: "serve",
    enforce: "pre",
    async transform(code, id) {
      try {
        if (!VALID_EXTENSIONS.has(path.extname(id)) || id.includes("node_modules"))
          return null;
        const ast = parse(code, {
          sourceType: "module",
          plugins: ["jsx", "typescript"]
        });
        const ms = new MagicString(code);
        const fileRelative = path.relative(process.cwd(), id);
        walk(ast, {
          enter(node) {
            try {
              if (node.type !== "JSXOpeningElement") return;
              if (node.name?.type !== "JSXIdentifier") return;
              const tagName = node.name.name;
              if (!tagName) return;
              const alreadyTagged = node.attributes?.some(
                (attr) => attr.type === "JSXAttribute" && attr.name?.name === "data-dyad-id"
              );
              if (alreadyTagged) return;
              const loc = node.loc?.start;
              if (!loc) return;
              const dyadId = `${fileRelative}:${loc.line}:${loc.column}`;
              if (node.name.end != null) {
                ms.appendLeft(
                  node.name.end,
                  ` data-dyad-id="${dyadId}" data-dyad-name="${tagName}"`
                );
              }
            } catch (error) {
              console.warn(
                `[dyad-tagger] Warning: Failed to process JSX node in ${id}:`,
                error
              );
            }
          }
        });
        if (ms.toString() === code) return null;
        return {
          code: ms.toString(),
          map: ms.generateMap({ hires: true })
        };
      } catch (error) {
        console.warn(
          `[dyad-tagger] Warning: Failed to transform ${id}:`,
          error
        );
        return null;
      }
    }
  };
}
export {
  dyadTagger as default
};
