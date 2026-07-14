export function truncateNoticePopupTitle(value: string, maxLength = 48) {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength)}...`;
}

export function hasAttachment(fileName: string | null | undefined) {
  return !!fileName?.trim();
}

export function formatDisplayPeriod(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
) {
  const start = startDate?.trim();
  const end = endDate?.trim();

  if (start && end) {
    return `${start} ~ ${end}`;
  }

  if (start) {
    return `${start} ~`;
  }

  if (end) {
    return `~ ${end}`;
  }

  return "—";
}
