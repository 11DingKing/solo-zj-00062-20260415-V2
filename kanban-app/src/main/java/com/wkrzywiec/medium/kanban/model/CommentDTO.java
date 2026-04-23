package com.wkrzywiec.medium.kanban.model;

import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {

    @ApiModelProperty(position = 1)
    private Long id;

    @ApiModelProperty(position = 2)
    private String content;

    @ApiModelProperty(position = 3)
    private String author;

    @ApiModelProperty(position = 4)
    private LocalDateTime createdAt;

    @ApiModelProperty(position = 5)
    private Long taskId;
}
