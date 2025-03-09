// src/app/shared/pipes/number-with-commas.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberWithCommas'
})
export class NumberWithCommasPipe implements PipeTransform {
  transform(value: number): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '';
    }

    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}