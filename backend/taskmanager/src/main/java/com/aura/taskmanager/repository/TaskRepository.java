package com.aura.taskmanager.repository;
import com.aura.taskmanager.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    // We get save(), findAll(), deleteById(), and findById() for free!
}