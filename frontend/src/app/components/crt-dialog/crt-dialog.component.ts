import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crt-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <p class="message">{{ message }}</p>
        <div class="modal-actions">
          <button class="btn btn-danger" (click)="onConfirm()">{{ confirmLabel }}</button>
          <button class="btn" (click)="onCancel()">{{ cancelLabel }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .message {
      margin: 0 0 1rem 0;
      font-family: var(--font-mono, 'Share Tech Mono', monospace);
      font-size: 0.9rem;
      line-height: 1.5;
      color: var(--C, #5bf870);
    }
  `]
})
export class CrtDialogComponent {
  @Input() message = 'Are you sure?';
  @Input() confirmLabel = 'CONFIRM';
  @Input() cancelLabel = 'CANCEL';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() { this.confirmed.emit(); }
  onCancel()  { this.cancelled.emit(); }
}