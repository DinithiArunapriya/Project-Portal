package com.projectportal.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String category;
    private String status;
    private String priority;
    private String projectLead;
    private String teamMembers; // store as comma-separated string for simplicity
    private String startDate;
    private String endDate;
    private String deadline;
    private String remarks;
    private String comments;
}
