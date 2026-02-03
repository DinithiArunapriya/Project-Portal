package com.projectportal.project.service;

import com.projectportal.project.dto.ProjectCreateRequest;
import com.projectportal.project.dto.ProjectUpdateRequest;
import com.projectportal.project.model.Project;

import java.util.List;

public interface ProjectService {
    List<Project> list();
    Project get(Long id);
    Project create(ProjectCreateRequest req);
    Project update(Long id, ProjectUpdateRequest req);
    void delete(Long id);
}
