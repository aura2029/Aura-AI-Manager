package com.aura.taskmanager.service;
import com.aura.taskmanager.model.Task;
import com.aura.taskmanager.repository.TaskRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ChatClient chatClient;

    public TaskService(TaskRepository taskRepository, ChatClient.Builder builder) {
        this.taskRepository = taskRepository;
        this.chatClient = builder.build();
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
    }

    public Task createTask(Task task) {
        String cat = (task.getCategory() != null) ? task.getCategory() : "General";
        String prompt = "Summarize this " + cat + " task: " + task.getDescription();

        String summary = chatClient.prompt()
                .user(prompt)
                .call()
                .content();

        task.setAiSummary(summary);
        task.setStatus("Pending");
        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new RuntimeException("Cannot delete. Task not found with id: " + id);
        }
        taskRepository.deleteById(id);
    }

    // UPDATED: This now updates every field sent from the frontend
    public Task updateTask(Long id, Task taskDetails) {
        Task existingTask = getTaskById(id);

        existingTask.setTitle(taskDetails.getTitle());
        existingTask.setDescription(taskDetails.getDescription());
        existingTask.setCategory(taskDetails.getCategory());
        existingTask.setStatus(taskDetails.getStatus());

        return taskRepository.save(existingTask);
    }

    // Helper method for saving if needed elsewhere
    public Task saveTask(Task task) {
        return taskRepository.save(task);
    }
}