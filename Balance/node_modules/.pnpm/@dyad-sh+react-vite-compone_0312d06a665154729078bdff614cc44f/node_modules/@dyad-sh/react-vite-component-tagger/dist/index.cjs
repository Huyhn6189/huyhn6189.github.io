"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => dyadTagger
});
module.exports = __toCommonJS(index_exports);
var import_parser = require("@babel/parser");
var import_magic_string = __toESM(require("magic-string"), 1);
var import_node_path = __toESM(require("path"), 1);
var import_estree_walker = require("estree-walker");
var VALID_EXTENSIONS = /* @__PURE__ */ new Set([".jsx", ".tsx"]);
function dyadTagger() {
  return {
    name: "vite-plugin-dyad-tagger",
    apply: "serve",
    enforce: "pre",
    async transform(code, id) {
      try {
        if (!VALID_EXTENSIONS.has(import_node_path.default.extname(id)) || id.includes("node_modules"))
          return null;
        const ast = (0, import_parser.parse)(code, {
          sourceType: "module",
          plugins: ["jsx", "typescript"]
        });
        const ms = new import_magic_string.default(code);
        const fileRelative = import_node_path.default.relative(process.cwd(), id);
        (0, import_estree_walker.walk)(ast, {
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
