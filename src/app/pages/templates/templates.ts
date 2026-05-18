import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TemplatesService, Template } from '../../core/services/templates.service';

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSlideToggleModule, MatSnackBarModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Reply Templates</h1>
          <p>The bot picks the template with the lowest use count to keep replies varied.</p>
        </div>
      </div>

      <mat-card class="add-card">
        <h3>New Template</h3>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Message text</mat-label>
          <textarea matInput [formControl]="contentCtrl" rows="3" placeholder="Hey! Yes it is still available. When would you like to see it?"></textarea>
        </mat-form-field>
        @if (addError) { <p class="error">{{ addError }}</p> }
        <button mat-flat-button color="primary" (click)="add()" [disabled]="contentCtrl.invalid || adding">
          <mat-icon>add</mat-icon> Add Template
        </button>
      </mat-card>

      <div class="templates-list">
        @for (t of templates; track t.id) {
          <mat-card class="template-card">
            @if (editing === t.id) {
              <mat-form-field appearance="outline" class="full">
                <textarea matInput [formControl]="editCtrl" rows="3"></textarea>
              </mat-form-field>
              <div class="edit-actions">
                <button mat-flat-button color="primary" (click)="saveEdit(t)">Save</button>
                <button mat-button (click)="editing = null">Cancel</button>
              </div>
            } @else {
              <div class="template-body">
                <p class="template-text">{{ t.content }}</p>
                <div class="template-meta">Used {{ t.useCount }} time{{ t.useCount === 1 ? '' : 's' }}</div>
              </div>
              <div class="template-actions">
                <mat-slide-toggle [checked]="t.isActive" (change)="toggle(t, $event.checked)" color="primary" />
                <button mat-icon-button (click)="startEdit(t)"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button color="warn" (click)="remove(t)"><mat-icon>delete</mat-icon></button>
              </div>
            }
          </mat-card>
        }
        @if (templates.length === 0) {
          <div class="empty">
            <mat-icon>message</mat-icon>
            <p>No templates yet. Add your first reply above.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 32px; max-width: 760px; }
    .page-header { margin-bottom: 24px; }
    h1 { margin: 0 0 4px; font-size: 26px; }
    p { margin: 0; color: #666; }
    .add-card { padding: 20px; margin-bottom: 24px; }
    .add-card h3 { margin: 0 0 12px; }
    .full { width: 100%; display: block; }
    .error { color: #e53935; font-size: 13px; margin: 0 0 8px; }
    .templates-list { display: flex; flex-direction: column; gap: 12px; }
    .template-card { padding: 16px 20px; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
    .template-body { flex: 1; }
    .template-text { margin: 0 0 6px; font-size: 14px; line-height: 1.5; }
    .template-meta { font-size: 12px; color: #aaa; }
    .template-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
    .edit-actions { display: flex; gap: 8px; margin-top: 8px; }
    .empty { text-align: center; padding: 48px; color: #aaa; }
    .empty mat-icon { font-size: 56px; width: 56px; height: 56px; }
  `]
})
export class Templates implements OnInit {
  templates: Template[] = [];
  contentCtrl = new FormControl('', Validators.required);
  editCtrl = new FormControl('', Validators.required);
  editing: string | null = null;
  adding = false; addError = '';

  constructor(private svc: TemplatesService, private snack: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load() { this.svc.getAll().subscribe((t) => (this.templates = t)); }

  add() {
    if (this.contentCtrl.invalid) return;
    this.adding = true; this.addError = '';
    this.svc.create(this.contentCtrl.value!).subscribe({
      next: () => { this.contentCtrl.reset(); this.adding = false; this.load(); this.snack.open('Template added', 'OK', { duration: 2500 }); },
      error: (e) => { this.addError = e.error?.message || 'Failed'; this.adding = false; }
    });
  }

  startEdit(t: Template) { this.editing = t.id; this.editCtrl.setValue(t.content); }

  saveEdit(t: Template) {
    if (this.editCtrl.invalid) return;
    this.svc.update(t.id, { content: this.editCtrl.value! }).subscribe(() => { this.editing = null; this.load(); this.snack.open('Saved', 'OK', { duration: 2000 }); });
  }

  toggle(t: Template, active: boolean) {
    this.svc.update(t.id, { isActive: active }).subscribe(() => (t.isActive = active));
  }

  remove(t: Template) {
    if (!confirm('Delete this template?')) return;
    this.svc.remove(t.id).subscribe(() => { this.load(); this.snack.open('Deleted', 'OK', { duration: 2000 }); });
  }
}
