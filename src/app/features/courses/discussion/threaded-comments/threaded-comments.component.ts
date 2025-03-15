// File path: src/app/features/courses/discussion/threaded-comments/threaded-comments.component.ts
import { Component, Input, OnChanges } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { Comment } from '@app/shared/models/discussion.model';
import { takeUntil } from 'rxjs/operators';

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
  
  constructor(private courseService: CourseService) {
    super();
  }
  
  ngOnChanges(): void {
    this.organizeComments();
  }
  
  organizeComments(): void {
    // Separate root level comments from replies
    this.rootComments = this.comments.filter(comment => !comment.parentId);
    
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
    
    // Attach replies to each comment
    this.rootComments.forEach(rootComment => {
      this.attachReplies(rootComment, commentReplies);
    });
  }
  
  attachReplies(comment: Comment, commentReplies: {[key: string]: Comment[]}): void {
    comment.replies = commentReplies[comment.id] || [];
    comment.replies.forEach(reply => {
      this.attachReplies(reply, commentReplies);
    });
  }
  
  startReply(commentId: string): void {
    this.replyingTo = commentId;
    this.replyText = '';
  }
  
  cancelReply(): void {
    this.replyingTo = null;
    this.replyText = '';
  }
  
  submitReply(parentComment: Comment): void {
    if (!this.replyText.trim()) {
      return;
    }
    
    this.courseService.addReply(this.courseId, this.discussionId, parentComment.id, this.replyText)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (reply) => {
          if (!parentComment.replies) {
            parentComment.replies = [];
          }
          parentComment.replies.push(reply);
          this.replyingTo = null;
          this.replyText = '';
        },
        error: (err) => {
          console.error('Error adding reply:', err);
          this.error = 'Failed to add reply. Please try again.';
        }
      });
  }
  
  likeComment(comment: Comment): void {
    if (comment.isLiked) {
      return;
    }
    
    this.courseService.likeComment(this.courseId, this.discussionId, comment.id)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: () => {
          comment.likeCount = (comment.likeCount || 0) + 1;
          comment.isLiked = true;
        },
        error: (err) => {
          console.error('Error liking comment:', err);
        }
      });
  }
}
