import { Component, computed, input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'cmp-progress-bar',
  standalone: true,
  templateUrl: './progress-bar.component.html',
  imports: [MatProgressBarModule],
})
export class ProgressBarComponent {
  progress = input.required<number>();

  value = computed<number | undefined>(() => {
    const progress = this.progress();
    if (progress === -1) return undefined;
    else return progress * 100;
  });

  mode = computed<'determinate' | 'indeterminate'>(() => {
    const progress = this.progress();
    if (progress === -1) return 'indeterminate';
    else return 'determinate';
  });
}
