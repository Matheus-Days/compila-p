import {
  AfterViewInit,
  Component,
  computed,
  inject,
  viewChild
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule, MatSelectionList } from '@angular/material/list';
import { WorkbooksStore } from '../../stores/workbooks.store';
import {
  WORKSHEET_OPTS_LABELS,
  WorksheetOptionObject
} from '../../stores/workbooks.utils';

type WorksheetResult = WorksheetOptionObject & { selected: boolean };

@Component({
  selector: 'cmp-worksheet-results',
  standalone: true,
  templateUrl: './worksheet-results.component.html',
  styleUrl: './worksheet-results.component.scss',
  imports: [MatButtonModule, MatListModule]
})
export class WorksheetResultsComponent implements AfterViewInit {
  store = inject(WorkbooksStore);

  list = viewChild.required(MatSelectionList);

  worksheetResults = computed<WorksheetResult[]>(() => {
    return this.store.availableWorksheets().map((worksheet) => {
      return {
        label: WORKSHEET_OPTS_LABELS[worksheet],
        value: worksheet,
        selected: this.store.selectedWorksheetResults().includes(worksheet)
      };
    });
  });

  ngAfterViewInit(): void {
    this.list().selectionChange.subscribe((event) => {
      const selected = event.source.selectedOptions.selected;
      const selectedWorksheets = selected
        .filter((opt) => opt.selected)
        .map((opt) => opt.value);

      this.store.selectWorksheetResults(selectedWorksheets);
    });
  }

  async download(): Promise<void> {
    await this.store.createWorkbook();
    this.store.downloadWorkbook();
  }
}
