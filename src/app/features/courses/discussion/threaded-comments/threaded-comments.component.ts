// File path: src/app/features/courses/discussion/threaded-comments/threaded-comments.component.ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { Comment } from '@app/shared/models/discussion.model';
import { takeUntil, finalize } from 'rxjs/operators';
import { NotificationService } from '@app/shared/services/notification.service';

@Component({
  selector: 'app-threaded-comments',
  templateUrl: './threaded-comments.component.html'
})
export class ThreadedCommentsComponent extends BaseComponent implements OnChanges {
  @Input() comments: Comment[] = [];
  @Input() courseId: string;
  @Input() discussionId: string;
  
  rootComments: Comment[] = [];
  replyingTo: string | null = null;
  replyText: string = '';
  error: string = '';
  isSubmittingReply = false;
  isLiking = false;

  /**
   * Khởi tạo component với các dịch vụ cần thiết
   * Initialize component with necessary services
   * @param courseService Dịch vụ quản lý khóa học
   * @param notificationService Dịch vụ hiển thị thông báo
   */
  constructor(
    private courseService: CourseService,
    private notificationService: NotificationService
  ) {
    super();
  }
  
  /**
   * Phản ứng khi các đầu vào thay đổi
   * React to input changes
   * @param changes Các thay đổi của các thuộc tính đầu vào
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.comments) {
      this.organizeComments();
    }
  }
  
  /**
   * Sắp xếp và tổ chức bình luận thành cấu trúc cây
   * Organize comments into a tree structure
   */
  organizeComments(): void {
    // Tách các bình luận cấp gốc và các phản hồi
    // Separate root level comments from replies
    this.rootComments = this.comments.filter(comment => !comment.parentId);
    
    // Tạo một bản đồ các phản hồi bình luận để dễ tra cứu
    // Create a map of comment replies for easy lookup
    const commentReplies = {};
    
    this.comments.forEach(comment => {
      if (comment.parentId) {
        if (!commentReplies[comment.parentId]) {
          commentReplies[comment.parentId] = [];
        }
        commentReplies[comment.parentId].push(comment);
      }
    });
    
    // Gắn các phản hồi vào mỗi bình luận
    // Attach replies to each comment
    this.rootComments.forEach(rootComment => {
      this.attachReplies(rootComment, commentReplies);
    });
    
    // Sắp xếp theo thời gian tạo
    // Sort by creation time
    this.rootComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  /**
   * Gắn đệ quy các phản hồi vào bình luận
   * Recursively attach replies to comments
   * @param comment Bình luận cần gắn phản hồi
   * @param commentReplies Bản đồ phản hồi theo ID bình luận cha
   */
  attachReplies(comment: Comment, commentReplies: {[key: string]: Comment[]}): void {
    comment.replies = commentReplies[comment.id] || [];
    
    // Sắp xếp phản hồi theo thời gian tạo (mới nhất trước)
    // Sort replies by creation time (newest first)
    comment.replies.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    comment.replies.forEach(reply => {
      this.attachReplies(reply, commentReplies);
    });
  }
  
  /**
   * Bắt đầu viết phản hồi cho một bình luận
   * Start replying to a comment
   * @param commentId ID của bình luận cần phản hồi
   */
  startReply(commentId: string): void {
    this.replyingTo = commentId;
    this.replyText = '';
    
    // Đặt thời gian ngắn để đảm bảo textarea được hiển thị trước khi focus
    // Set a short timeout to ensure textarea is rendered before focusing
    setTimeout(() => {
      const textAreaElement = document.querySelector(`textarea[data-comment-id="${commentId}"]`);
      if (textAreaElement) {
        (textAreaElement as HTMLTextAreaElement).focus();
      }
    }, 100);
  }
  
  /**
   * Hủy phản hồi hiện tại
   * Cancel current reply
   */
  cancelReply(): void {
    this.replyingTo = null;
    this.replyText = '';
  }
  
  /**
   * Gửi phản hồi đến một bình luận
   * Submit a reply to a comment
   * @param parentComment Bình luận cha
   */
  submitReply(parentComment: Comment): void {
    if (!this.replyText.trim()) {
      this.notificationService.warning('Vui lòng nhập nội dung phản hồi');
      return;
    }
    
    this.isSubmittingReply = true;
    this.error = '';
    
    this.courseService.addReply(this.courseId, this.discussionId, parentComment.id, this.replyText)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isSubmittingReply = false;
        })
      )
      .subscribe({
        next: (reply) => {
          if (!parentComment.replies) {
            parentComment.replies = [];
          }
          parentComment.replies.unshift(reply);  // Add to the beginning for newest first
          this.replyingTo = null;
          this.replyText = '';
          this.notificationService.success('Phản hồi đã được đăng thành công');
        },
        error: (err) => {
          console.error('Lỗi khi thêm phản hồi:', err);
          this.error = 'Không thể đăng phản hồi. Vui lòng thử lại sau.';
          this.notificationService.error('Không thể đăng phản hồi');
        }
      });
  }
  
  /**
   * Thích một bình luận
   * Like a comment
   * @param comment Bình luận cần thích
   */
  likeComment(comment: Comment): void {
    if (comment.isLiked || this.isLiking) {
      return;
    }
    
    this.isLiking = true;
    
    this.courseService.likeComment(this.courseId, this.discussionId, comment.id)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLiking = false;
        })
      )
      .subscribe({
        next: (result) => {
          comment.likeCount = result.likeCount || (comment.likeCount || 0) + 1;
          comment.isLiked = true;
        },
        error: (err) => {
          console.error('Lỗi khi thích bình luận:', err);
          this.notificationService.error('Không thể thích bình luận này');
        }
      });
  }

  /**
   * Bỏ thích một bình luận
   * Unlike a comment
   * @param comment Bình luận cần bỏ thích
   */
  unlikeComment(comment: Comment): void {
    if (!comment.isLiked || this.isLiking) {
      return;
    }
    
    this.isLiking = true;
    
    this.courseService.unlikeComment(this.courseId, this.discussionId, comment.id)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLiking = false;
        })
      )
      .subscribe({
        next: (result) => {
          comment.likeCount = result.likeCount || (comment.likeCount || 0) - 1;
          comment.isLiked = false;
        },
        error: (err) => {
          console.error('Lỗi khi bỏ thích bình luận:', err);
          this.notificationService.error('Không thể bỏ thích bình luận này');
        }
      });
  }

  /**
   * Xóa thông báo lỗi
   * Clear error message
   */
  clearError(): void {
    this.error = '';
  }
  
  /**
   * Định dạng thời gian tạo bình luận thành dạng thân thiện
   * Format comment creation time in a friendly way
   * @param createdAt Thời điểm tạo bình luận
   * @returns Chuỗi thời gian thân thiện
   */
  formatTimeAgo(createdAt: string): string {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Vừa xong';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} phút trước`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} giờ trước`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ngày trước`;
    } else {
      return created.toLocaleDateString('vi-VN');
    }
  }
}
