package com.wkrzywiec.medium.kanban.exception;

import com.wkrzywiec.medium.kanban.model.TaskStatus;

public class IllegalStatusTransitionException extends RuntimeException {

    public IllegalStatusTransitionException(TaskStatus from, TaskStatus to) {
        super(String.format("Illegal status transition: %s -> %s", from, to));
    }

    public IllegalStatusTransitionException(String message) {
        super(message);
    }
}
