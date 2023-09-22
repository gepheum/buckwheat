export function prefixEachLinePastFirst(text: string, prefix: string): string {
  return text.replace(/\r|\n|\r\n/g, `$&${prefix}`);
}

export function prefixEachLine(text: string, prefix: string): string {
  return text.replace(/^|\r|\n|\r\n/g, `$&${prefix}`);
}

export function indentText(stringable: unknown): string {
  return prefixEachLine(String(stringable), "  ");
}

export function commentOut(text: string): string {
  return prefixEachLine(text, "// ");
}

export function makeRed(text: string): string {
  return `\x1b[31m${text}\x1b[0m`;
}

export function makeCyan(text: string): string {
  return `\x1b[36m${text}\x1b[0m`;
}
