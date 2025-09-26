package com.ph.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.time.LocalDate;
import java.util.UUID;

/*
 * DTO returned to client for tasks.
 */
@Setter
@Getter
public class TaskDto {
    private UUID id;
    private String title;
    private String description;
    private LocalDate due_date;
    private OffsetDateTime created_at;
    private OffsetDateTime updated_at;

}
