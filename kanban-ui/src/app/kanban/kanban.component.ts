import { Component, OnInit } from '@angular/core';
import { KanbanService } from '../service/kanban-service.service';
import { ActivatedRoute } from '@angular/router';
import { Kanban } from '../model/kanban/kanban';
import { Task, TASK_STATUS, getAllowedTransitions, canTransitionTo, isImmutable, isDoneOrArchived } from '../model/task/task';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';
import { TaskService } from '../service/task.service';

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.css']
})
export class KanbanComponent implements OnInit {
  
  kanban: Kanban;
  allTasks: Task[] = [];
  todos: Task[] = [];
  inprogress: Task[] = [];
  dones: Task[] = [];
  searchKeyword: string = '';

  constructor(
    private kanbanService: KanbanService,
    private taskService: TaskService,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.getKanban();
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      this.handleDropWithValidation(event);
    }
  }

  private handleDropWithValidation(event: CdkDragDrop<string[], string[]>) {
    let taskId = event.item.element.nativeElement.id;
    let targetContainerId = event.container.id;
    let targetStatus = this.getStatusFromContainerId(targetContainerId);

    this.taskService.getTaskById(taskId).subscribe(
      response => {
        const currentStatus = response.status;
        
        if (isImmutable(currentStatus)) {
          this.showError('Completed tasks are locked and cannot be modified.');
          return;
        }

        if (targetStatus && canTransitionTo(currentStatus, targetStatus)) {
          this.promptForOperatorName((operatorName) => {
            this.updateTaskStatusAfterDragDrop(event, operatorName);
          });
        } else {
          this.showError(`Cannot transition from ${currentStatus} to ${targetStatus || 'unknown'}`);
        }
      },
      error => {
        this.showError('Failed to check task status');
      }
    );
  }

  private promptForOperatorName(callback: (name: string) => void): void {
    const name = prompt('Enter your name for the status change record:');
    callback(name || 'Anonymous');
  }

  private getStatusFromContainerId(containerId: string): string | null {
    switch (containerId) {
      case 'todo':
        return TASK_STATUS.TODO;
      case 'inpro':
        return TASK_STATUS.IN_PROGRESS;
      case 'done':
        return TASK_STATUS.DONE;
      default:
        return null;
    }
  }

  openDialogForNewTask(): void {
    this.openDialog('Create New Task', new Task());
  }

  openTaskDialog(event): void {
    let taskId = event.srcElement.id;

    this.taskService.getTaskById(taskId).subscribe(
      response => {
        this.openDialog('Update Task', response);
      }
    );
  }

  deleteTask(task: Task): void {
    if (isDoneOrArchived(task.status)) {
      this.showError('Cannot delete completed tasks. Completed tasks are locked.');
      return;
    }

    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(task.id).subscribe(
        () => {
          this.allTasks = this.allTasks.filter(t => t.id !== task.id);
          this.filterTasks();
        },
        error => {
          this.showError('Failed to delete task: ' + (error.error || error.message));
        }
      );
    }
  }

  canDeleteTask(task: Task): boolean {
    return !isDoneOrArchived(task.status);
  }

  onSearchChange(): void {
    this.filterTasks();
  }

  getRemainingDays(dueDate: string): number {
    if (!dueDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  isOverdue(dueDate: string): boolean {
    const remainingDays = this.getRemainingDays(dueDate);
    return remainingDays !== null && remainingDays < 0;
  }

  private getKanban(): void {
    const id = this.route.snapshot.paramMap.get('id');

    this.kanbanService.retrieveKanbanById(id).subscribe(
      response => {
        this.kanban = response;
        this.allTasks = [...response.tasks];
        this.splitTasksByStatus(response);
      }
    )
  }

  private splitTasksByStatus(kanban: Kanban): void {
    this.todos = kanban.tasks.filter(t=>t.status===TASK_STATUS.TODO);
    this.inprogress = kanban.tasks.filter(t=>t.status===TASK_STATUS.IN_PROGRESS);
    this.dones = kanban.tasks.filter(t=>t.status===TASK_STATUS.DONE);
  }

  private filterTasks(): void {
    let filteredTasks = this.allTasks;
    
    if (this.searchKeyword && this.searchKeyword.trim()) {
      const keyword = this.searchKeyword.toLowerCase();
      filteredTasks = this.allTasks.filter(t => 
        t.title && t.title.toLowerCase().includes(keyword)
      );
    }
    
    this.todos = filteredTasks.filter(t=>t.status===TASK_STATUS.TODO);
    this.inprogress = filteredTasks.filter(t=>t.status===TASK_STATUS.IN_PROGRESS);
    this.dones = filteredTasks.filter(t=>t.status===TASK_STATUS.DONE);
  }
  
  private updateTaskStatusAfterDragDrop(event: CdkDragDrop<string[], string[]>, operatorName: string) {
    let taskId = event.item.element.nativeElement.id;
    let containerId = event.container.id;

    this.taskService.getTaskById(taskId).subscribe(
        response => {
          this.updateTaskStatus(response, containerId, operatorName);
        }
    );
  }

  private updateTaskStatus(task: Task, containerId: string, operatorName: string): void {
    if (containerId === 'todo'){
      task.status = TASK_STATUS.TODO
    } else if (containerId === 'inpro'){
      task.status = TASK_STATUS.IN_PROGRESS
    } else if (containerId === 'done') {
      task.status = TASK_STATUS.DONE
    }
    task.changedBy = operatorName;
    this.taskService.updateTask(task).subscribe(
      response => {
        const index = this.allTasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
          this.allTasks[index] = response;
        }
        this.filterTasks();
      },
      error => {
        this.showError('Failed to update task status: ' + (error.error || error.message));
      }
    );
  }

  private showError(message: string): void {
    alert(message);
  }

  private openDialog(title: string, task: Task): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      title: title,
      task: task,
      kanbanId: this.kanban.id
    };
    const dialogRef = this.dialog.open(TaskDialogComponent, dialogConfig);
    
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'deleted' || result === 'saved') {
        this.getKanban();
      }
    });
  }
}
