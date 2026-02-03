package com.projectportal.project.dto;

import com.projectportal.project.model.ProjectStatus;
import java.time.LocalDate;

public class ProjectUpdateRequest {
    public String name;
    public String description;
    public ProjectStatus status;
    public Integer progress;
    public LocalDate startDate;  // restricted for DEV/DESIGNER/QA
    public LocalDate endDate;    // restricted for DEV/DESIGNER/QA
    public String assignedTo;
}
