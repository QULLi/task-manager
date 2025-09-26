package com.ph.controllers;

import com.ph.dto.TaskCreateDto;
import com.ph.dto.TaskDto;
import com.ph.exception.ResourceNotFoundException;
import com.ph.model.Task;
import com.ph.services.TaskService;
import com.ph.security.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/** REST endpoints for tasks. All actions are owner-scoped and authenticated. */
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;
    private final JwtService jwtService;

    public TaskController(TaskService taskService, JwtService jwtService) {
        this.taskService = taskService;
        this.jwtService = jwtService;
    }

    private UUID subjectToUuid(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new IllegalArgumentException("Missing authentication subject");
        }
        // Resolve subject (handles both plain UUID principals and principals that contain a JWT)
        String subject = jwtService.getUserIdFromAuthentication(auth);
        return UUID.fromString(subject);
    }

    private TaskDto toDto(Task t) {
        TaskDto dto = new TaskDto();
        dto.setId(t.getId());
        dto.setTitle(t.getTitle());
        dto.setDescription(t.getDescription());
        dto.setDue_date(t.getDueDate());
        dto.setCreated_at(t.getCreatedAt());
        dto.setUpdated_at(t.getUpdatedAt());
        return dto;
    }

    @PostMapping
    public ResponseEntity<TaskDto> createTask(@RequestBody TaskCreateDto createDto,
                                              Authentication authentication) {
        UUID ownerId = subjectToUuid(authentication);
        Task saved = taskService.createTask(ownerId, createDto);
        return ResponseEntity.ok(toDto(saved));
    }

    @GetMapping
    public ResponseEntity<List<TaskDto>> listTasks(Authentication authentication) {
        UUID ownerId = subjectToUuid(authentication);
        List<TaskDto> tasks = taskService.getTasksForOwner(ownerId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDto> getTask(@PathVariable String id,
                                           Authentication authentication) {
        UUID ownerId = subjectToUuid(authentication);
        UUID taskId;
        try {
            taskId = UUID.fromString(id);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid UUID format");
        }

        Task task = taskService.getTaskForOwner(ownerId, taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        return ResponseEntity.ok(toDto(task));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDto> updateTask(@PathVariable String id,
                                              @RequestBody TaskCreateDto dto,
                                              Authentication authentication) {
        UUID ownerId = subjectToUuid(authentication);
        UUID taskId;
        try {
            taskId = UUID.fromString(id);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid UUID format");
        }

        Task updated = taskService.updateTaskForOwner(ownerId, taskId, dto)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found or not owned by user"));
        return ResponseEntity.ok(toDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable String id,
                                           Authentication authentication) {
        UUID ownerId = subjectToUuid(authentication);
        UUID taskId;
        try {
            taskId = UUID.fromString(id);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid UUID format");
        }

        boolean deleted = taskService.deleteTaskForOwner(ownerId, taskId);
        if (!deleted) throw new ResourceNotFoundException("Task not found or not owned by user");
        return ResponseEntity.noContent().build();
    }
}
