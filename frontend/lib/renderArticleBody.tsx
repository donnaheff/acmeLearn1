// Articles are authored as plain text with blank-line-separated paragraphs
// and "## Heading" lines for section breaks — enough structure for the
// admin editor and public article page without pulling in a markdown lib.
export function renderArticleBody(body: string) {
  const blocks = body.trim().split(/\n\s*\n/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (trimmed.startsWith('## ')) {
      return <h2 key={i}>{trimmed.slice(3).trim()}</h2>;
    }
    return <p key={i}>{trimmed}</p>;
  });
}
