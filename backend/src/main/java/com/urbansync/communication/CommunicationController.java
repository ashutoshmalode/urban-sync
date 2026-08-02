package com.urbansync.communication;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class CommunicationController {

    private final CommunicationService communicationService;

    public CommunicationController(
            CommunicationService communicationService) {
        this.communicationService = communicationService;
    }

    // ── Permission APIs ────────────────────────────────────────

    @PostMapping("/permission/raise")
    public ResponseEntity<PermissionRequestDTO> raisePermission(
            @Valid @RequestBody RaisePermissionRequest request) {
        return ResponseEntity.ok(
                communicationService.raisePermission(request));
    }

    @GetMapping("/permission/all")
    public ResponseEntity<List<PermissionRequestDTO>> getAllPermissions() {
        return ResponseEntity.ok(
                communicationService.getAllPermissions());
    }

    @GetMapping("/permission/{id}")
    public ResponseEntity<PermissionRequestDTO> getPermissionById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                communicationService.getPermissionById(id));
    }

    @PutMapping("/permission/{id}/approve")
    public ResponseEntity<PermissionRequestDTO> approvePermission(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                communicationService.approvePermission(id));
    }

    @PutMapping("/permission/{id}/reject")
    public ResponseEntity<PermissionRequestDTO> rejectPermission(
            @PathVariable Long id,
            @Valid @RequestBody RejectPermissionRequest request) {
        return ResponseEntity.ok(
                communicationService.rejectPermission(id, request));
    }

    @GetMapping("/permission/pending")
    public ResponseEntity<List<PermissionRequestDTO>> getPendingPermissions() {
        return ResponseEntity.ok(
                communicationService.getPendingPermissions());
    }

    @GetMapping("/permission/resident/{residentId}")
    public ResponseEntity<List<PermissionRequestDTO>> getByResident(
            @PathVariable Long residentId) {
        return ResponseEntity.ok(
                communicationService.getPermissionsByResident(residentId));
    }

    // ── Announcement APIs ──────────────────────────────────────

    @PostMapping("/announcement/create")
    public ResponseEntity<AnnouncementDTO> createAnnouncement(
            @Valid @RequestBody CreateAnnouncementRequest request) {
        return ResponseEntity.ok(
                communicationService.createAnnouncement(request));
    }

    @GetMapping("/announcement/all")
    public ResponseEntity<List<AnnouncementDTO>> getAllAnnouncements() {
        return ResponseEntity.ok(
                communicationService.getAllAnnouncements());
    }

    @GetMapping("/announcement/{id}")
    public ResponseEntity<AnnouncementDTO> getAnnouncementById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                communicationService.getAnnouncementById(id));
    }

    @DeleteMapping("/announcement/{id}")
    public ResponseEntity<Void> deleteAnnouncement(
            @PathVariable Long id) {
        communicationService.deleteAnnouncement(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/announcement/type/{type}")
    public ResponseEntity<List<AnnouncementDTO>> getByType(
            @PathVariable String type) {
        return ResponseEntity.ok(
                communicationService.getAnnouncementsByType(type));
    }

}