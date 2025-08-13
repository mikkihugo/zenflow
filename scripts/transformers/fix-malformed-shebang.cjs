/**
 * Fix malformed shebang/comment syntax
 * Separates merged shebang lines from JSDoc comments
 */

module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const lines = fileInfo.source.split('\n');
  let transformCount = 0;

  // Check if first line has malformed shebang
  if (lines.length > 0) {
    const firstLine = lines[0];

    // Pattern: #!/usr/bin/env node/**
    const malformedShebangPattern = /^(#!\/usr\/bin\/env\s+node)\/\*\*/;
    const match = firstLine.match(malformedShebangPattern);

    if (match) {
      console.log(`🔧 Fixing malformed shebang in ${fileInfo.path}`);

      // Split the malformed line
      const shebang = match[1]; // #!/usr/bin/env node
      const commentStart = '/**'; // JSDoc comment start

      // Replace first line with proper shebang
      lines[0] = shebang;

      // Insert comment start as second line
      lines.splice(1, 0, commentStart);

      transformCount = 1;

      console.log(
        `✅ Fixed: "${firstLine}" → "${shebang}" + "${commentStart}"`
      );
    }
  }

  // Check for other common malformed patterns
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Pattern: #!/path/to/interpreter/**
    const generalShebangPattern = /^(#!.*?)\/\*\*/;
    const generalMatch = line.match(generalShebangPattern);

    if (generalMatch && i === 0) {
      // Only fix first line shebangs
      console.log(
        `🔧 Fixing general malformed shebang in ${fileInfo.path} line ${i + 1}`
      );

      const shebang = generalMatch[1];
      const commentStart = '/**';

      lines[i] = shebang;
      lines.splice(i + 1, 0, commentStart);

      transformCount++;
      console.log(
        `✅ Fixed line ${i + 1}: "${line}" → "${shebang}" + "${commentStart}"`
      );
    }
  }

  if (transformCount > 0) {
    console.log(
      `✅ Fixed ${transformCount} malformed shebang(s) in ${fileInfo.path}`
    );
    return lines.join('\n');
  }

  return null; // No changes needed
};
