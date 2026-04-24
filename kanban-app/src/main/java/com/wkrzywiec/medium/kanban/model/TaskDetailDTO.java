package com.wkrzywiec.medium.kanban.model;

import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskDetailDTO {

    @ApiModelProperty(position = 1)
    private Long id;

    @ApiModelProperty(position = 2)
    private String title;

    @ApiModelProperty(position = 3)
    private String description;

    @ApiModelProperty(position = 4)
    private String color;

    @ApiModelProperty(position = 5)
    private TaskStatus status;

    @ApiModelProperty(position = 6)
    private LocalDate dueDate;

    @ApiModelProperty(position = 7)
    private List<TaskHistory> history;
}
