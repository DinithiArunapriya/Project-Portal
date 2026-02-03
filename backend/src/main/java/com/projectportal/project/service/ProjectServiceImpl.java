package com.projectportal.project.service;

import com.projectportal.common.security.SecurityUtil;
import com.projectportal.project.dto.ProjectCreateRequest;
import com.projectportal.project.dto.ProjectUpdateRequest;
import com.projectportal.project.model.Project;
import com.projectportal.project.model.ProjectStatus;
import com.projectportal.project.repo.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository repo;

    public ProjectServiceImpl(ProjectRepository repo) {
        this.repo = repo;
    }

    @Override
    public List<Project> list() {
        return repo.findAll();
    }

    @Override
    public Project get(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Project not found"));
    }

    @Override
    public Project create(ProjectCreateRequest req) {
        // ✅ Create only: SUPER_ADMIN, MANAGER, BUSINESS_ANALYST
        if (!SecurityUtil.isAnyRole("SUPER_ADMIN", "MANAGER", "BUSINESS_ANALYST")) {
            throw new RuntimeException("You do not have permission to create projects");
        }

        if (req.name == null || req.name.trim().isEmpty()) {
            throw new RuntimeException("Project name is required");
        }

        Project p = new Project();
        p.setName(req.name.trim());
        p.setDescription(req.description);

        p.setStatus(req.status != null ? req.status : ProjectStatus.PLANNED);
        p.setProgress(req.progress != null ? clamp(req.progress) : 0);

        p.setStartDate(req.startDate);
        p.setEndDate(req.endDate);
        p.setAssignedTo(req.assignedTo);

        return repo.save(p);
    }

    @Override
    public Project update(Long id, ProjectUpdateRequest req) {
        Project p = get(id);

        String role = SecurityUtil.role();

        // ✅ HR: read-only
        if (role.equalsIgnoreCase("HR")) {
            throw new RuntimeException("HR cannot edit projects");
        }

        // ✅ DEV/DESIGNER/QA: can update only basic fields (NOT dates / NOT delete / NOT create)
        boolean limited = SecurityUtil.isAnyRole("DEVELOPER", "DESIGNER", "QA");

        // name/description/status/progress always allowed for those limited roles
        if (req.name != null) p.setName(req.name.trim());
        if (req.description != null) p.setDescription(req.description);
        if (req.status != null) p.setStatus(req.status);
        if (req.progress != null) p.setProgress(clamp(req.progress));

        // assignedTo: allow only higher roles
        if (req.assignedTo != null) {
            if (SecurityUtil.isAnyRole("SUPER_ADMIN", "MANAGER", "BUSINESS_ANALYST")) {
                p.setAssignedTo(req.assignedTo);
            } else if (limited) {
                // ignore silently OR block. I block to be clear.
                throw new RuntimeException("You cannot change Assigned To");
            }
        }

        // dates: restricted for DEV/DESIGNER/QA
        if (req.startDate != null || req.endDate != null) {
            if (limited) {
                throw new RuntimeException("You cannot change project dates/deadlines");
            }
            p.setStartDate(req.startDate);
            p.setEndDate(req.endDate);
        }

        return repo.save(p);
    }

    @Override
    public void delete(Long id) {
        // ✅ Delete only: SUPER_ADMIN, MANAGER
        if (!SecurityUtil.isAnyRole("SUPER_ADMIN", "MANAGER")) {
            throw new RuntimeException("You do not have permission to delete projects");
        }
        repo.deleteById(id);
    }

    private int clamp(Integer v) {
        if (v == null) return 0;
        return Math.max(0, Math.min(100, v));
    }
}
