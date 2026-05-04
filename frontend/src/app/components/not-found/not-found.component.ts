import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="narrow animate-in">
      <div class="alert alert-error" style="margin-bottom: 1rem;">
        ! TRANSMISSION NOT FOUND.
      </div>
    </div>
  `,
  styles: []
})
export class NotFoundComponent {}