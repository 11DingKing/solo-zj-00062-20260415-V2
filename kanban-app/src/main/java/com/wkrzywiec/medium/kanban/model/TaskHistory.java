package com.wkrzywiec.medium.kanban.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@NoArgsConstructor
@Table(name = "task_history")
@JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "id")
public class TaskHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @ApiModelProperty(position = 1)
    private Long id;

    @Enumerated(EnumType.STRING)
    @ApiModelProperty(position = 2)
    private TaskStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @ApiModelProperty(position = 3)
    private TaskStatus newStatus;

    @ApiModelProperty(position = 4)
    private String changedBy;

    @ApiModelProperty(position = 5)
    private LocalDateTime changedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private Task task;

    @PrePersist
    protected void onCreate() {
        changedAt = LocalDateTime.now();
    }
}
