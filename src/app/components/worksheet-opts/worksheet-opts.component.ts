import { AfterViewInit, Component, computed, inject, signal, viewChild } from '@angular/core';
import { MatListModule, MatSelectionList } from '@angular/material/list';
import { ActivatedRoute, Router } from '@angular/router';
import { WORKSHEET_OPTIONS, WorksheetOption, WorksheetOptionObject } from '../../stores/worksheet.utils';
import { MatDividerModule } from '@angular/material/divider';

type SelectableWorksheetOpt = WorksheetOptionObject & { selected: boolean };

@Component({
  selector: 'cmp-worksheet-opts',
  standalone: true,
  templateUrl: './worksheet-opts.component.html',
  styleUrl: './worksheet-opts.component.scss',
  imports: [MatDividerModule, MatListModule]
})
export class WorksheetOptsComponent implements AfterViewInit {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  private worksheets = viewChild.required(MatSelectionList);

  selectedOpts = signal<WorksheetOption[]>([]);

  worksheetOpts = computed<SelectableWorksheetOpt[]>(() => {
    return WORKSHEET_OPTIONS.map((worksheet) => {
      return {
        label: worksheet.label,
        value: worksheet.value,
        selected: this.selectedOpts().includes(worksheet.value)
      };
    });
  });

  ngAfterViewInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      const selectedWorksheets = params['worksheets']
        ? decodeURI(params['worksheets']).split(',')
        : [];

      this.selectedOpts.set(selectedWorksheets as WorksheetOption[]);
    });

    this.worksheets().selectionChange.subscribe((event) => {
      const selectedOptions = event.source.selectedOptions.selected
        .filter((option) => option.selected)
        .map((option) => option.value)
        .join(',');

      const queryParams = selectedOptions
        ? { worksheets: encodeURI(selectedOptions) }
        : null;

      this.router.navigate([], {
        queryParams,
        queryParamsHandling: queryParams ? 'merge' : null
      });
    });
  }
}
