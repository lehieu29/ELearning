/* src/app/features/courses/course-filters/course-filters.component.ts */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-course-filters',
  templateUrl: './course-filters.component.html',
  styleUrls: ['./course-filters.component.scss']
})
export class CourseFiltersComponent implements OnInit {
  @Input() categories: string[] = [];
  @Input() levels: string[] = [];
  @Input() durations: string[] = [];

  @Input() selectedCategory: string = 'all';
  @Input() selectedLevel: string = 'all';
  @Input() selectedDuration: string = 'all';

  @Output() categoryChange = new EventEmitter<string>();
  @Output() levelChange = new EventEmitter<string>();
  @Output() durationChange = new EventEmitter<string>();
  @Output() resetFilters = new EventEmitter<void>();

  isMobileFiltersOpen = false;

  constructor() { }

  ngOnInit(): void {
  }

  onCategoryChange(category: string): void {
    this.categoryChange.emit(category);
  }

  onLevelChange(level: string): void {
    this.levelChange.emit(level);
  }

  onDurationChange(duration: string): void {
    this.durationChange.emit(duration);
  }

  onResetFilters(): void {
    this.resetFilters.emit();
  }

  toggleMobileFilters(): void {
    this.isMobileFiltersOpen = !this.isMobileFiltersOpen;
  }
}