import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '../base/base-component';

export interface Step {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  completed?: boolean;
  optional?: boolean;
  disabled?: boolean;
}

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html'
})
export class StepperComponent extends BaseComponent {
  @Input() steps: Step[] = [];
  @Input() activeStep: string = '';
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Input() linear: boolean = true;
  
  @Output() stepChange = new EventEmitter<string>();
  
  goToStep(step: Step): void {
    if (step.disabled) {
      return;
    }
    
    if (this.linear) {
      // In linear mode, only allow going to completed steps or the next uncompleted step
      const activeIndex = this.getStepIndex(this.activeStep);
      const targetIndex = this.getStepIndex(step.id);
      
      if (targetIndex > activeIndex) {
        // Check if all previous steps are completed
        const prevSteps = this.steps.slice(0, targetIndex);
        const allPrevCompleted = prevSteps.every(s => s.completed || s.optional);
        
        if (!allPrevCompleted) {
          return;
        }
      }
    }
    
    this.activeStep = step.id;
    this.stepChange.emit(step.id);
  }
  
  private getStepIndex(stepId: string): number {
    return this.steps.findIndex(step => step.id === stepId);
  }
  
  isStepActive(step: Step): boolean {
    return this.activeStep === step.id;
  }
  
  isStepAvailable(step: Step): boolean {
    if (step.disabled) {
      return false;
    }
    
    if (!this.linear) {
      return true;
    }
    
    const activeIndex = this.getStepIndex(this.activeStep);
    const stepIndex = this.getStepIndex(step.id);
    
    if (stepIndex < activeIndex) {
      return true;
    }
    
    if (stepIndex === activeIndex) {
      return true;
    }
    
    // For future steps, check if all previous steps are completed
    const prevSteps = this.steps.slice(0, stepIndex);
    return prevSteps.every(s => s.completed || s.optional);
  }
}