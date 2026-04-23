package com.wkrzywiec.medium.kanban.service;

import com.wkrzywiec.medium.kanban.model.Comment;
import com.wkrzywiec.medium.kanban.model.CommentDTO;

import java.util.List;
import java.util.Optional;

public interface CommentService {

    List<Comment> getCommentsByTaskId(Long taskId);

    Optional<Comment> getCommentById(Long id);

    Comment saveNewComment(CommentDTO commentDTO);

    void deleteComment(Comment comment);
}
