export function truncateBoardTitle(value: string, maxLength = 48) {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength)}...`;
}

export function hasAttachment(fileName: string | null | undefined) {
  return !!fileName?.trim();
}
