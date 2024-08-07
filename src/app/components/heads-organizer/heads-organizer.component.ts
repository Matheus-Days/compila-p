import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ParseSnakeCasePipe } from '../../pipes/parse-snake-case.pipe';

@Component({
  selector: 'cmp-heads-organizer',
  standalone: true,
  templateUrl: './heads-organizer.component.html',
  styleUrl: './heads-organizer.component.scss',
  imports: [
    CdkDropList,
    CdkDrag,
    MatCardModule,
    // Standalone
    ParseSnakeCasePipe
  ],
})
export class HeadsOrganizerComponent {
  heads = input.required<string[]>();

  headsChanged = output<string[]>();

  drop(ev: CdkDragDrop<string[]>): void {
    const heads = this.heads();
    moveItemInArray(heads, ev.previousIndex, ev.currentIndex);
    this.headsChanged.emit([...heads]);
  }
}
