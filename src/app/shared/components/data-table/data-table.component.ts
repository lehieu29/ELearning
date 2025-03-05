// src/app/shared/components/data-table/data-table.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '../base/base-component';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'custom';
  format?: (value: any) => string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface SortEvent {
  column: string;
  direction: 'asc' | 'desc' | '';
}

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html'
})
export class DataTableComponent extends BaseComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading: boolean = false;
  @Input() pagination: boolean = true;
  @Input() pageSize: number = 10;
  @Input() currentPage: number = 1;
  @Input() totalItems: number = 0;
  @Input() selectable: boolean = false;
  @Input() bordered: boolean = true;
  @Input() striped: boolean = true;
  @Input() hover: boolean = true;
  @Input() emptyMessage: string = 'No data available';

  @Output() sort = new EventEmitter<SortEvent>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any[]>();

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' | '' = '';
  selectedItems: any[] = [];
  allSelected: boolean = false;

  toggleSort(column: TableColumn): void {
    if (!column.sortable) {
      return;
    }

    if (this.sortColumn === column.key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : this.sortDirection === 'desc' ? '' : 'asc';
    } else {
      this.sortColumn = column.key;
      this.sortDirection = 'asc';
    }

    if (this.sortDirection === '') {
      this.sortColumn = '';
    }

    this.sort.emit({
      column: this.sortColumn,
      direction: this.sortDirection
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.pageChange.emit(page);
  }

  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  toggleSelectAll(): void {
    this.allSelected = !this.allSelected;
    this.selectedItems = this.allSelected ? [...this.data] : [];
    this.selectionChange.emit(this.selectedItems);
  }

  toggleSelectItem(item: any, event: Event): void {
    event.stopPropagation();

    const index = this.selectedItems.findIndex(selectedItem => selectedItem === item);

    if (index === -1) {
      this.selectedItems.push(item);
    } else {
      this.selectedItems.splice(index, 1);
    }

    this.allSelected = this.data.length === this.selectedItems.length;
    this.selectionChange.emit(this.selectedItems);
  }

  isSelected(item: any): boolean {
    return this.selectedItems.includes(item);
  }

  getCellValue(row: any, column: TableColumn): any {
    const value = this.getNestedProperty(row, column.key);

    if (column.format) {
      return column.format(value);
    }

    if (value === null || value === undefined) {
      return '-';
    }

    if (column.type === 'date' && value instanceof Date) {
      return value.toLocaleDateString();
    }

    if (column.type === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    return value;
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((o, p) => (o ? o[p] : null), obj);
  }
}