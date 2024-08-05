import { AfterViewInit, Component, inject, viewChild } from '@angular/core';
import { MatListModule, MatSelectionList } from '@angular/material/list';
import { ActivatedRoute, Router } from '@angular/router';
import { WORKSHEET_OPTIONS } from '../../stores/workbooks.utils';

@Component({
  selector: 'cmp-worksheet-opts',
  standalone: true,
  templateUrl: './worksheet-opts.component.html',
  styleUrl: './worksheet-opts.component.scss',
  imports: [MatListModule]
})
export class WorksheetOptsComponent implements AfterViewInit {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  private worksheets = viewChild.required(MatSelectionList);

  readonly WORKSHEET_OPTIONS = WORKSHEET_OPTIONS;

  ngAfterViewInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      const selectedWorksheets = params['worksheets']
        ? decodeURI(params['worksheets']).split(',')
        : [];

      this.worksheets().options.forEach((option) => {
        option.selected = selectedWorksheets.includes(option.value);
      });
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
