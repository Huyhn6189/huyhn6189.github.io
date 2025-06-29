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
          if (node.type !== "JSXOpeningElement") return;
          if (node.name.type !== "JSXIdentifier") return;
          const tagName = node.name.name;
          const alreadyTagged = node.attributes.some(
            (attr) => attr.type === "JSXAttribute" && attr.name.name === "data-dyad-id"
          );
          if (alreadyTagged) return;
          const loc = node.loc.start;
          const dyadId = `${fileRelative}:${loc.line}:${loc.column}`;
          ms.appendLeft(
            node.name.end,
            ` data-dyad-id="${dyadId}" data-dyad-name="${tagName}"`
          );
        }
      });
      if (ms.toString() === code) return null;
      return {
        code: ms.toString(),
        map: ms.generateMap({ hires: true })
      };
    }
  };
}
export {
  dyadTagger as default
};
