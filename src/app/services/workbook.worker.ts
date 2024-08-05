/// <reference lib="webworker" />

import { utils } from 'xlsx';

export type WorkbookData= Record<string, string | number>[];

export type WorkbookHeaders = string[];

export type WorkbookWorkerMessage = {
  worksheets: {
    data: WorkbookData;
    header?: WorkbookHeaders;
    name: string;
  }[]
};

addEventListener('message', ({ data }: MessageEvent<WorkbookWorkerMessage>) => {
  createWorkbook(data);
});

function createWorkbook(worksheets: WorkbookWorkerMessage): void {
  const workbook = utils.book_new();
  worksheets.worksheets.forEach(({ data, header, name }) => {
    const sheet = utils.json_to_sheet(data, { header });
    utils.book_append_sheet(workbook, sheet, name);
  });
  postMessage(workbook);
}