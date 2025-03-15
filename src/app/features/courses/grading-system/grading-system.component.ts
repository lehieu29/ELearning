import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { Submission } from '@app/shared/models/submission.model';
import { Rubric, RubricCriterion } from '@app/shared/models/rubric.model';
import { takeUntil } from 'rxjs/operators';

interface GradingItem {
  id: string;
  studentName: string;
  studentId: string;
  submissionType: 'assignment' | 'quiz' | 'project' | 'discussion';
  title: string;
  submissionDate: Date;
  dueDate: Date;
  status: 'pending' | 'graded' | 'late' | 'resubmitted';
  attachments?: any[];
  grade?: number;
  maxGrade: number;
  feedback?: string;
  rubricScores?: {[criteriaId: string]: number};
}

interface RubricCriteria {
  id: string;
  title: string;
  description: string;
  maxPoints: number;
  scoringLevels: {
    level: number;
    description: string;
    points: number;
  }[];
}

@Component({
  selector: 'app-grading-system',
  templateUrl: './grading-system.component.html'
})
export class GradingSystemComponent extends BaseComponent implements OnInit {
  courseId: string;
  assignmentId: string;
  submissionId: string;
  
  isLoading = true;
  isSubmitting = false;
  error: string = '';
  
  submission: Submission;
  rubric: Rubric;
  
  gradingForm: FormGroup;
  maxPoints: number = 0;
  totalEarned: number = 0;

  gradingItems: GradingItem[] = [];
  filteredItems: GradingItem[] = [];
  selectedItem: GradingItem | null = null;
  
  rubricCriteria: RubricCriteria[] = [];
  
  successMessage: string = '';
  
