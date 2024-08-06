export function stringifyParams(
  params: Record<string, unknown>
): Record<string, string> {
  const record: Record<string, string> = {};
  Object.entries(params).forEach(
    ([key, value]) => (record[key] = String(value))
  );
  return record;
}
