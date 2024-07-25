import { Component } from '@angular/core';
import { TableContratosComponent } from '../table-contratos/table-contratos.component';

@Component({
  selector: 'cmp-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [
    TableContratosComponent
  ],
})
export class HomeComponent {}
