package com.medcore.medcore_backend.controller;

import com.medcore.medcore_backend.dto.DepartmentRequest;
import com.medcore.medcore_backend.dto.DepartmentResponse;
import com.medcore.medcore_backend.service.DepartmentService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(
            DepartmentService departmentService
    ) {
        this.departmentService = departmentService;
    }

    @PostMapping("/hospital/{hospitalId}")
    public ResponseEntity<DepartmentResponse> createDepartment(
            @PathVariable UUID hospitalId,
            @RequestBody DepartmentRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        departmentService.createDepartment(
                                hospitalId,
                                request
                        )
                );
    }

    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<List<DepartmentResponse>> getDepartments(
            @PathVariable UUID hospitalId
    ) {

        return ResponseEntity.ok(
                departmentService.getDepartments(hospitalId)
        );
    }
}