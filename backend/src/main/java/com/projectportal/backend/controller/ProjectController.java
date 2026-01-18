package com.projectportal.backend.controller;

import com.projectportal.backend.model.Project;
import com.projectportal.backend.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/projects")
@CrossOrigin(origins = "http://localhost:5173") // your frontend URL
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    // GET all projects
    @GetMapping
    public List<Project> getProjects() {
        return projectRepository.findAll();
    }

    // POST a new project
    @PostMapping
    public Project createProject(@RequestBody Project project) {
        return projectRepository.save(project);
    }
}
