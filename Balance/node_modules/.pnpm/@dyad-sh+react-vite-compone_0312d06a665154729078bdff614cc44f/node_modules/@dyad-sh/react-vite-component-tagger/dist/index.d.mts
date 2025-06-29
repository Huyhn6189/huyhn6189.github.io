import { Plugin } from 'vite';

/**
 * Returns a Vite / esbuild plug-in.
 */
declare function dyadTagger(): Plugin;

export { dyadTagger as default };