  // Filters
  selectedStatus: 'all' | 'pending' | 'graded' | 'late' | 'resubmitted' = 'all';
  selectedType: 'all' | 'assignment' | 'quiz' | 'project' | 'discussion' = 'all';
  searchTerm: string = '';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private courseService: CourseService,
    private notificationService: NotificationService
  ) {
    super();
    
    this.gradingForm = this.fb.group({
      grade: [null, [Validators.required, Validators.min(0)]],
      feedback: ['', [Validators.required, Validators.minLength(10)]],
      rubricScores: this.fb.group({})
    });
  }
  
  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(params => {
        this.courseId = params.get('courseId');
        this.assignmentId = params.get('assignmentId');
        this.submissionId = params.get('submissionId');
        
        if (this.courseId && this.assignmentId && this.submissionId) {
          this.loadSubmissionDetails();
        }
      });

    this.route.parent.paramMap
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(params => {
        this.courseId = params.get('courseId');
        if (this.courseId) {
          this.loadGradingItems();
        }
      });
  }
  
  loadSubmissionDetails(): void {
    this.isLoading = true;
    this.error = '';
    
    this.courseService.getSubmissionDetails(this.courseId, this.assignmentId, this.submissionId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (submission) => {
          this.submission = submission;
          
          // Load the rubric for this assignment
          this.courseService.getAssignmentRubric(this.courseId, this.assignmentId)
            .pipe(takeUntil(this._onDestroySub))
            .subscribe({
              next: (rubric) => {
                this.rubric = rubric;
                this.initGradingForm();
                this.isLoading = false;
              },
              error: (err) => {
                console.error('Error loading rubric:', err);
                this.error = 'Failed to load grading rubric. Please try again.';
                this.isLoading = false;
              }
            });
        },
        error: (err) => {
          console.error('Error loading submission details:', err);
          this.error = 'Failed to load submission details. Please try again.';
          this.isLoading = false;
        }
      });
  }
  
  initGradingForm(): void {
    const criteriaControls = {};
    
    // Create form controls for each rubric criterion
    this.rubric.criteria.forEach(criterion => {
      criteriaControls[criterion.id] = [null, Validators.required];
      this.maxPoints += criterion.maxPoints;
    });
    
    this.gradingForm = this.fb.group({
      criteria: this.fb.group(criteriaControls),
      feedback: ['', [Validators.required, Validators.minLength(20)]],
      privateNotes: [''],
    });
    
    // If submission has already been graded, populate the form
    if (this.submission.grade) {
      const criteriaValues = {};
      
      this.submission.gradingDetails?.forEach(detail => {
        criteriaValues[detail.criterionId] = detail.points;
        this.totalEarned += detail.points;
      });
      
      this.gradingForm.patchValue({
        criteria: criteriaValues,
        feedback: this.submission.feedback || '',
        privateNotes: this.submission.privateNotes || ''
      });
    }
    
    // Listen for changes to criteria to update total earned points
    this.gradingForm.get('criteria').valueChanges
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(values => {
        this.totalEarned = 0;
        Object.keys(values).forEach(criterionId => {
          if (values[criterionId] !== null) {
            this.totalEarned += Number(values[criterionId]);
          }
        });
      });
  }
  
  submitGrade(): void {
    if (this.gradingForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.gradingForm.controls).forEach(key => {
        const control = this.gradingForm.get(key);
        if (control instanceof AbstractControl) {
          control.markAsTouched();
        }
      });
      
      const criteriaControl = this.gradingForm.get('criteria');
      Object.keys(criteriaControl.controls).forEach(key => {
        criteriaControl.get(key).markAsTouched();
      });
      
      this.notificationService.warning('Please complete all required fields before submitting.');
      return;
    }
    
    const formValues = this.gradingForm.value;
    
    // Format the grading details
    const gradingDetails = Object.keys(formValues.criteria).map(criterionId => {
      const criterion = this.rubric.criteria.find(c => c.id === criterionId);
      return {
        criterionId,
        criterion: criterion.name,
        points: formValues.criteria[criterionId]
      };
    });
    
    const gradePayload = {
      courseId: this.courseId,
      assignmentId: this.assignmentId,
      submissionId: this.submissionId,
      gradingDetails,
      feedback: formValues.feedback,
      privateNotes: formValues.privateNotes
    };
    
    this.isSubmitting = true;
    this.courseService.submitGrade(gradePayload)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: () => {
          this.notificationService.success('Grade submitted successfully.');
          this.router.navigate(['/courses', this.courseId, 'assignments', this.assignmentId, 'submissions']);
        },
        error: (err) => {
          console.error('Error submitting grade:', err);
          this.error = 'Failed to submit grade. Please try again.';
          this.isSubmitting = false;
        }
      });
  }

  loadGradingItems(): void {
    this.isLoading = true;
    
    this.courseService.getGradingItems(this.courseId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (items) => {
          this.gradingItems = items;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading grading items:', err);
          this.error = 'Failed to load items for grading. Please try again.';
          this.isLoading = false;
        }
      });
  }
  
  selectItem(item: GradingItem): void {
    this.selectedItem = item;
    this.error = '';
    this.successMessage = '';
    
    // Reset form with current values
    this.gradingForm.patchValue({
      grade: item.grade || null,
      feedback: item.feedback || '',
      rubricScores: item.rubricScores || {}
    });
    
    // Load rubric if available
    this.loadRubric(item);
  }
  
  loadRubric(item: GradingItem): void {
    if (!item) return;
    
    this.courseService.getSubmissionRubric(this.courseId, item.submissionType, item.id)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (criteria) => {
          this.rubricCriteria = criteria;
          
          // Build dynamic form controls for rubric
          const rubricFormGroup = this.fb.group({});
          
          criteria.forEach(criterion => {
            const existingScore = this.selectedItem?.rubricScores?.[criterion.id];
            rubricFormGroup.addControl(criterion.id, this.fb.control(existingScore || 0));
          });
          
          this.gradingForm.setControl('rubricScores', rubricFormGroup);
        },
        error: (err) => {
          console.error('Error loading rubric:', err);
          this.rubricCriteria = [];
          
          // Reset rubric scores form group
          this.gradingForm.setControl('rubricScores', this.fb.group({}));
        }
      });
  }
  
  calculateTotalRubricScore(): number {
    if (!this.rubricCriteria.length) return 0;
    
    const rubricScores = this.gradingForm.get('rubricScores').value;
    return Object.values<number>(rubricScores).reduce((sum, score) => sum + score, 0);
  }
  
  calculateMaxRubricScore(): number {
    return this.rubricCriteria.reduce((sum, criteria) => sum + criteria.maxPoints, 0);
  }
  
  applyFilters(): void {
    // Start with all items
    let filtered = [...this.gradingItems];
    
    // Apply status filter
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === this.selectedStatus);
    }
    
    // Apply type filter
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(item => item.submissionType === this.selectedType);
    }
    
    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.studentName.toLowerCase().includes(searchLower) || 
        item.title.toLowerCase().includes(searchLower)
      );
    }
    
    this.filteredItems = filtered;
  }
  
  filterByStatus(status: 'all' | 'pending' | 'graded' | 'late' | 'resubmitted'): void {
    this.selectedStatus = status;
    this.applyFilters();
  }
  
  filterByType(type: 'all' | 'assignment' | 'quiz' | 'project' | 'discussion'): void {
    this.selectedType = type;
    this.applyFilters();
  }
  
  onSearch(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }
  
  getTypeIcon(type: string): string {
    switch(type) {
      case 'assignment': return 'file-text';
      case 'quiz': return 'check-square';
      case 'project': return 'briefcase';
      case 'discussion': return 'message-circle';
      default: return 'file';
    }
  }
  
  getStatusClass(status: string): string {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'graded': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-red-100 text-red-800';
      case 'resubmitted': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
