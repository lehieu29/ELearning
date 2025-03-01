import { Component } from '@angular/core';

@Component({
  selector: 'app-course-card',
  standalone: false,
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.scss'
})
export class CourseCardComponent {
  courses = [
    {
      title: 'AI Programming with Python',
      rating: 4.8,
      duration: '4 Months',
      price: 399,
      thumbnail: 'assets/courses/ai.jpg'
    },
    {
      title: 'Data Science Fundamentals',
      rating: 4.7,
      duration: '3 Months',
      price: 299,
      thumbnail: 'assets/courses/data-science.jpg'
    }
  ];
}
