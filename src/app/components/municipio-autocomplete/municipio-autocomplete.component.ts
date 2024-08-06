import { Component, computed, inject, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { WorkbooksStore } from '../../stores/workbooks.store';
import { Municipio } from '../../services/tce.types';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'cmp-municipio-autocomplete',
  standalone: true,
  templateUrl: './municipio-autocomplete.component.html',
  imports: [
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ]
})
export class MunicipioAutocompleteComponent {
  store = inject(WorkbooksStore);

  control = input<FormControl<string>>(
    new FormControl('', { nonNullable: true })
  );

  municipioSelected = output<Municipio | undefined>();
  municipioValue = toSignal(this.control().valueChanges);

  municipios = computed(() => {
    return this.store.municipios().data.filter((m) => {
      const value = (this.municipioValue() || '').toLowerCase();
      return m.nome_municipio.toLowerCase().includes(value);
    });
  });

  onMunicipioSelected(event: MatAutocompleteSelectedEvent): void {
    const nome_municipio = event.option.value;
    const selectedMunicipio = this.store
      .municipios()
      .data.find((m) => m.nome_municipio === nome_municipio);
    this.municipioSelected.emit(selectedMunicipio);
  }
}
