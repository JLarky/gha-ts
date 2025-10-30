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
export function lines(script: string): string;
export function lines(
  strings: TemplateStringsArray,
  ...substitutions: never[]
): string;
export function lines(scriptOrStrings: string | TemplateStringsArray): string {
  const strInput =
    typeof scriptOrStrings === "string" ? scriptOrStrings : scriptOrStrings[0];
  const [, indent] = strInput.split("\n", 2).map((line) => line.search(/\S/));
  const normalized = strInput.trim() + "\n";
  if (typeof indent === "number" && indent > 0) {
    return normalized.replace(new RegExp(`^ {${indent}}`, "gm"), "");
  } else {
    return normalized;
  }
}
