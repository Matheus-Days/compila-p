import { Component, computed, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { map } from 'rxjs';

export type MonthValue =
  | '00'
  | '01'
  | '02'
  | '03'
  | '04'
  | '05'
  | '06'
  | '07'
  | '08'
  | '09'
  | '10'
  | '11'
  | '12';

export const MONTHS_VALUES: MonthValue[] = [
  '00',
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12'
];

export const MONTHS_MAP: Record<MonthValue, string> = {
  '00': 'Ano completo',
  '01': 'Janeiro',
  '02': 'Fevereiro',
  '03': 'Março',
  '04': 'Abril',
  '05': 'Maio',
  '06': 'Junho',
  '07': 'Julho',
  '08': 'Agosto',
  '09': 'Setembro',
  '10': 'Outubro',
  '11': 'Novembro',
  '12': 'Dezembro'
};

@Component({
  selector: 'cmp-months-select',
  standalone: true,
  imports: [
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  templateUrl: './months-select.component.html',
  styleUrl: './months-select.component.scss'
})
export class MonthsSelectComponent {
  readonly MONTHS_MAP = MONTHS_MAP;

  label = input('Mês');
  multiple = input(false);
  disableSelectAll = input(false);
  control = input<FormControl>(new FormControl(this.multiple() ? [] : '00'));

  isAllSelected = toSignal(
    this.control().valueChanges.pipe(
      map((val) => val.length === MONTHS_VALUES.length)
    )
  );

  monthValues = computed(() => {
    if (this.multiple()) return MONTHS_VALUES.filter((m) => m !== '00');
    else return MONTHS_VALUES;
  });

  toggleSelectAll(): void {
    if (this.control().value.length === this.monthValues().length) {
      this.control().setValue([]);
    } else {
      this.control().setValue(this.monthValues());
    }
  }
}
