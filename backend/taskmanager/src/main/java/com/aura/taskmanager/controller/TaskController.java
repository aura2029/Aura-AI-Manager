package com.aura.taskmanager.controller;

import com.aura.taskmanager.model.Task;
import com.aura.taskmanager.repository.TaskRepository;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:5173")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private OllamaChatModel chatModel;

    @GetMapping
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    @PostMapping
    public Task createTask(@RequestBody Task task) {
        try {
            String prompt = "Analyze this task in 1 short sentence: " + task.getTitle();
            task.setAiSummary(chatModel.call(prompt));
        } catch (Exception e) {
            task.setAiSummary("AI_OFFLINE");
        }
        if (task.getStatus() == null) task.setStatus("ACTIVE");
        return taskRepository.save(task);
    }

    @PutMapping("/{id}")
    public Task updateTask(@PathVariable Long id, @RequestBody Task taskDetails) {
        return taskRepository.findById(id).map(task -> {
            task.setTitle(taskDetails.getTitle());
            task.setDescription(taskDetails.getDescription());
            task.setCategory(taskDetails.getCategory());
            try {
                task.setAiSummary(chatModel.call("Update analysis: " + task.getTitle()));
            } catch (Exception e) { /* keep old summary */ }
            return taskRepository.save(task);
        }).orElseThrow(() -> new RuntimeException("Task not found"));
    }

    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable Long id) {
        taskRepository.deleteById(id);
    }
}