package com.wkrzywiec.medium.kanban.repository;

import com.wkrzywiec.medium.kanban.model.Task;
import com.wkrzywiec.medium.kanban.model.TaskHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskHistoryRepository extends JpaRepository<TaskHistory, Long> {

    List<TaskHistory> findByTaskOrderByChangedAtAsc(Task task);
}
