package com.projectportal.backend.service;

import com.projectportal.backend.model.Project;
import com.projectportal.backend.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository repo;

    public ProjectService(ProjectRepository repo) {
        this.repo = repo;
    }

    public Project create(Project p) {
        return repo.save(p);
    }

    public List<Project> getAll() {
        return repo.findAll();
    }
}
