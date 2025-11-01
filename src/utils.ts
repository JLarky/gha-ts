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
  ...substitutions: unknown[]
): string;
export function lines(
  scriptOrStrings: string | TemplateStringsArray,
  ...substitutions: unknown[]
): string {
  let strInput: string;
  if (typeof scriptOrStrings === "string") {
    strInput = scriptOrStrings;
  } else {
    const parts: string[] = [scriptOrStrings[0] ?? ""];
    for (let i = 0; i < substitutions.length; i++) {
      parts.push(String(substitutions[i]));
      parts.push(scriptOrStrings[i + 1] ?? "");
    }
    strInput = parts.join("");
  }

  if (!strInput) {
    return "\n";
  }

  let linesArray = strInput.split("\n");

  if (linesArray.length > 0 && /^\s*$/.test(linesArray[0]!)) {
    linesArray = linesArray.slice(1);
  }

  if (
    linesArray.length > 0 &&
    /^\s*$/.test(linesArray[linesArray.length - 1]!)
  ) {
    linesArray = linesArray.slice(0, -1);
  }

  if (linesArray.length === 0) {
    return "\n";
  }

  let minIndent = Infinity;
  let hasAnyIndentation = false;

  for (let i = 0; i < linesArray.length; i++) {
    const line = linesArray[i];
    if (line) {
      const leadingWhitespace = line.match(/^(\s+)/)?.[1];
      if (leadingWhitespace) {
        hasAnyIndentation = true;
        const whitespaceLength = leadingWhitespace.length;
        if (whitespaceLength < minIndent) {
          minIndent = whitespaceLength;
        }
      }
    }
  }

  if (hasAnyIndentation && minIndent > 0 && minIndent !== Infinity) {
    return (
      linesArray
        .map((line) => {
          if (line && line.length >= minIndent) {
            const leadingWhitespace = line.match(/^(\s+)/)?.[1];
            if (leadingWhitespace && leadingWhitespace.length >= minIndent) {
              return line.slice(minIndent);
            }
          }
          return line;
        })
        .join("\n") + "\n"
    );
  } else {
    return linesArray.join("\n") + "\n";
  }
}
