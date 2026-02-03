package com.projectportal.project.dto;

import com.projectportal.project.model.ProjectStatus;
import java.time.LocalDate;

public class ProjectCreateRequest {
    public String name;
    public String description;
    public ProjectStatus status;
    public Integer progress;
    public LocalDate startDate;
    public LocalDate endDate;
    public String assignedTo;
}
