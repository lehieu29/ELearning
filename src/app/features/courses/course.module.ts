/* src/app/features/dashboard/dashboard.module.ts */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CourseComponent } from './course.component';
import { CourseDetailsComponent } from './course-details/course-details.component';
import { CourseSyllabusComponent } from './course-syllabus/course-syllabus.component';
import { LessonPlayerComponent } from './lesson-player/lesson-player.component';
import { QuizComponent } from './quiz/quiz.component';
import { AssignmentComponent } from './assignment/assignment.component';
import { DiscussionComponent } from './discussion/discussion.component';
import { ResourcesComponent } from './resources/resources.component';
import { NoteTakingComponent } from './note-taking/note-taking.component';
import { BookmarkSystemComponent } from './bookmark-system/bookmark-system.component';
import { FeedbackSystemComponent } from './feedback-system/feedback-system.component';
import { PeerReviewComponent } from './peer-review/peer-review.component';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { ProjectSubmissionComponent } from './project-submission/project-submission.component';
import { GradingSystemComponent } from './grading-system/grading-system.component';
import { KnowledgeCheckComponent } from './knowledge-check/knowledge-check.component';
import { InteractiveExercisesComponent } from './interactive-exercises/interactive-exercises.component';
import { ContentAccessibilityComponent } from './content-accessibility/content-accessibility.component';

// Lesson Player subcomponents
import { SpeedControlComponent } from './lesson-player/speed-control/speed-control.component';
import { TranscriptComponent } from './lesson-player/transcript/transcript.component';
import { DownloadOptionsComponent } from './lesson-player/download-options/download-options.component';
import { InteractiveTimestampComponent } from './lesson-player/interactive-timestamp/interactive-timestamp.component';
import { PictureInPictureComponent } from './lesson-player/picture-in-picture/picture-in-picture.component';
import { AnnotationToolsComponent } from './lesson-player/annotation-tools/annotation-tools.component';

// Quiz subcomponents
import { QuizTimerComponent } from './quiz/quiz-timer/quiz-timer.component';
import { QuizResultsComponent } from './quiz/quiz-results/quiz-results.component';
import { RetryMechanismComponent } from './quiz/retry-mechanism/retry-mechanism.component';

// Assignment subcomponents
import { SubmissionHistoryComponent } from './assignment/submission-history/submission-history.component';
import { PlagiarismCheckerComponent } from './assignment/plagiarism-checker/plagiarism-checker.component';
import { FileManagementComponent } from './assignment/file-management/file-management.component';

// Discussion subcomponents
import { ThreadedCommentsComponent } from './discussion/threaded-comments/threaded-comments.component';
import { MentionSystemComponent } from './discussion/mention-system/mention-system.component';

// Code Editor subcomponents
import { AutoSaveComponent } from './code-editor/auto-save/auto-save.component';
import { VersionControlComponent } from './code-editor/version-control/version-control.component';
import { EnvironmentSelectorComponent } from './code-editor/environment-selector/environment-selector.component';
import { CodeSnippetsComponent } from './code-editor/code-snippets/code-snippets.component';
import { LintingToolsComponent } from './code-editor/linting-tools/linting-tools.component';

import { AuthGuard } from '@app/shared/guard/auth.guard';
import { SharedModule } from '@app/shared/components/shared.module';

const routes: Routes = [
  {
    path: '',
    component: CourseComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'details', pathMatch: 'full' },
      { path: 'details', component: CourseDetailsComponent },
      { path: 'syllabus', component: CourseSyllabusComponent },
      { path: 'lesson/:lessonId', component: LessonPlayerComponent },
      { path: 'quiz/:quizId', component: QuizComponent },
      { path: 'assignment/:assignmentId', component: AssignmentComponent },
      { path: 'discussion', component: DiscussionComponent },
      { path: 'resources', component: ResourcesComponent },
      { path: 'notes', component: NoteTakingComponent },
      { path: 'bookmarks', component: BookmarkSystemComponent },
      { path: 'feedback', component: FeedbackSystemComponent },
      { path: 'peer-review', component: PeerReviewComponent },
      { path: 'code-editor', component: CodeEditorComponent },
      { path: 'project-submission', component: ProjectSubmissionComponent },
      { path: 'grading', component: GradingSystemComponent },
      { path: 'knowledge-check', component: KnowledgeCheckComponent },
      { path: 'interactive-exercises', component: InteractiveExercisesComponent },
      { path: 'accessibility', component: ContentAccessibilityComponent }
    ]
  }
];

@NgModule({
  declarations: [
    CourseComponent,
    CourseDetailsComponent,
    CourseSyllabusComponent,
    LessonPlayerComponent,
    SpeedControlComponent,
    TranscriptComponent,
    DownloadOptionsComponent,
    InteractiveTimestampComponent,
    PictureInPictureComponent,
    AnnotationToolsComponent,
    QuizComponent,
    QuizTimerComponent,
    QuizResultsComponent,
    RetryMechanismComponent,
    AssignmentComponent,
    SubmissionHistoryComponent,
    PlagiarismCheckerComponent,
    FileManagementComponent,
    DiscussionComponent,
    ThreadedCommentsComponent,
    MentionSystemComponent,
    ResourcesComponent,
    NoteTakingComponent,
    BookmarkSystemComponent,
    FeedbackSystemComponent,
    PeerReviewComponent,
    CodeEditorComponent,
    AutoSaveComponent,
    VersionControlComponent,
    EnvironmentSelectorComponent,
    CodeSnippetsComponent,
    LintingToolsComponent,
    ProjectSubmissionComponent,
    GradingSystemComponent,
    KnowledgeCheckComponent,
    InteractiveExercisesComponent,
    ContentAccessibilityComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    SharedModule
  ]
})
export class CourseModule { }