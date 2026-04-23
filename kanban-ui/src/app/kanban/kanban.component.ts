import { Component, OnInit } from '@angular/core';
import { KanbanService } from '../service/kanban-service.service';
import { ActivatedRoute } from '@angular/router';
import { Kanban } from '../model/kanban/kanban';
import { Task } from '../model/task/task';
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
      this.updateTaskStatusAfterDragDrop(event);
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
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
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(task.id).subscribe(
        () => {
          this.allTasks = this.allTasks.filter(t => t.id !== task.id);
          this.filterTasks();
        }
      );
    }
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
    this.todos = kanban.tasks.filter(t=>t.status==='TODO');
    this.inprogress = kanban.tasks.filter(t=>t.status==='INPROGRESS');
    this.dones = kanban.tasks.filter(t=>t.status==='DONE');
  }

  private filterTasks(): void {
    let filteredTasks = this.allTasks;
    
    if (this.searchKeyword && this.searchKeyword.trim()) {
      const keyword = this.searchKeyword.toLowerCase();
      filteredTasks = this.allTasks.filter(t => 
        t.title && t.title.toLowerCase().includes(keyword)
      );
    }
    
    this.todos = filteredTasks.filter(t=>t.status==='TODO');
    this.inprogress = filteredTasks.filter(t=>t.status==='INPROGRESS');
    this.dones = filteredTasks.filter(t=>t.status==='DONE');
  }
  
  private updateTaskStatusAfterDragDrop(event: CdkDragDrop<string[], string[]>) {
    let taskId = event.item.element.nativeElement.id;
    let containerId = event.container.id;

    this.taskService.getTaskById(taskId).subscribe(
        response => {
          this.updateTaskStatus(response, containerId);
        }
    );
  }

  private updateTaskStatus(task: Task, containerId: string): void {
    if (containerId === 'todo'){
      task.status = 'TODO'
    } else if (containerId === 'inpro'){
      task.status = 'INPROGRESS'
    } else {
      task.status = 'DONE'
    }
    this.taskService.updateTask(task).subscribe();
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
