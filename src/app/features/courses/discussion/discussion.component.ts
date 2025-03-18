// File path: src/app/features/courses/discussion/discussion.component.ts
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { Discussion, Comment } from '@app/shared/models/discussion.model';
import { takeUntil, finalize } from 'rxjs/operators';
import { MentionSystemComponent } from './mention-system/mention-system.component';

@Component({
  selector: 'app-discussion',
  templateUrl: './discussion.component.html'
})
export class DiscussionComponent extends BaseComponent implements OnInit {
  courseId: string;
  currentTopicId: string | null = null;
  topics: Discussion[] = [];
  currentDiscussion: Discussion | null = null;
  
  isLoading = true;
  isLoadingTopic = false;
  isSubmitting = false;
  isCreatingTopic = false;
  error: string = '';
  
  newCommentText: string = '';
  newTopicTitle: string = '';
  newTopicDescription: string = '';
  
  showNewTopicForm = false;
  
  @ViewChild('commentInput') commentInput: ElementRef;
  @ViewChild('mentionSystem') mentionSystem: MentionSystemComponent;

  /**
   * Khởi tạo component với các dịch vụ cần thiết
   * Initialize component with required services
   * @param route Service để truy cập thông tin về route hiện tại
   * @param router Service để điều hướng giữa các routes
   * @param courseService Service xử lý dữ liệu khóa học
   * @param notificationService Service hiển thị thông báo
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private notificationService: NotificationService
  ) {
    super();
  }

  /**
   * Khởi tạo component và đăng ký theo dõi các tham số route
   * Initialize component and subscribe to route parameters
   */
  ngOnInit(): void {
    // Lấy courseId từ route cha
    // Get courseId from parent route
    this.route.parent.paramMap
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: params => {
          this.courseId = params.get('courseId');
          if (this.courseId) {
            this.loadDiscussionTopics();
          } else {
            this.error = 'Không tìm thấy ID khóa học';
            this.isLoading = false;
          }
        },
        error: err => {
          console.error('Lỗi khi đọc tham số route:', err);
          this.error = 'Đã xảy ra lỗi khi tải thông tin';
          this.isLoading = false;
        }
      });
      
    // Lấy topic ID từ query params
    // Get topic ID from query params
    this.route.queryParamMap
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: params => {
          const topicId = params.get('topic');
          if (topicId && topicId !== this.currentTopicId) {
            this.currentTopicId = topicId;
            if (this.topics.length > 0) {
              this.selectTopic(this.currentTopicId);
            }
          }
        },
        error: err => {
          console.error('Lỗi khi đọc query params:', err);
        }
      });
  }

  /**
   * Tải danh sách các chủ đề thảo luận từ server
   * Load discussion topics from server
   */
  loadDiscussionTopics(): void {
    this.isLoading = true;
    this.error = '';
    
    this.courseService.getDiscussionTopics(this.courseId)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (topics) => {
          this.topics = topics;
          
          // Nếu đã có topic ID trong URL, chọn topic đó
          // If there's a topic ID in the URL, select that topic
          if (this.currentTopicId) {
            this.selectTopic(this.currentTopicId);
          } 
          // Nếu không, chọn topic đầu tiên nếu có
          // Otherwise, select the first topic if available
          else if (this.topics.length > 0) {
            this.selectTopic(this.topics[0].id);
          }
        },
        error: (err) => {
          console.error('Lỗi khi tải chủ đề thảo luận:', err);
          this.error = 'Không thể tải danh sách chủ đề thảo luận. Vui lòng thử lại sau.';
          this.isLoading = false;
        }
      });
  }
  
  /**
   * Chọn một chủ đề thảo luận để hiển thị chi tiết
   * Select a discussion topic to display details
   * @param topicId ID của chủ đề cần hiển thị
   */
  selectTopic(topicId: string): void {
    if (!topicId) return;
    
    this.isLoadingTopic = true;
    this.currentTopicId = topicId;
    
    // Cập nhật URL với topic đã chọn
    // Update URL with selected topic
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { topic: topicId },
      queryParamsHandling: 'merge'
    });
    
    this.courseService.getDiscussionDetail(this.courseId, topicId)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoadingTopic = false;
        })
      )
      .subscribe({
        next: (discussion) => {
          this.currentDiscussion = discussion;
          
          // Cập nhật topic trong danh sách nếu cần
          // Update topic in list if needed
          const index = this.topics.findIndex(t => t.id === topicId);
          if (index !== -1) {
            this.topics[index] = {
              ...this.topics[index],
              ...discussion
            };
          }
        },
        error: (err) => {
          console.error('Lỗi khi tải chi tiết chủ đề:', err);
          this.error = 'Không thể tải chi tiết chủ đề. Vui lòng thử lại sau.';
          
          // Tìm topic trong danh sách đã có sẵn
          // Find topic in existing list
          this.currentDiscussion = this.topics.find(topic => topic.id === topicId) || null;
        }
      });
  }
  
  /**
   * Đăng bình luận mới cho chủ đề hiện tại
   * Submit new comment for current topic
   */
  submitNewComment(): void {
    if (!this.newCommentText.trim() || !this.currentTopicId) {
      this.notificationService.warning('Vui lòng nhập nội dung bình luận');
      return;
    }
    
    this.isSubmitting = true;
    
    this.courseService.addComment(this.courseId, this.currentTopicId, this.newCommentText)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (comment) => {
          if (this.currentDiscussion) {
            this.currentDiscussion.comments.push(comment);
            this.newCommentText = '';
            this.notificationService.success('Bình luận đã được đăng');
          }
        },
        error: (err) => {
          console.error('Lỗi khi đăng bình luận:', err);
          this.error = 'Không thể đăng bình luận. Vui lòng thử lại sau.';
          this.notificationService.error('Không thể đăng bình luận');
        }
      });
  }
  
  /**
   * Hiện form tạo chủ đề mới
   * Show new topic form
   */
  toggleNewTopicForm(): void {
    this.showNewTopicForm = !this.showNewTopicForm;
    if (!this.showNewTopicForm) {
      this.resetNewTopicForm();
    }
  }
  
  /**
   * Đặt lại form tạo chủ đề mới
   * Reset new topic form
   */
  resetNewTopicForm(): void {
    this.newTopicTitle = '';
    this.newTopicDescription = '';
  }
  
  /**
   * Tạo chủ đề thảo luận mới
   * Create new discussion topic
   */
  createNewTopic(): void {
    if (!this.newTopicTitle.trim()) {
      this.notificationService.warning('Vui lòng nhập tiêu đề cho chủ đề mới');
      return;
    }
    
    this.isCreatingTopic = true;
    
    const newTopic = {
      title: this.newTopicTitle,
      description: this.newTopicDescription
    };
    
    this.courseService.createDiscussionTopic(this.courseId, newTopic)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isCreatingTopic = false;
        })
      )
      .subscribe({
        next: (topic) => {
          this.topics.unshift(topic);
          this.resetNewTopicForm();
          this.showNewTopicForm = false;
          this.selectTopic(topic.id);
          this.notificationService.success('Đã tạo chủ đề thảo luận mới');
        },
        error: (err) => {
          console.error('Lỗi khi tạo chủ đề mới:', err);
          this.error = 'Không thể tạo chủ đề mới. Vui lòng thử lại sau.';
          this.notificationService.error('Không thể tạo chủ đề mới');
        }
      });
  }
  
  /**
   * Xử lý khi người dùng được đề cập trong bình luận
   * Handle when a user is mentioned in a comment
   * @param user Người dùng được đề cập
   */
  onUserMentioned(user: any): void {
    this.notificationService.info(`Đã đề cập đến ${user.name}`);
  }
  
  /**
   * Đếm số bình luận của một chủ đề
   * Count comments in a topic
   * @param topic Chủ đề cần đếm bình luận
   * @returns Số lượng bình luận
   */
  getCommentCount(topic: Discussion): number {
    if (!topic.comments) return 0;
    
    // Đếm cả comments và replies
    // Count both comments and replies
    let count = topic.comments.length;
    
    topic.comments.forEach(comment => {
      if (comment.replies) {
        count += comment.replies.length;
      }
    });
    
    return count;
  }
  
  /**
   * Lấy thời gian hoạt động gần nhất của chủ đề
   * Get the most recent activity time for a topic
   * @param topic Chủ đề cần xem hoạt động
   * @returns Thời gian của hoạt động gần nhất
   */
  getLastActivityTime(topic: Discussion): Date | null {
    if (!topic.comments || topic.comments.length === 0) {
      return topic.createdAt ? new Date(topic.createdAt) : null;
    }
    
    // Tìm comment gần đây nhất
    // Find most recent comment
    let latestDate = new Date(topic.createdAt || 0);
    
    topic.comments.forEach(comment => {
      const commentDate = new Date(comment.createdAt);
      if (commentDate > latestDate) {
        latestDate = commentDate;
      }
      
      // Kiểm tra cả replies
      // Check replies too
      if (comment.replies) {
        comment.replies.forEach(reply => {
          const replyDate = new Date(reply.createdAt);
          if (replyDate > latestDate) {
            latestDate = replyDate;
          }
        });
      }
    });
    
    return latestDate;
  }
  
  /**
   * Xóa thông báo lỗi
   * Clear error message
   */
  clearError(): void {
    this.error = '';
  }
}
