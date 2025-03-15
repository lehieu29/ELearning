// File path: src/app/features/courses/discussion/discussion.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { Discussion, Comment } from '@app/shared/models/discussion.model';
import { takeUntil } from 'rxjs/operators';

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
  error: string = '';
  newCommentText: string = '';
  
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
        this.loadDiscussionTopics();
      });
      
    this.route.queryParamMap
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(params => {
        this.currentTopicId = params.get('topic');
        if (this.currentTopicId && this.topics.length > 0) {
          this.selectTopic(this.currentTopicId);
        }
      });
  }
  
  loadDiscussionTopics(): void {
    this.isLoading = true;
    
    this.courseService.getDiscussionTopics(this.courseId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (topics) => {
          this.topics = topics;
          this.isLoading = false;
          
          if (this.currentTopicId) {
            this.selectTopic(this.currentTopicId);
          } else if (this.topics.length > 0) {
            this.selectTopic(this.topics[0].id);
          }
        },
        error: (err) => {
          console.error('Error loading discussion topics:', err);
          this.error = 'Failed to load discussion topics. Please try again.';
          this.isLoading = false;
        }
      });
  }
  
  selectTopic(topicId: string): void {
    this.currentTopicId = topicId;
    this.currentDiscussion = this.topics.find(topic => topic.id === topicId) || null;
  }
  
  submitNewComment(): void {
    if (!this.newCommentText.trim() || !this.currentTopicId) {
      return;
    }
    
    this.courseService.addComment(this.courseId, this.currentTopicId, this.newCommentText)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (comment) => {
          if (this.currentDiscussion) {
            this.currentDiscussion.comments.push(comment);
            this.newCommentText = '';
          }
        },
        error: (err) => {
          console.error('Error adding comment:', err);
          this.error = 'Failed to add comment. Please try again.';
        }
      });
  }
}
