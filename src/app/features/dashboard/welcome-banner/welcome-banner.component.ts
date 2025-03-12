// File path: src/app/features/dashboard/welcome-banner/welcome-banner.component.ts
import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { AuthService } from '@app/shared/services/auth.service';
import { User } from '@app/shared/models/user.model';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-welcome-banner',
  templateUrl: './welcome-banner.component.html'
})
export class WelcomeBannerComponent extends BaseComponent implements OnInit {
  currentUser: User | null = null;
  greeting: string = '';
  motivationalQuote: string = '';
  isLoading: boolean = true;

  // Array of motivational quotes
  private quotes: string[] = [
    "The expert in anything was once a beginner.",
    "Learning is not attained by chance, it must be sought for with ardor and diligence.",
    "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.",
    "The beautiful thing about learning is that nobody can take it away from you.",
    "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
    "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    "Anyone who stops learning is old, whether at twenty or eighty.",
    "Never let formal education get in the way of your learning.",
    "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice."
  ];

  constructor(private authService: AuthService) {
    super();
  }

  ngOnInit(): void {
    this.loadUserData();
    this.setGreeting();
    this.setRandomQuote();
  }

  private loadUserData(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(user => {
        this.currentUser = user;
        this.isLoading = false;
      });
  }

  private setGreeting(): void {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
      this.greeting = 'Good morning';
    } else if (currentHour < 18) {
      this.greeting = 'Good afternoon';
    } else {
      this.greeting = 'Good evening';
    }
  }

  private setRandomQuote(): void {
    const randomIndex = Math.floor(Math.random() * this.quotes.length);
    this.motivationalQuote = this.quotes[randomIndex];
  }

  getUserDisplayName(): string {
    if (!this.currentUser) return '';

    return this.currentUser.fullName || 'there';
  }
}