import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { BaseComponent } from '../base/base-component';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html'
})
export class PaginationComponent extends BaseComponent implements OnChanges {
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 10;
  @Input() currentPage: number = 1;
  @Output() pageChanged = new EventEmitter<number>();
  
  totalPages: number = 0;
  pages: number[] = [];
  
  ngOnChanges(changes: SimpleChanges): void {
    this.calculatePages();
  }
  
  calculatePages(): void {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.pages = [];
    
    if (this.totalPages <= 7) {
      // Less than 7 pages, show all
      for (let i = 1; i <= this.totalPages; i++) {
        this.pages.push(i);
      }
    } else {
      // More than 7 pages, show current page with neighbors and ellipsis
      if (this.currentPage <= 4) {
        // Current page near start
        for (let i = 1; i <= 5; i++) {
          this.pages.push(i);
        }
        this.pages.push(-1); // Represents ellipsis
        this.pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 3) {
        // Current page near end
        this.pages.push(1);
        this.pages.push(-1);
        for (let i = this.totalPages - 4; i <= this.totalPages; i++) {
          this.pages.push(i);
        }
      } else {
        // Current page in middle
        this.pages.push(1);
        this.pages.push(-1);
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
          this.pages.push(i);
        }
        this.pages.push(-1);
        this.pages.push(this.totalPages);
      }
    }
  }
  
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
    this.pageChanged.emit(page);
  }
  
  previousPage(): void {
    this.changePage(this.currentPage - 1);
  }
  
  nextPage(): void {
    this.changePage(this.currentPage + 1);
  }
}