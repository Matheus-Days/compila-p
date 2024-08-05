import { Injectable } from '@angular/core';
import { WorkBook, writeFile } from 'xlsx';
import { WorkbookWorkerMessage } from './workbook.worker';

@Injectable({
  providedIn: 'root'
})
export class WorkbookService {
  async createWorkbook(data: WorkbookWorkerMessage): Promise<WorkBook> {
    return new Promise((resolve, reject) => {
      if (typeof Worker === 'undefined')
        return reject('Web Workers are not supported in this environment.');

      const worker = new Worker(
        new URL('./workbook.worker.ts', import.meta.url),
        {
          type: 'module'
        }
      );

      worker.onmessage = ({ data }: MessageEvent<WorkBook>) => {
        resolve(data);
        worker.terminate();
      };

      worker.onerror = (e) => {
        reject(e);
        worker.terminate();
      };

      worker.postMessage(data);
    });
  }

  async downloadWorkbook(workbook: WorkBook, filename: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        resolve(writeFile(workbook, filename, { bookType: 'xlsx' }));
      } catch (error) {
        reject(error);
      }
    });
  }
}
