/**
 * use this to make yaml multiline output nicer looking. Simpler/smaller version of npm:dedent.
 *
 * @example template literal
 * ```ts
 * {
 *   run: lines`
 *     echo Hello World.
 *   `,
 * }
 * ```
 *
 * @example function call
 * ```ts
 * {
 *   run: lines(`
 *     echo Hello World.
 *   `),
 * }
 * ```
 *
 * This is equivalent to:
 * ```ts
 * {
 *   run: `
 *     echo Hello World.
 *   `.replace(/^ {12}/gm, ""), // number might be different depending on the context
 * }
 * ```
 */
export function lines(script: string | TemplateStringsArray): string {
  let str = typeof script === "string" ? script : script[0];
  const [, indent] = str.split("\n", 2).map((line) => line.search(/\S/));
  str = str.trim() + "\n";
  if (typeof indent === "number" && indent > 0) {
    return str.replace(new RegExp(`^ {${indent}}`, "gm"), "");
  } else {
    return str;
  }
}
