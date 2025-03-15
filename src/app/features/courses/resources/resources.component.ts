import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { Resource } from '@app/shared/models/resource.model';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html'
})
export class ResourcesComponent extends BaseComponent implements OnInit {
  courseId: string;
  resources: Resource[] = [];
  filteredResources: Resource[] = [];
  isLoading = true;
  error: string = '';
  
  // Filters
  selectedCategory: string = 'all';
  searchQuery: string = '';
  categories: string[] = [];
  
  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService
  ) {
    super();
  }
  
  ngOnInit(): void {
    this.route.parent.paramMap
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(params => {
        this.courseId = params.get('courseId');
        if (this.courseId) {
          this.loadResources();
        }
      });
  }
  
  loadResources(): void {
    this.isLoading = true;
    
    this.courseService.getCourseResources(this.courseId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (resources) => {
          this.resources = resources;
          this.generateCategories();
          this.applyFilters();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading resources:', err);
          this.error = 'Failed to load resources. Please try again.';
          this.isLoading = false;
        }
      });
  }
  
  generateCategories(): void {
    const categorySet = new Set<string>();
    
    this.resources.forEach(resource => {
      if (resource.category) {
        categorySet.add(resource.category);
      }
    });
    
    this.categories = Array.from(categorySet);
  }
  
  applyFilters(): void {
    let filtered = this.resources;
    
    // Apply category filter
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(resource => 
        resource.category === this.selectedCategory
      );
    }
    
    // Apply search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(resource => 
        resource.title.toLowerCase().includes(query) || 
        resource.description.toLowerCase().includes(query)
      );
    }
    
    this.filteredResources = filtered;
  }
  
  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }
  
  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.applyFilters();
  }
  
  getResourceIcon(type: string): string {
    switch (type) {
      case 'pdf':
        return 'file-pdf';
      case 'video':
        return 'video';
      case 'link':
        return 'link';
      case 'code':
        return 'code';
      case 'image':
        return 'image';
      default:
        return 'document';
    }
  }
  
  downloadResource(resource: Resource): void {
    window.open(resource.url, '_blank');
  }
}
