import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { SkillsAssessmentService } from '@app/shared/services/skills-assessment.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { 
  Skill, 
  SkillCategory, 
  Assessment,
  AssessmentQuestion,
  AssessmentResult,
  RelevantCourse
} from '@app/shared/models/skills-assessment.model';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Component({
  selector: 'app-skills-assessment',
  templateUrl: './skills-assessment.component.html'
})
export class SkillsAssessmentComponent extends BaseComponent implements OnInit {
  // Dữ liệu kỹ năng và đánh giá
  // Skills and assessment data
  skillCategories: SkillCategory[] = [];
  userSkills: Skill[] = [];
  availableAssessments: Assessment[] = [];
  assessmentHistory: AssessmentResult[] = [];

  // Trạng thái UI
  // UI states
  selectedCategory: string | null = null;
  activeTab: 'skills' | 'assessments' | 'history' = 'skills';
  isLoading = {
    categories: false,
    userSkills: false,
    assessments: false,
    history: false
  };
  errors = {
    categories: '',
    userSkills: '',
    assessments: '',
    history: ''
  };
  
  // Trạng thái đánh giá hiện tại
  // Current assessment state
  currentAssessment: Assessment | null = null;
  currentQuestions: AssessmentQuestion[] = [];
  currentAnswers: { questionId: string, answer: string | string[] }[] = [];
  currentQuestionIndex = 0;
  assessmentInProgress = false;
  assessmentResult: AssessmentResult | null = null;
  
  // Trạng thái bộ lọc
  // Filter states
  assessmentFilter: 'all' | 'completed' | 'in-progress' | 'not-started' = 'all';
  
  // Các khóa học được đề xuất
  // Recommended courses
  recommendedCourses: RelevantCourse[] = [];
  isLoadingRecommendations = false;
  
  /**
   * Khởi tạo component với các dịch vụ cần thiết
   * Initialize component with required services
   * @param skillsService Dịch vụ đánh giá kỹ năng
   * @param notificationService Dịch vụ thông báo
   */
  constructor(
    private skillsService: SkillsAssessmentService,
    private notificationService: NotificationService
  ) {
    super();
  }
  
  /**
   * Khởi tạo component và tải dữ liệu ban đầu
   * Initialize component and load initial data
   */
  ngOnInit(): void {
    this.loadSkillCategories();
    this.loadUserSkills();
    this.loadAvailableAssessments();
    this.loadAssessmentHistory();
  }
  
