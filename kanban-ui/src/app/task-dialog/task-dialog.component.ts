import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { Task } from '../model/task/task';
import { Comment } from '../model/comment/comment';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { KanbanService } from '../service/kanban-service.service';
import { TaskService } from '../service/task.service';

@Component({
  selector: 'app-task-dialog',
  templateUrl: './task-dialog.component.html',
  styleUrls: ['./task-dialog.component.css']
})
export class TaskDialogComponent implements OnInit {

  dialogTitle: String;
  kanbanId: String;
  task: Task;
  comments: Comment[] = [];
  newComment: string = '';
  commentAuthor: string = '';

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private kanbanService: KanbanService,
    private taskService: TaskService) {

    this.dialogTitle = data.title;
    this.kanbanId = data.kanbanId;
    this.task = data.task;

    this.form = fb.group({
      title: [this.task.title, Validators.required],
      description: [this.task.description, Validators.required],
      color: [this.task.color, Validators.required],
      dueDate: [this.task.dueDate ? new Date(this.task.dueDate) : null]
    });
   }

  ngOnInit() {
    if (this.task.id) {
      this.loadComments();
    }
  }

  loadComments(): void {
    this.taskService.getCommentsByTaskId(this.task.id).subscribe(
      response => {
        this.comments = response;
      }
    );
  }

  addComment(): void {
    if (!this.newComment.trim()) {
      return;
    }

    const comment: Comment = {
      id: null,
      content: this.newComment,
      author: this.commentAuthor || 'Anonymous',
      createdAt: null,
      taskId: this.task.id
    };

    this.taskService.createComment(comment).subscribe(
      response => {
        this.newComment = '';
        this.loadComments();
      }
    );
  }

  save() {
    this.mapFormToTaskModel();
    if (!this.task.id) {
      this.kanbanService.saveNewTaskInKanban(this.kanbanId, this.task).subscribe(
        () => {
          this.dialogRef.close('saved');
        }
      );
    } else {
      this.taskService.updateTask(this.task).subscribe(
        () => {
          this.dialogRef.close('saved');
        }
      );
    }
  }

  deleteTask(): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(this.task.id).subscribe(
        () => {
          this.dialogRef.close('deleted');
        }
      );
    }
  }

  close() {
      this.dialogRef.close();
  } 

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  private mapFormToTaskModel(): void {
    this.task.title = this.form.get('title').value;
    this.task.description = this.form.get('description').value;
    this.task.color = this.form.get('color').value;
    
    const dueDateValue = this.form.get('dueDate').value;
    if (dueDateValue) {
      if (dueDateValue instanceof Date) {
        this.task.dueDate = dueDateValue.toISOString().split('T')[0];
      } else {
        this.task.dueDate = dueDateValue;
      }
    } else {
      this.task.dueDate = null;
    }
    
    if (!this.task.status) {
      this.task.status = 'TODO';
    }
  }

}
