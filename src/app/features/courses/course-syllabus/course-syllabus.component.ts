import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { takeUntil } from 'rxjs';

interface SyllabusModule {
  id: string;
  title: string;
  description?: string;
  items: SyllabusItem[];
  isExpanded?: boolean;
}

interface SyllabusItem {
  id: string;
  title: string;
  type: 'lesson' | 'quiz' | 'assignment' | 'discussion';
  duration: number;
  isCompleted?: boolean;
  isLocked?: boolean;
}

@Component({
  selector: 'app-course-syllabus',
  templateUrl: './course-syllabus.component.html'
})
export class CourseSyllabusComponent extends BaseComponent implements OnInit {
  courseId: string;
  modules: SyllabusModule[] = [];
  isLoading = true;
  error: string = '';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
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
          this.loadSyllabus();
        }
      });
  }

  private loadSyllabus(): void {
    this.isLoading = true;
    
    this.courseService.getCourseSyllabus(this.courseId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (modules) => {
          this.modules = modules.map(module => ({
            ...module,
            isExpanded: false
          }));
          // Expand the first module by default
          if (this.modules.length > 0) {
            this.modules[0].isExpanded = true;
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading syllabus:', err);
          this.error = 'Failed to load course syllabus. Please try again.';
          this.isLoading = false;
        }
      });
  }

  toggleModule(moduleId: string): void {
    const module = this.modules.find(m => m.id === moduleId);
    if (module) {
      module.isExpanded = !module.isExpanded;
    }
  }

  navigateToItem(item: SyllabusItem): void {
    if (item.isLocked) {
      return;
    }

    switch (item.type) {
      case 'lesson':
        this.router.navigate(['/course', this.courseId, 'lesson', item.id]);
        break;
      case 'quiz':
        this.router.navigate(['/course', this.courseId, 'quiz', item.id]);
        break;
      case 'assignment':
        this.router.navigate(['/course', this.courseId, 'assignment', item.id]);
        break;
      case 'discussion':
        this.router.navigate(['/course', this.courseId, 'discussion'], { queryParams: { topic: item.id } });
        break;
    }
  }

  getItemIcon(type: string): string {
    switch (type) {
      case 'lesson':
        return 'video';
      case 'quiz':
        return 'quiz';
      case 'assignment':
        return 'assignment';
      case 'discussion':
        return 'forum';
      default:
        return 'document';
    }
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins}min`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}min`;
    }
  }
}
