/// <reference lib="webworker" />

import { stringifyParams } from './utils';

export type SearchParams = object & {
  deslocamento: number;
};

export type FetchWorkerMessage = {
  url: string;
  searchParams: SearchParams;
};

export type EnhancedFetchWorkerResponse<T = object> = {
  data: T;
  progress: number;
};

type ApiResponse = {
  data: {
    data: object[];
    length: number;
    total: number;
  };
};

addEventListener('message', ({ data }: MessageEvent<FetchWorkerMessage>) => {
  const { url, searchParams } = data;
  fetchAll(url, searchParams);
});

async function fetchAll(
  url: string,
  searchParams: SearchParams,
  previousResults: object[] = [],
  retry = 0
): Promise<void> {
  const params = new URLSearchParams(stringifyParams(searchParams));
  const searchQueryUrl = `${url}?${params}`;

  const result: ApiResponse = await (await fetch(searchQueryUrl)).json();

  if (result.data.length === 0) retry += 1;
  else retry = 0;

  previousResults.push(...result.data.data);
  const progress = previousResults.length / result.data.total;

  if (progress === 1 || retry > 1) {
    sendResponse({ data: previousResults, progress: 1 });
    return;
  }

  sendResponse({ data: [], progress });

  fetchAll(
    url,
    {
      ...searchParams,
      deslocamento: searchParams.deslocamento + 100
    },
    previousResults,
    retry
  );
}

function sendResponse(res: EnhancedFetchWorkerResponse): void {
  postMessage(res);
}
