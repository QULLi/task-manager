package com.ph.dto;

import java.time.LocalDate;

/*
 * DTO used when creating or updating tasks.
 */
public class TaskCreateDto {
    private String title;
    private String description;
    private LocalDate due_date;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getDue_date() { return due_date; }
    public void setDue_date(LocalDate due_date) { this.due_date = due_date; }
}
