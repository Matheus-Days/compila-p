import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'parseSnakeCase',
  standalone: true
})
export class ParseSnakeCasePipe implements PipeTransform {
  transform(value?: string | null): string {
    if (!value) return '';
    return value
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
