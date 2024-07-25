/// <reference lib="webworker" />

import { utils } from 'xlsx';

export type WorkbookData= Record<string, string | number>[];

export type WorkbookHeaders = string[];

export type WorkbookWorkerMessage = {
  data: WorkbookData;
  header?: WorkbookHeaders;
};

addEventListener('message', ({ data }: MessageEvent<WorkbookWorkerMessage>) => {
  createWorkbook(data);
});

function createWorkbook({ data, header }: WorkbookWorkerMessage): void {
  const workbook = utils.book_new();
  const sheet = utils.json_to_sheet(data, { header });
  utils.book_append_sheet(workbook, sheet);
  postMessage(workbook);
}