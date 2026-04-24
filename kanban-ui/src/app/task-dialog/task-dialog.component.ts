import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { Task, TASK_STATUS, getAllowedTransitions, canTransitionTo, isImmutable, isDoneOrArchived, TaskHistory } from '../model/task/task';
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
  history: TaskHistory[] = [];
  newComment: string = '';
  commentAuthor: string = '';
  statusOperatorName: string = '';

  form: FormGroup;
  taskStatus = TASK_STATUS;

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
      this.loadHistory();
    }
  }

  loadComments(): void {
    this.taskService.getCommentsByTaskId(this.task.id).subscribe(
      response => {
        this.comments = response;
      }
    );
  }

  loadHistory(): void {
    this.taskService.getTaskHistory(this.task.id).subscribe(
      response => {
        this.history = response;
      },
      error => {
        console.error('Failed to load task history:', error);
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
        },
        error => {
          alert('Failed to update task: ' + (error.error || error.message));
        }
      );
    }
  }

  deleteTask(): void {
    if (isDoneOrArchived(this.task.status)) {
      alert('Cannot delete completed tasks. Completed tasks are locked.');
      return;
    }

    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(this.task.id).subscribe(
        () => {
          this.dialogRef.close('deleted');
        },
        error => {
          alert('Failed to delete task: ' + (error.error || error.message));
        }
      );
    }
  }

  canDelete(): boolean {
    return this.task.id && !isDoneOrArchived(this.task.status);
  }

  isTaskImmutable(): boolean {
    return this.task.id && isImmutable(this.task.status);
  }

  getAvailableTransitions(): string[] {
    if (!this.task.status) return [];
    return getAllowedTransitions(this.task.status);
  }

  transitionToStatus(targetStatus: string): void {
    if (!canTransitionTo(this.task.status, targetStatus)) {
      alert('Invalid status transition');
      return;
    }

    const operatorName = prompt('Enter your name for the status change record:', this.statusOperatorName);
    if (operatorName === null) {
      return;
    }

    this.statusOperatorName = operatorName || 'Anonymous';
    
    const updatedTask = { ...this.task, status: targetStatus, changedBy: this.statusOperatorName };
    this.taskService.updateTask(updatedTask).subscribe(
      response => {
        this.task = response;
        this.loadHistory();
      },
      error => {
        alert('Failed to update status: ' + (error.error || error.message));
      }
    );
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  getStatusDisplay(status: string): string {
    if (!status) return 'N/A';
    switch (status) {
      case TASK_STATUS.TODO:
        return 'To Do';
      case TASK_STATUS.IN_PROGRESS:
        return 'In Progress';
      case TASK_STATUS.DONE:
        return 'Done';
      case TASK_STATUS.ARCHIVED:
        return 'Archived';
      default:
        return status;
    }
  }

  getOperatorDisplay(changedBy: string): string {
    if (!changedBy) return 'System';
    return changedBy;
  }

  close() {
      this.dialogRef.close();
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
      this.task.status = TASK_STATUS.TODO;
    }
  }
}
