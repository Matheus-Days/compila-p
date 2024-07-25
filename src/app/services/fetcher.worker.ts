/// <reference lib="webworker" />

export type SearchParams = object & {
  deslocamento: number;
};

export type FetchWorkerMessage = {
  url: string;
  searchParams: SearchParams;
};

addEventListener('message', ({ data }: MessageEvent<FetchWorkerMessage>) => {
  const { url, searchParams } = data;
  fetchAll(url, searchParams);
});

async function fetchAll(
  url: string,
  searchParams: SearchParams,
  previousResults: object[] = []
): Promise<void> {
  const params = new URLSearchParams(stringifyParams(searchParams));
  const searchQueryUrl = `${url}?${params}`;

  const result = await (await fetch(searchQueryUrl)).json();

  if (result.data.length === 0) {
    postMessage(previousResults);
  } else {
    previousResults.push(...findData(result));

    fetchAll(
      url,
      {
        ...searchParams,
        deslocamento: searchParams.deslocamento + 100
      },
      previousResults
    );
  }
}

function stringifyParams(params: SearchParams): Record<string, string> {
  const record: Record<string, string> = {};
  Object.entries(params).forEach(
    ([key, value]) => (record[key] = String(value))
  );
  return record;
}

type FlatData = { data: object[] };
type NestedData = { data: { data: object[] } };

function findData(result: object): object[] {
  if (typeof result === 'object' && 'data' in result && Array.isArray(result.data)) {
    return (result as FlatData).data;
  } else {
    return (result as NestedData).data.data;
  }
}
