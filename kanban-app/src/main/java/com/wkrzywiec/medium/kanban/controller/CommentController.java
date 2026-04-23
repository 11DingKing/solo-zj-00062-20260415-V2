package com.wkrzywiec.medium.kanban.controller;

import com.wkrzywiec.medium.kanban.model.Comment;
import com.wkrzywiec.medium.kanban.model.CommentDTO;
import com.wkrzywiec.medium.kanban.service.CommentService;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/task/{taskId}")
    @ApiOperation(value="View a list of all comments for a task", response = Comment.class, responseContainer = "List")
    public ResponseEntity<?> getCommentsByTaskId(@PathVariable Long taskId){
        try {
            List<Comment> comments = commentService.getCommentsByTaskId(taskId);
            return new ResponseEntity<>(comments, HttpStatus.OK);
        } catch (Exception e) {
            return errorResponse();
        }
    }

    @GetMapping("/{id}")
    @ApiOperation(value="Find a comment info by its id", response = Comment.class)
    public ResponseEntity<?> getComment(@PathVariable Long id){
        try {
            Optional<Comment> optComment = commentService.getCommentById(id);
            if (optComment.isPresent()) {
                return new ResponseEntity<>(optComment.get(), HttpStatus.OK);
            } else {
                return noCommentFoundResponse(id);
            }
        } catch (Exception e) {
            return errorResponse();
        }
    }

    @PostMapping("/")
    @ApiOperation(value="Save new comment", response = Comment.class)
    public ResponseEntity<?> createComment(@RequestBody CommentDTO commentDTO){
        try {
            return new ResponseEntity<>(
                    commentService.saveNewComment(commentDTO),
                    HttpStatus.CREATED);
        } catch (Exception e) {
            return errorResponse();
        }
    }

    @DeleteMapping("/{id}")
    @ApiOperation(value="Delete Comment with specific id", response = String.class)
    public ResponseEntity<?> deleteComment(@PathVariable Long id){
        try {
            Optional<Comment> optComment = commentService.getCommentById(id);
            if (optComment.isPresent()) {
                commentService.deleteComment(optComment.get());
                return new ResponseEntity<>(String.format("Comment with id: %d was deleted", id), HttpStatus.OK);
            } else {
                return noCommentFoundResponse(id);
            }
        } catch (Exception e) {
            return errorResponse();
        }
    }

    private ResponseEntity<String> errorResponse(){
        return new ResponseEntity<>("Something went wrong :(", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private ResponseEntity<String> noCommentFoundResponse(Long id){
        return new ResponseEntity<>("No comment found with id: " + id, HttpStatus.NOT_FOUND);
    }
}
