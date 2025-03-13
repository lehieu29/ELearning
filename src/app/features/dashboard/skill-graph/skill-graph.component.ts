// File path: src/app/features/dashboard/skill-graph/skill-graph.component.ts
import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { HttpService } from '@app/shared/services/http.service';
import { takeUntil } from 'rxjs';

export interface SkillCategory {
  name: string;
  skills: Skill[];
}

export interface Skill {
  id: string;
  name: string;
  proficiency: number; // 0-100 scale
  courseCount: number;
  color?: string;
}

@Component({
  selector: 'app-skill-graph',
  templateUrl: './skill-graph.component.html'
})
export class SkillGraphComponent extends BaseComponent implements OnInit {
  skillCategories: SkillCategory[] = [];
  isLoading: boolean = true;
  error: string = '';
  activeCategory: string = 'all';
  chartData: any[] = [];

  // For radar chart
  chartLabels: string[] = [];
  chartValues: number[] = [];
  chartColors: string[] = [];

  constructor(private http: HttpService) {
    super();
  }

  ngOnInit(): void {
    this.loadSkills();
  }

  loadSkills(): void {
    this.isLoading = true;

    this.http.get<{ data: SkillCategory[] }>('user/skills')
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.skillCategories = response.data;
          } else {
            // For demo purposes
            this.generateSampleSkills();
          }

          this.prepareChartData('all');
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading skills:', err);
          // For demo purposes
          this.generateSampleSkills();
          this.prepareChartData('all');
          this.isLoading = false;
        }
      });
  }

  changeCategory(categoryName: string): void {
    this.activeCategory = categoryName;
    this.prepareChartData(categoryName);
  }

  prepareChartData(categoryName: string): void {
    this.chartLabels = [];
    this.chartValues = [];
    this.chartColors = [];
    this.chartData = [];

    let skills: Skill[] = [];

    if (categoryName === 'all') {
      // Combine all skills from all categories
      this.skillCategories.forEach(category => {
        skills = [...skills, ...category.skills];
      });
    } else {
      // Get skills from the selected category
      const category = this.skillCategories.find(c => c.name === categoryName);
      if (category) {
        skills = category.skills;
      }
    }

    // Sort skills by proficiency (descending)
    skills.sort((a, b) => b.proficiency - a.proficiency);

    // Take top 8 skills for better visualization
    const topSkills = skills.slice(0, 8);

    // Prepare data for the chart
    topSkills.forEach(skill => {
      this.chartLabels.push(skill.name);
      this.chartValues.push(skill.proficiency);
      this.chartColors.push(skill.color || this.getRandomColor());

      this.chartData.push({
        name: skill.name,
        value: skill.proficiency,
        courseCount: skill.courseCount,
        color: skill.color || this.getRandomColor()
      });
    });
  }

  getSkillLevelText(proficiency: number): string {
    if (proficiency >= 90) return 'Expert';
    if (proficiency >= 70) return 'Advanced';
    if (proficiency >= 40) return 'Intermediate';
    if (proficiency >= 10) return 'Beginner';
    return 'Novice';
  }

  getSkillLevelClass(proficiency: number): string {
    if (proficiency >= 90) return 'bg-green-100 text-green-800';
    if (proficiency >= 70) return 'bg-blue-100 text-blue-800';
    if (proficiency >= 40) return 'bg-yellow-100 text-yellow-800';
    if (proficiency >= 10) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  }

  getRandomColor(): string {
    const colors = [
      '#4C51BF', '#2B6CB0', '#2D7A9C', '#2C7A7B',
      '#2F855A', '#48BB78', '#975A16', '#C05621',
      '#C53030', '#B83280', '#6B46C1', '#4C51BF'
    ];

    return colors[Math.floor(Math.random() * colors.length)];
  }

  // For demo purposes
  private generateSampleSkills(): void {
    this.skillCategories = [
      {
        name: 'Programming',
        skills: [
          { id: '1', name: 'JavaScript', proficiency: 85, courseCount: 7, color: '#F7DF1E' },
          { id: '2', name: 'Python', proficiency: 70, courseCount: 5, color: '#3776AB' },
          { id: '3', name: 'TypeScript', proficiency: 75, courseCount: 4, color: '#3178C6' },
          { id: '4', name: 'Java', proficiency: 45, courseCount: 2, color: '#ED8B00' },
          { id: '5', name: 'HTML/CSS', proficiency: 90, courseCount: 8, color: '#E34F26' }
        ]
      },
      {
        name: 'Data Science',
        skills: [
          { id: '6', name: 'Machine Learning', proficiency: 60, courseCount: 3, color: '#FF6384' },
          { id: '7', name: 'Data Analysis', proficiency: 65, courseCount: 4, color: '#36A2EB' },
          { id: '8', name: 'Statistics', proficiency: 55, courseCount: 2, color: '#4BC0C0' },
          { id: '9', name: 'Data Visualization', proficiency: 70, courseCount: 3, color: '#9966FF' }
        ]
      },
      {
        name: 'Design',
        skills: [
          { id: '10', name: 'UX Design', proficiency: 75, courseCount: 4, color: '#FF9F40' },
          { id: '11', name: 'UI Design', proficiency: 80, courseCount: 5, color: '#FFCD56' },
          { id: '12', name: 'Wireframing', proficiency: 85, courseCount: 3, color: '#FF6384' }
        ]
      },
      {
        name: 'Business',
        skills: [
          { id: '13', name: 'Project Management', proficiency: 65, courseCount: 3, color: '#36A2EB' },
          { id: '14', name: 'Marketing', proficiency: 30, courseCount: 1, color: '#4BC0C0' },
          { id: '15', name: 'Business Strategy', proficiency: 40, courseCount: 2, color: '#9966FF' }
        ]
      }
    ];
  }
}