package com.projectportal.project.dto;

import com.projectportal.project.model.Project;
import com.projectportal.project.model.ProjectStatus;
import java.time.LocalDate;

public class ProjectResponse {
    public Long id;
    public String name;
    public String description;
    public ProjectStatus status;
    public Integer progress;
    public LocalDate startDate;
    public LocalDate endDate;
    public String assignedTo;
    public LocalDate createdAt;
    public LocalDate updatedAt;

    public static ProjectResponse from(Project p) {
        ProjectResponse r = new ProjectResponse();
        r.id = p.getId();
        r.name = p.getName();
        r.description = p.getDescription();
        r.status = p.getStatus();
        r.progress = p.getProgress();
        r.startDate = p.getStartDate();
        r.endDate = p.getEndDate();
        r.assignedTo = p.getAssignedTo();
        r.createdAt = p.getCreatedAt();
        r.updatedAt = p.getUpdatedAt();
        return r;
    }
}
