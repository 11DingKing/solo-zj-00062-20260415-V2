import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task, TaskHistory } from '../model/task/task';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Comment } from '../model/comment/comment';



@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private kanbanAppUrl = environment.kanbanAppUrl

  constructor(private http: HttpClient) { }

  updateTask(task: Task): Observable<Task> {
    let headers = new HttpHeaders({'Content-Type': 'application/json' });
    let options = { headers: headers };
    return this.http.put<Task>(
      this.kanbanAppUrl + '/tasks/' + task.id,
      task,
      options);
  }

  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(this.kanbanAppUrl + '/tasks/' + id);
  }

  deleteTask(id: number): Observable<any> {
    return this.http.delete(this.kanbanAppUrl + '/tasks/' + id);
  }

  archiveTask(id: number): Observable<Task> {
    return this.http.put<Task>(this.kanbanAppUrl + '/tasks/' + id + '/archive', {});
  }

  getTaskHistory(id: number): Observable<TaskHistory[]> {
    return this.http.get<TaskHistory[]>(this.kanbanAppUrl + '/tasks/' + id + '/history');
  }

  getCommentsByTaskId(taskId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(this.kanbanAppUrl + '/comments/task/' + taskId);
  }

  createComment(comment: Comment): Observable<Comment> {
    let headers = new HttpHeaders({'Content-Type': 'application/json' });
    let options = { headers: headers };
    return this.http.post<Comment>(
      this.kanbanAppUrl + '/comments/',
      comment,
      options);
  }
}
