package com.wkrzywiec.medium.kanban.service;

import com.wkrzywiec.medium.kanban.exception.IllegalStatusTransitionException;
import com.wkrzywiec.medium.kanban.model.Task;
import com.wkrzywiec.medium.kanban.model.TaskDTO;
import com.wkrzywiec.medium.kanban.model.TaskHistory;
import com.wkrzywiec.medium.kanban.model.TaskStatus;
import com.wkrzywiec.medium.kanban.repository.TaskHistoryRepository;
import com.wkrzywiec.medium.kanban.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final TaskHistoryRepository taskHistoryRepository;

    @Override
    @Transactional
    public List<Task> getAllTasks() {
        List<Task> tasksList = new ArrayList<>();
        taskRepository.findAll().forEach(tasksList::add);
        return tasksList;
    }

    @Override
    @Transactional
    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }

    @Override
    @Transactional
    public Optional<Task> getTaskByTitle(String title) {
        return taskRepository.findByTitle(title);
    }

    @Override
    @Transactional
    public Task saveNewTask(TaskDTO taskDTO) {
        Task task = convertDTOToTask(taskDTO);
        if (task.getStatus() == null) {
            task.setStatus(TaskStatus.TODO);
        }
        Task savedTask = taskRepository.save(task);
        createTaskHistory(null, savedTask.getStatus(), savedTask, "System");
        return savedTask;
    }

    @Override
    @Transactional
    public Task updateTask(Task oldTask, TaskDTO newTaskDTO) {
        TaskStatus oldStatus = oldTask.getStatus();
        TaskStatus newStatus = newTaskDTO.getStatus();

        if (oldStatus != null && newStatus != null && !oldStatus.equals(newStatus)) {
            validateStatusTransition(oldStatus, newStatus);
        }

        Task updatedTask = updateTaskFromDTO(oldTask, newTaskDTO);
        Task savedTask = taskRepository.save(updatedTask);

        if (oldStatus != null && !oldStatus.equals(savedTask.getStatus())) {
            String changedBy = Optional.ofNullable(newTaskDTO.getChangedBy())
                    .filter(s -> !s.trim().isEmpty())
                    .orElse("Anonymous");
            createTaskHistory(oldStatus, savedTask.getStatus(), savedTask, changedBy);
        }

        return savedTask;
    }

    @Override
    @Transactional
    public void deleteTask(Task task) {
        if (task.getStatus() != null && task.getStatus().isDoneOrArchived()) {
            throw new IllegalStatusTransitionException(
                    String.format("Cannot delete task with status %s. Completed tasks are locked and cannot be deleted.", task.getStatus())
            );
        }
        taskRepository.delete(task);
    }

    @Override
    @Transactional
    public Task archiveTask(Task task) {
        throw new IllegalStatusTransitionException(
                "Archive functionality is disabled. DONE tasks are locked and cannot be modified."
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskHistory> getTaskHistory(Task task) {
        return taskHistoryRepository.findByTaskOrderByChangedAtAsc(task);
    }

    private void validateStatusTransition(TaskStatus from, TaskStatus to) {
        if (from.isImmutable()) {
            throw new IllegalStatusTransitionException(
                    String.format("Task is %s, cannot modify status", from)
            );
        }

        if (!from.canTransitionTo(to)) {
            throw new IllegalStatusTransitionException(from, to);
        }
    }

    private TaskHistory createTaskHistory(TaskStatus oldStatus, TaskStatus newStatus, Task task, String changedBy) {
        TaskHistory history = new TaskHistory();
        history.setOldStatus(oldStatus);
        history.setNewStatus(newStatus);
        history.setTask(task);
        history.setChangedBy(changedBy);
        return taskHistoryRepository.save(history);
    }

    private Task convertDTOToTask(TaskDTO taskDTO) {
        Task task = new Task();
        task.setTitle(taskDTO.getTitle());
        task.setDescription(taskDTO.getDescription());
        task.setColor(taskDTO.getColor());
        task.setStatus(taskDTO.getStatus());
        task.setDueDate(taskDTO.getDueDate());
        return task;
    }

    private Task updateTaskFromDTO(Task task, TaskDTO taskDTO){
        if(Optional.ofNullable(taskDTO.getTitle()).isPresent()){
            task.setTitle(taskDTO.getTitle());
        }

        if (Optional.ofNullable((taskDTO.getDescription())).isPresent()) {
            task.setDescription(taskDTO.getDescription());
        }

        if (Optional.ofNullable((taskDTO.getColor())).isPresent()) {
            task.setColor(taskDTO.getColor());
        }

        if (Optional.ofNullable((taskDTO.getStatus())).isPresent()) {
            task.setStatus(taskDTO.getStatus());
        }

        if (Optional.ofNullable((taskDTO.getDueDate())).isPresent()) {
            task.setDueDate(taskDTO.getDueDate());
        }
        return task;
    }
}
