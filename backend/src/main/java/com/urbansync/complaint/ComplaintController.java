package com.urbansync.complaint;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    // ── Complaint APIs ─────────────────────────────────────────

    @PostMapping("/complaint/raise")
    public ResponseEntity<ComplaintDTO> raiseComplaint(
            @Valid @RequestBody RaiseComplaintRequest request) {
        return ResponseEntity.ok(
                complaintService.raiseComplaint(request));
    }

    @GetMapping("/complaint/all")
    public ResponseEntity<List<ComplaintDTO>> getAllComplaints() {
        return ResponseEntity.ok(
                complaintService.getAllComplaints());
    }

    @GetMapping("/complaint/{id}")
    public ResponseEntity<ComplaintDTO> getComplaintById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                complaintService.getComplaintById(id));
    }

    @PutMapping("/complaint/{id}/resolve")
    public ResponseEntity<ComplaintDTO> resolveComplaint(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                complaintService.resolveComplaint(id));
    }

    @GetMapping("/complaint/resident/{residentId}")
    public ResponseEntity<List<ComplaintDTO>> getByResident(
            @PathVariable Long residentId) {
        return ResponseEntity.ok(
                complaintService.getComplaintsByResident(residentId));
    }

    // ── Caretaker Issue APIs ───────────────────────────────────

    @PostMapping("/caretaker-issue/create")
    public ResponseEntity<CaretakerIssueDTO> createIssue(
            @Valid @RequestBody CreateIssueRequest request) {
        return ResponseEntity.ok(
                complaintService.createIssue(request));
    }

    @GetMapping("/caretaker-issue/all")
    public ResponseEntity<List<CaretakerIssueDTO>> getAllIssues() {
        return ResponseEntity.ok(
                complaintService.getAllIssues());
    }

    @GetMapping("/caretaker-issue/caretaker/{caretakerId}")
    public ResponseEntity<List<CaretakerIssueDTO>> getByCaretaker(
            @PathVariable Long caretakerId) {
        return ResponseEntity.ok(
                complaintService.getIssuesByCaretaker(caretakerId));
    }

    @PutMapping("/caretaker-issue/{id}/status")
    public ResponseEntity<CaretakerIssueDTO> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateIssueStatusRequest request) {
        return ResponseEntity.ok(
                complaintService.updateIssueStatus(id, request));
    }

}