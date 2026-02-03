package com.projectportal.project.controller;

import com.projectportal.project.dto.ProjectCreateRequest;
import com.projectportal.project.dto.ProjectResponse;
import com.projectportal.project.dto.ProjectUpdateRequest;
import com.projectportal.project.model.Project;
import com.projectportal.project.service.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*") // adjust later
public class ProjectController {

    private final ProjectService service;

    public ProjectController(ProjectService service) {
        this.service = service;
    }

    @GetMapping
    public List<ProjectResponse> list() {
        return service.list().stream().map(ProjectResponse::from).toList();
    }

    @GetMapping("/{id}")
    public ProjectResponse get(@PathVariable Long id) {
        Project p = service.get(id);
        return ProjectResponse.from(p);
    }

    @PostMapping
    public ProjectResponse create(@RequestBody ProjectCreateRequest req) {
        return ProjectResponse.from(service.create(req));
    }

    @PutMapping("/{id}")
    public ProjectResponse update(@PathVariable Long id, @RequestBody ProjectUpdateRequest req) {
        return ProjectResponse.from(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
