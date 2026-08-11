const ENTRIES: [string, string][] = [
  ["Bold", "**bold**"],
  ["Italic", "*italic*"],
  ["Strikethrough", "~~text~~"],
  ["Heading", "## Heading"],
  ["Subheading", "### Subheading"],
  ["Link", "[text](https://example.com)"],
  ["Bullet list", "- item"],
  ["Numbered list", "1. item"],
  ["Blockquote", "> quoted text"],
  ["Inline code", "`code`"],
  ["Code block", "```js\ncode\n```"],
  ["Table", "| a | b |\n|---|---|\n| 1 | 2 |"],
  ["Task list", "- [ ] todo\n- [x] done"],
  ["Horizontal rule", "---"],
];

export function FormattingHelp() {
  return (
    <details className="formatting-help">
      <summary>Formatting help</summary>
      <table>
        <tbody>
          {ENTRIES.map(([label, syntax]) => (
            <tr key={label}>
              <td>{label}</td>
              <td>
                <code>{syntax}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Use <code>##</code>/<code>###</code>, not <code>#</code> — that&apos;s reserved for the post title. Tag
        code blocks with a language (```js, ```python, ...) for syntax highlighting. Images
        (<code>![alt](url)</code>) render but aren&apos;t optimized yet.
      </p>
    </details>
  );
}
