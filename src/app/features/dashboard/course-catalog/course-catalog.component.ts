// src/app/features/dashboard/course-catalog/course-catalog.component.ts
import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { Course } from '@app/shared/models/course.model';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-course-catalog',
  templateUrl: './course-catalog.component.html',
  styleUrls: ['./course-catalog.component.scss']
})
export class CourseCatalogComponent extends BaseComponent implements OnInit {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  isLoading = true;
  currentPage = 1;
  totalItems = 0;
  itemsPerPage = 12;
  categories: string[] = [];
  selectedCategory: string = '';
  searchTerm: string = '';
  
  constructor(private courseService: CourseService) {
    super();
  }

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading = true;
    this.courseService.getCourses({ 
      page: this.currentPage, 
      limit: this.itemsPerPage,
      filter: this.selectedCategory ? { category: this.selectedCategory } : undefined
    }).pipe(takeUntil(this._onDestroySub)).subscribe({
      next: (response) => {
        this.courses = response.courses;
        this.filteredCourses = this.courses;
        this.totalItems = response.pagination.totalItems;
        this.extractCategories();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.isLoading = false;
      }
    });
  }

  extractCategories(): void {
    const categorySet = new Set<string>();
    this.courses.forEach(course => {
      categorySet.add(course.category);
    });
    this.categories = Array.from(categorySet);
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.currentPage = 1;
    this.loadCourses();
  }

  onSearch(term: string): void {
    this.searchTerm = term.toLowerCase();
    if (this.searchTerm) {
      this.filteredCourses = this.courses.filter(course => 
        course.title.toLowerCase().includes(this.searchTerm) || 
        course.description.toLowerCase().includes(this.searchTerm)
      );
    } else {
      this.filteredCourses = this.courses;
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadCourses();
  }
}