import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-float-button',
  imports: [],
  templateUrl: './float-button.component.html',
  styleUrl: './float-button.component.scss'
})
export class FloatButtonComponent {

  @Output() buttonClick = new EventEmitter<void>();

  @Input() bottom: string | number = '24px';
  @Input() height: string | number = '56px';
  @Input() borderRadius: string | number = '24px';

  get bottomStyle(): string {
    return typeof this.bottom === 'number' ? `${this.bottom}px` : this.bottom;
  }

  get heightStyle(): string {
    return typeof this.height === 'number' ? `${this.height}px` : this.height;
  }

  get borderRadiusStyle(): string {
    return typeof this.height === 'number' ? `${this.height}%` : this.height;
  }


  onClick() {
    this.buttonClick.emit();
  }

}
