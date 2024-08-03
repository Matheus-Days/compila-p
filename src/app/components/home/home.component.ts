import { Component } from '@angular/core';
import { TableContratosComponent } from '../table-contratos/table-contratos.component';
import { TableItensNfComponent } from '../table-itens-nf/table-itens-nf.component';

@Component({
  selector: 'cmp-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [
    TableContratosComponent,
    TableItensNfComponent
  ],
})
export class HomeComponent {}