  /**
   * Tải danh sách các danh mục kỹ năng
   * Load skill categories
   */
  loadSkillCategories(): void {
    this.isLoading.categories = true;
    this.errors.categories = '';
    
    this.skillsService.getSkillCategories()
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading.categories = false;
        }),
        catchError(error => {
          this.errors.categories = 'Không thể tải danh mục kỹ năng. Vui lòng thử lại sau.';
          this.notificationService.error(this.errors.categories);
          return of([]);
        })
      )
      .subscribe(categories => {
        this.skillCategories = categories;
        
        // Chọn danh mục đầu tiên nếu có
        // Select the first category if any
        if (this.skillCategories.length > 0 && !this.selectedCategory) {
          this.selectedCategory = this.skillCategories[0].id;
        }
      });
  }
  
  /**
   * Tải kỹ năng của người dùng
   * Load user skills
   */
  loadUserSkills(): void {
    this.isLoading.userSkills = true;
    this.errors.userSkills = '';
    
    this.skillsService.getUserSkills()
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading.userSkills = false;
        }),
        catchError(error => {
          this.errors.userSkills = 'Không thể tải kỹ năng người dùng. Vui lòng thử lại sau.';
          this.notificationService.error(this.errors.userSkills);
          return of([]);
        })
      )
      .subscribe(skills => {
        this.userSkills = skills;
        this.loadRecommendedCourses();
      });
  }
  
  /**
   * Tải các bài đánh giá kỹ năng có sẵn
   * Load available skill assessments
   */
  loadAvailableAssessments(): void {
    this.isLoading.assessments = true;
    this.errors.assessments = '';
    
    this.skillsService.getAvailableAssessments()
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading.assessments = false;
        }),
        catchError(error => {
          this.errors.assessments = 'Không thể tải bài đánh giá kỹ năng. Vui lòng thử lại sau.';
          this.notificationService.error(this.errors.assessments);
          return of([]);
        })
      )
      .subscribe(assessments => {
        this.availableAssessments = assessments;
      });
  }
  
  /**
   * Tải lịch sử đánh giá kỹ năng
   * Load assessment history
   */
  loadAssessmentHistory(): void {
    this.isLoading.history = true;
    this.errors.history = '';
    
    this.skillsService.getAssessmentHistory()
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading.history = false;
        }),
        catchError(error => {
          this.errors.history = 'Không thể tải lịch sử đánh giá kỹ năng. Vui lòng thử lại sau.';
          this.notificationService.error(this.errors.history);
          return of([]);
        })
      )
      .subscribe(history => {
        this.assessmentHistory = history;
      });
  }
  
  /**
   * Bắt đầu một bài đánh giá kỹ năng
   * Start a skill assessment
   * @param assessment Bài đánh giá được chọn
   */
  startAssessment(assessment: Assessment): void {
    this.currentAssessment = assessment;
    this.assessmentInProgress = true;
    this.currentQuestionIndex = 0;
    this.currentAnswers = [];
    this.assessmentResult = null;
    
    this.skillsService.getAssessmentQuestions(assessment.id)
      .pipe(
        takeUntil(this._onDestroySub),
        catchError(error => {
          this.notificationService.error('Không thể tải câu hỏi đánh giá. Vui lòng thử lại sau.');
          this.cancelAssessment();
          return of([]);
        })
      )
      .subscribe(questions => {
        this.currentQuestions = questions;
      });
  }
  
  /**
   * Trả lời câu hỏi hiện tại và chuyển sang câu tiếp theo
   * Answer current question and move to the next one
   * @param answer Câu trả lời đã chọn
   */
  answerQuestion(answer: string | string[]): void {
    if (!this.currentAssessment || !this.currentQuestions || this.currentQuestionIndex >= this.currentQuestions.length) {
      return;
    }
    
    const currentQuestion = this.currentQuestions[this.currentQuestionIndex];
    this.currentAnswers.push({
      questionId: currentQuestion.id,
      answer: answer
    });
    
    if (this.currentQuestionIndex < this.currentQuestions.length - 1) {
      // Chuyển sang câu tiếp theo
      // Move to the next question
      this.currentQuestionIndex++;
    } else {
      // Đã hoàn thành tất cả câu hỏi, gửi kết quả
      // All questions completed, submit the assessment
      this.submitAssessment();
    }
  }
  
  /**
   * Gửi kết quả bài đánh giá
   * Submit assessment results
   */
  submitAssessment(): void {
    if (!this.currentAssessment) {
      return;
    }
    
    this.skillsService.submitAssessment(this.currentAssessment.id, this.currentAnswers)
      .pipe(
        takeUntil(this._onDestroySub),
        catchError(error => {
          this.notificationService.error('Không thể gửi kết quả đánh giá. Vui lòng thử lại sau.');
          return of(null);
        })
      )
      .subscribe(result => {
        if (result) {
          this.assessmentResult = result;
          this.assessmentInProgress = false;
          this.notificationService.success('Đã hoàn thành bài đánh giá kỹ năng!');
          
          // Tải lại dữ liệu sau khi hoàn thành đánh giá
          // Reload data after assessment completion
          this.loadUserSkills();
          this.loadAssessmentHistory();
        }
      });
  }
  
  /**
   * Hủy bài đánh giá hiện tại
   * Cancel the current assessment
   */
  cancelAssessment(): void {
    this.currentAssessment = null;
    this.currentQuestions = [];
    this.currentAnswers = [];
    this.currentQuestionIndex = 0;
    this.assessmentInProgress = false;
    this.assessmentResult = null;
  }
  
  /**
   * Chuyển đổi tab hiển thị
   * Switch displayed tab
   * @param tab Tab được chọn
   */
  switchTab(tab: 'skills' | 'assessments' | 'history'): void {
    this.activeTab = tab;
  }
  
  /**
   * Chọn danh mục kỹ năng để hiển thị
   * Select skill category to display
   * @param categoryId ID của danh mục
   */
  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
  }
  
  /**
   * Tải các khóa học được đề xuất dựa trên kỹ năng
   * Load recommended courses based on skills
   */
  loadRecommendedCourses(): void {
    if (this.userSkills.length === 0) {
      return;
    }
    
    const skillIds = this.userSkills.map(skill => skill.id);
    this.isLoadingRecommendations = true;
    
    this.skillsService.getSkillBasedCourseRecommendations(skillIds)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoadingRecommendations = false;
        }),
        catchError(error => {
          console.error('Lỗi khi tải đề xuất khóa học:', error);
          return of([]);
        })
      )
      .subscribe(courses => {
        this.recommendedCourses = courses;
      });
  }
  
  /**
   * Lọc các bài đánh giá theo trạng thái
   * Filter assessments by status
   * @param filter Bộ lọc được chọn
   */
  filterAssessments(filter: 'all' | 'completed' | 'in-progress' | 'not-started'): void {
    this.assessmentFilter = filter;
  }
  
  /**
   * Lấy các bài đánh giá đã lọc
   * Get filtered assessments
   * @returns Danh sách bài đánh giá đã lọc
   */
  getFilteredAssessments(): Assessment[] {
    if (this.assessmentFilter === 'all') {
      return this.availableAssessments;
    }
    
    return this.availableAssessments.filter(assessment => 
      assessment.completionStatus === this.assessmentFilter);
  }
  
  /**
   * Lấy màu hiển thị cho mức độ thành thạo kỹ năng
   * Get display color for skill proficiency level
   * @param level Mức độ thành thạo (0-100)
   * @returns CSS class cho màu
   */
  getProficiencyColor(level: number): string {
    if (level < 30) {
      return 'bg-red-500';
    } else if (level < 60) {
      return 'bg-yellow-500';
    } else if (level < 85) {
      return 'bg-blue-500';
    } else {
      return 'bg-green-500';
    }
  }
  
  /**
   * Lấy văn bản mô tả cho mức độ thành thạo kỹ năng
   * Get description text for skill proficiency level
   * @param level Mức độ thành thạo (0-100)
   * @returns Văn bản mô tả
   */
  getProficiencyText(level: number): string {
    if (level < 30) {
      return 'Mới bắt đầu';
    } else if (level < 60) {
      return 'Trung bình';
    } else if (level < 85) {
      return 'Thành thạo';
    } else {
      return 'Chuyên gia';
    }
  }
  
  /**
   * Lấy kỹ năng được lọc theo danh mục đã chọn
   * Get skills filtered by selected category
   * @returns Danh sách kỹ năng đã lọc
   */
  getFilteredSkills(): Skill[] {
    if (!this.selectedCategory) {
      return this.userSkills;
    }
    
    return this.userSkills.filter(skill => skill.category === this.selectedCategory);
  }
  
  /**
   * Cập nhật mức độ thành thạo kỹ năng
   * Update skill proficiency level
   * @param skillId ID của kỹ năng
   * @param proficiencyLevel Mức độ thành thạo mới
   */
  updateSkillProficiency(skillId: string, proficiencyLevel: number): void {
    this.skillsService.updateSkillProficiency(skillId, proficiencyLevel)
      .pipe(
        takeUntil(this._onDestroySub),
        catchError(error => {
          this.notificationService.error('Không thể cập nhật mức độ thành thạo kỹ năng. Vui lòng thử lại sau.');
          return of(null);
        })
      )
      .subscribe(updatedSkill => {
        if (updatedSkill) {
          // Cập nhật kỹ năng trong danh sách
          // Update skill in the list
          const index = this.userSkills.findIndex(s => s.id === skillId);
          if (index !== -1) {
            this.userSkills[index] = updatedSkill;
          }
          this.notificationService.success('Đã cập nhật mức độ thành thạo kỹ năng.');
        }
      });
  }
}
