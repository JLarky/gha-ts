import { describe, expect, test } from "bun:test";
import { lines } from "@jlarky/gha-ts/utils";

describe("lines helper", () => {
  test("template literal usage - removes common indentation", () => {
    const result = lines`
      echo Hello World.
      echo Another line.
    `;
    expect(result).toBe("echo Hello World.\necho Another line.\n");
  });

  test("function call usage - removes common indentation", () => {
    const result = lines(`
      echo Hello World.
      echo Another line.
    `);
    expect(result).toBe("echo Hello World.\necho Another line.\n");
  });

  test("real-world example from workflow - multiline shell script", () => {
    const result = lines`
      CHANGED="$(git --no-pager diff --name-only)";
      if [ -n "$CHANGED" ]; then
        echo "::error title=TS workflows are not up to date::Run 'mise run workflows:build' locally, commit, and push.";
        echo "::group::Changed files";
        echo "$CHANGED";
        echo "::endgroup::";
        while IFS= read -r file; do
          [ -z "$file" ] && continue;
          echo "::notice file=$file,line=1,title=Changed file::Update generated YAML for this file";
        done <<< "$CHANGED";
        {
          echo "### TS workflows are not up to date";
          echo;
          echo "Run: mise run workflows:build";
          echo;
          echo "Then commit the updated files and push.";
          echo;
          echo "Changed files:";
          echo;
          echo "$CHANGED" | awk '{print "- " $0}';
        } >> "$GITHUB_STEP_SUMMARY";
        exit 1;
      fi`;

    expect(result).toContain('CHANGED="$(git --no-pager diff --name-only)";');
    expect(result).toContain('if [ -n "$CHANGED" ]; then');
    expect(result).not.toContain("      CHANGED="); // Should not have leading spaces
    expect(result).toContain('  echo "::error'); // Should preserve relative indentation
  });

  test("handles single line", () => {
    const result = lines`echo Hello`;
    expect(result).toBe("echo Hello\n");
  });

  test("handles empty content after trimStart", () => {
    const result = lines``;
    expect(result).toBe("\n");
  });

  test("handles string with no indentation", () => {
    const result = lines(`echo Hello
echo World`);
    expect(result).toBe("echo Hello\necho World\n");
  });

  test("preserves relative indentation", () => {
    const result = lines`
      if true; then
        echo "indented"
          echo "more indented"
      fi
    `;
    expect(result).toBe(
      'if true; then\n  echo "indented"\n    echo "more indented"\nfi\n',
    );
  });

  test("handles mixed indentation levels", () => {
    const result = lines`
      line1
        line2
      line3
    `;
    expect(result).toBe("line1\n  line2\nline3\n");
  });

  test("trims leading whitespace before first content", () => {
    const result = lines`

      echo Hello
    `;
    // The implementation removes one leading blank line, leaving one newline before content
    expect(result).toBe("\necho Hello\n");
  });

  test("handles content with varying indentation", () => {
    const result = lines`
      first
          deeply indented
      back to start
    `;
    expect(result).toBe("first\n    deeply indented\nback to start\n");
  });

  test("works with tabs (though spaces are recommended)", () => {
    // Note: This uses actual tab characters
    const result = lines(`
		echo with tabs
			echo more tabs
		echo back`);
    expect(result.startsWith("echo with tabs")).toBe(true);
  });

  test("handles Windows-style line endings (CRLF)", () => {
    const result = lines("      echo Hello\r\n      echo World\r\n    ");
    expect(result).toContain("echo Hello");
    expect(result).toContain("echo World");
  });

  test("nested usage in workflow step", () => {
    // Simulate how it's used in actual workflow code
    const step = {
      name: "Test Step",
      run: lines`
        echo "Starting test"
        npm run test
        echo "Test complete"
      `,
    };

    expect(step.run).toBe(
      'echo "Starting test"\nnpm run test\necho "Test complete"\n',
    );
    expect(step.run).not.toMatch(/^[ ]+echo/); // No leading spaces on first line before content
  });

  test("deeply nested indentation context", () => {
    // This simulates usage deep in nested code
    function getRunCommand() {
      return {
        run: lines`
          echo nested
          echo deeply
        `,
      };
    }

    const cmd = getRunCommand();
    expect(cmd.run).toBe("echo nested\necho deeply\n");
  });

  test("handles only whitespace lines", () => {
    const result = lines`
      first line
      
      last line
    `;
    expect(result).toBe("first line\n\nlast line\n");
  });

  test("preserves trailing spaces on individual lines", () => {
    // Note: The function only trims the start/end of the entire string,
    // not trailing spaces on individual lines within the content
    const result = lines`
      line1   
      line2
      line3
    `;
    expect(result).toBe("line1   \nline2\nline3\n");
    // Verify trailing spaces are preserved on line1
    expect(result.split("\n")[0]).toBe("line1   ");
  });

  test("handles template literal with interpolation", () => {
    // The implementation now supports template literal substitutions
    const world = "World";
    const result = lines`hello ${world}`;
    expect(result).toBe("hello World\n");
  });

  test("handles template literal without interpolation", () => {
    const result = lines`hello \${world}`;
    expect(result).toBe("hello ${world}\n");
  });
});
