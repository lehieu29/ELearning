import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { Note } from '@app/shared/models/note.model';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-note-taking',
  templateUrl: './note-taking.component.html'
})
export class NoteTakingComponent extends BaseComponent implements OnInit {
  courseId: string;
  notes: Note[] = [];
  filteredNotes: Note[] = [];
  isLoading = true;
  error: string = '';
  
  // New note
  isAddingNote = false;
  newNoteTitle = '';
  newNoteContent = '';
  
  // Edit note
  editingNoteId: string | null = null;
  editTitle = '';
  editContent = '';
  
  // Filters
  searchQuery = '';
  sortBy: 'dateCreated' | 'dateUpdated' | 'title' = 'dateUpdated';
  sortDirection: 'asc' | 'desc' = 'desc';
  
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
          this.loadNotes();
        }
      });
  }
  
  loadNotes(): void {
    this.isLoading = true;
    
    this.courseService.getCourseNotes(this.courseId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (notes) => {
          this.notes = notes;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading notes:', err);
          this.error = 'Failed to load notes. Please try again.';
          this.isLoading = false;
        }
      });
  }
  
  applyFilters(): void {
    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      this.filteredNotes = this.notes.filter(note => 
        note.title.toLowerCase().includes(query) || 
        note.content.toLowerCase().includes(query)
      );
    } else {
      this.filteredNotes = [...this.notes];
    }
    
    // Apply sorting
    this.filteredNotes.sort((a, b) => {
      let valueA, valueB;
      
      switch (this.sortBy) {
        case 'title':
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
          break;
        case 'dateCreated':
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
        case 'dateUpdated':
        default:
          valueA = new Date(a.updatedAt || a.createdAt).getTime();
          valueB = new Date(b.updatedAt || b.createdAt).getTime();
          break;
      }
      
      return this.sortDirection === 'asc' 
        ? (valueA < valueB ? -1 : valueA > valueB ? 1 : 0)
        : (valueA > valueB ? -1 : valueA < valueB ? 1 : 0);
    });
  }
  
  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.applyFilters();
  }
  
  changeSorting(sortBy: 'dateCreated' | 'dateUpdated' | 'title'): void {
    if (this.sortBy === sortBy) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      this.sortDirection = 'desc';
    }
    
    this.applyFilters();
  }
  
  toggleAddNote(): void {
    this.isAddingNote = !this.isAddingNote;
    if (!this.isAddingNote) {
      this.resetNewNoteForm();
    }
  }
  
  resetNewNoteForm(): void {
    this.newNoteTitle = '';
    this.newNoteContent = '';
  }
  
  createNote(): void {
    if (!this.newNoteTitle.trim() || !this.newNoteContent.trim()) {
      return;
    }
    
    const newNote = {
      title: this.newNoteTitle,
      content: this.newNoteContent
    };
    
    this.courseService.createNote(this.courseId, newNote)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (note) => {
          this.notes.unshift(note);
          this.applyFilters();
          this.toggleAddNote();
          this.resetNewNoteForm();
        },
        error: (err) => {
          console.error('Error creating note:', err);
          this.error = 'Failed to create note. Please try again.';
        }
      });
  }
  
  startEditing(note: Note): void {
    this.editingNoteId = note.id;
    this.editTitle = note.title;
    this.editContent = note.content;
  }
  
  cancelEditing(): void {
    this.editingNoteId = null;
    this.editTitle = '';
    this.editContent = '';
  }
  
  updateNote(noteId: string): void {
    if (!this.editTitle.trim() || !this.editContent.trim()) {
      return;
    }
    
    const updatedNote = {
      title: this.editTitle,
      content: this.editContent
    };
    
    this.courseService.updateNote(this.courseId, noteId, updatedNote)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (note) => {
          const index = this.notes.findIndex(n => n.id === noteId);
          if (index !== -1) {
            this.notes[index] = note;
            this.applyFilters();
          }
          this.cancelEditing();
        },
        error: (err) => {
          console.error('Error updating note:', err);
          this.error = 'Failed to update note. Please try again.';
        }
      });
  }
  
  deleteNote(noteId: string): void {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }
    
    this.courseService.deleteNote(this.courseId, noteId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: () => {
          this.notes = this.notes.filter(note => note.id !== noteId);
          this.applyFilters();
        },
        error: (err) => {
          console.error('Error deleting note:', err);
          this.error = 'Failed to delete note. Please try again.';
        }
      });
  }
  
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
