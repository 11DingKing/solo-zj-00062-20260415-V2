package com.wkrzywiec.medium.kanban.service;

import com.wkrzywiec.medium.kanban.model.Comment;
import com.wkrzywiec.medium.kanban.model.CommentDTO;
import com.wkrzywiec.medium.kanban.model.Task;
import com.wkrzywiec.medium.kanban.repository.CommentRepository;
import com.wkrzywiec.medium.kanban.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;

    @Override
    @Transactional
    public List<Comment> getCommentsByTaskId(Long taskId) {
        return commentRepository.findByTaskIdOrderByCreatedAtDesc(taskId);
    }

    @Override
    @Transactional
    public Optional<Comment> getCommentById(Long id) {
        return commentRepository.findById(id);
    }

    @Override
    @Transactional
    public Comment saveNewComment(CommentDTO commentDTO) {
        return commentRepository.save(convertDTOToComment(commentDTO));
    }

    @Override
    @Transactional
    public void deleteComment(Comment comment) {
        commentRepository.delete(comment);
    }

    private Comment convertDTOToComment(CommentDTO commentDTO) {
        Comment comment = new Comment();
        comment.setContent(commentDTO.getContent());
        comment.setAuthor(commentDTO.getAuthor());
        
        if (commentDTO.getTaskId() != null) {
            Optional<Task> task = taskRepository.findById(commentDTO.getTaskId());
            task.ifPresent(comment::setTask);
        }
        
        return comment;
    }
}
