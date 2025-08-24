package com.ph.services;

import com.ph.dto.TaskCreateDto;
import com.ph.model.Task;
import com.ph.repositories.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public Task createTask(UUID ownerId, TaskCreateDto dto) {
        Task t = new Task();
        t.setOwnerId(ownerId);
        t.setTitle(dto.getTitle());
        t.setDescription(dto.getDescription());
        t.setDueDate(dto.getDue_date());
        t.setCreatedAt(OffsetDateTime.now());
        t.setUpdatedAt(OffsetDateTime.now());
        return taskRepository.save(t);
    }

    public List<Task> getTasksForOwner(UUID ownerId) {
        return taskRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId);
    }

    public Optional<Task> getTaskForOwner(UUID ownerId, UUID taskId) {
        return taskRepository.findById(taskId)
                .filter(t -> ownerId.equals(t.getOwnerId()));
    }

    public Optional<Task> updateTaskForOwner(UUID ownerId, UUID taskId, TaskCreateDto dto) {
        return taskRepository.findById(taskId)
                .filter(t -> ownerId.equals(t.getOwnerId()))
                .map(t -> {
                    t.setTitle(dto.getTitle());
                    t.setDescription(dto.getDescription());
                    t.setDueDate(dto.getDue_date());
                    t.setUpdatedAt(OffsetDateTime.now());
                    return taskRepository.save(t);
                });
    }

    public boolean deleteTaskForOwner(UUID ownerId, UUID taskId) {
        return taskRepository.findById(taskId)
                .filter(t -> ownerId.equals(t.getOwnerId()))
                .map(t -> {
                    taskRepository.delete(t);
                    return true;
                }).orElse(false);
    }
}
