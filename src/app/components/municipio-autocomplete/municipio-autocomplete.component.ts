import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { WorkbooksStore } from '../../stores/workbooks.store';
import { Municipio } from '../../services/tce.types';
import { MatInputModule } from '@angular/material/input';
import { Subscription } from 'rxjs';

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
  municipioValue = signal('');
  municipioValueSubscription?: Subscription;

  municipios = computed(() => {
    return this.store.municipios().data.filter((m) => {
      const value = (this.municipioValue() || '').toLowerCase();
      return m.nome_municipio.toLowerCase().includes(value);
    });
  });

  constructor() {
    effect(() => {
      if (this.municipioValueSubscription)
        this.municipioValueSubscription.unsubscribe();
      this.municipioValueSubscription = this.control().valueChanges.subscribe(
        (val) => {
          this.municipioValue.set(val);
        }
      );
    });
  }

  onMunicipioSelected(event: MatAutocompleteSelectedEvent): void {
    const nome_municipio = event.option.value;
    const selectedMunicipio = this.store
      .municipios()
      .data.find((m) => m.nome_municipio === nome_municipio);
    this.municipioSelected.emit(selectedMunicipio);
  }
}
