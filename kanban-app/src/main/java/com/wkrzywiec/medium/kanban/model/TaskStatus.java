package com.wkrzywiec.medium.kanban.model;

import io.swagger.annotations.ApiModel;

import java.util.Arrays;
import java.util.List;

@ApiModel
public enum TaskStatus {
    TODO, INPROGRESS, DONE, ARCHIVED;

    public List<TaskStatus> getAllowedTransitions() {
        switch (this) {
            case TODO:
                return Arrays.asList(INPROGRESS);
            case INPROGRESS:
                return Arrays.asList(TODO, DONE);
            case DONE:
                return Arrays.asList();
            case ARCHIVED:
                return Arrays.asList();
            default:
                return Arrays.asList();
        }
    }

    public boolean canTransitionTo(TaskStatus targetStatus) {
        return getAllowedTransitions().contains(targetStatus);
    }

    public boolean isImmutable() {
        return this == DONE || this == ARCHIVED;
    }

    public boolean isDoneOrArchived() {
        return this == DONE || this == ARCHIVED;
    }
}
