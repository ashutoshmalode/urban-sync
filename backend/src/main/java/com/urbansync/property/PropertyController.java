package com.urbansync.property;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class PropertyController {

    private final PropertyService propertyService;

    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    // Flat APIs 

    @PostMapping("/flat/create")
    public ResponseEntity<FlatDTO> createFlat(
            @Valid @RequestBody CreateFlatRequest request) {
        return ResponseEntity.ok(propertyService.createFlat(request));
    }

    @GetMapping("/flat/all")
    public ResponseEntity<List<FlatDTO>> getAllFlats() {
        return ResponseEntity.ok(propertyService.getAllFlats());
    }

    @GetMapping("/flat/{id}")
    public ResponseEntity<FlatDTO> getFlatById(
            @PathVariable Long id) {
        return ResponseEntity.ok(propertyService.getFlatById(id));
    }

    @PutMapping("/flat/{flatId}/assign-owner")
    public ResponseEntity<FlatDTO> assignOwner(
            @PathVariable Long flatId,
            @Valid @RequestBody AssignOwnerRequest request) {
        return ResponseEntity.ok(
                propertyService.assignOwner(flatId, request));
    }

    @PutMapping("/flat/{flatId}/assign-tenant")
    public ResponseEntity<FlatDTO> assignTenant(
            @PathVariable Long flatId,
            @Valid @RequestBody AssignTenantRequest request) {
        return ResponseEntity.ok(
                propertyService.assignTenant(flatId, request));
    }

    @PutMapping("/flat/{flatId}/remove-tenant")
    public ResponseEntity<FlatDTO> removeTenant(
            @PathVariable Long flatId) {
        return ResponseEntity.ok(propertyService.removeTenant(flatId));
    }

    @GetMapping("/flat/vacant")
    public ResponseEntity<List<FlatDTO>> getVacantFlats() {
        return ResponseEntity.ok(propertyService.getVacantFlats());
    }

    // Property Post APIs 

    @PostMapping("/property/post/create")
    public ResponseEntity<PropertyPostDTO> createPost(
            @Valid @RequestBody CreatePropertyPostRequest request) {
        return ResponseEntity.ok(propertyService.createPost(request));
    }

    @GetMapping("/property/post/all")
    public ResponseEntity<List<PropertyPostDTO>> getAllActivePosts() {
        return ResponseEntity.ok(propertyService.getAllActivePosts());
    }

    @PutMapping("/property/post/{postId}/mark-rented")
    public ResponseEntity<PropertyPostDTO> markRented(
            @PathVariable Long postId) {
        return ResponseEntity.ok(propertyService.markRented(postId));
    }

    @GetMapping("/property/post/history")
    public ResponseEntity<List<PropertyPostDTO>> getPostHistory() {
        return ResponseEntity.ok(propertyService.getPostHistory());
    }

}