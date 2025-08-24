package com.ph.dto;

import java.time.OffsetDateTime;
import java.time.LocalDate;
import java.util.UUID;

/*
 * DTO returned to client for tasks.
 */
public class TaskDto {
    private UUID id;
    private String title;
    private String description;
    private LocalDate due_date;
    private OffsetDateTime created_at;
    private OffsetDateTime updated_at;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getDue_date() { return due_date; }
    public void setDue_date(LocalDate due_date) { this.due_date = due_date; }

    public OffsetDateTime getCreated_at() { return created_at; }
    public void setCreated_at(OffsetDateTime created_at) { this.created_at = created_at; }

    public OffsetDateTime getUpdated_at() { return updated_at; }
    public void setUpdated_at(OffsetDateTime updated_at) { this.updated_at = updated_at; }
}
