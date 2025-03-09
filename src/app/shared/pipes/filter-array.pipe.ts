// src/app/shared/pipes/filter-array.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterArray'
})
export class FilterArrayPipe implements PipeTransform {
  transform(items: any[], property: string, filterValue: any): any[] {
    if (!items || !property || filterValue === undefined || filterValue === null) {
      return items;
    }

    if (filterValue === '') {
      return items;
    }

    return items.filter(item => {
      const propertyValue = this.getPropertyValue(item, property);

      if (typeof propertyValue === 'string' && typeof filterValue === 'string') {
        return propertyValue.toLowerCase().includes(filterValue.toLowerCase());
      }

      return propertyValue === filterValue;
    });
  }

  private getPropertyValue(item: any, property: string): any {
    const properties = property.split('.');
    let value = item;

    for (const prop of properties) {
      if (value === null || value === undefined) {
        return null;
      }

      value = value[prop];
    }

    return value;
  }
}