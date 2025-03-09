// src/app/shared/pipes/sort-array.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortArray'
})
export class SortArrayPipe implements PipeTransform {
  transform(array: any[], property: string, direction: 'asc' | 'desc' = 'asc'): any[] {
    if (!array || !property) {
      return array;
    }
    
    return [...array].sort((a, b) => {
      const aValue = this.getPropertyValue(a, property);
      const bValue = this.getPropertyValue(b, property);
      
      if (aValue === bValue) {
        return 0;
      }
      
      if (aValue === null || aValue === undefined) {
        return direction === 'asc' ? -1 : 1;
      }
      
      if (bValue === null || bValue === undefined) {
        return direction === 'asc' ? 1 : -1;
      }
      
      if (direction === 'asc') {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
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