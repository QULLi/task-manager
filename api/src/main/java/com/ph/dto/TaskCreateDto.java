package com.ph.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

/*
 * DTO used when creating or updating tasks.
 */
@Setter
@Getter
public class TaskCreateDto {
    private String title;
    private String description;
    private LocalDate due_date;

}
