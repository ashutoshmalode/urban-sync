package com.urbansync.caretaker;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.urbansync.config.security.CustomUserDetails;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/caretaker")
public class CaretakerController {

    private final CaretakerService caretakerService;

    public CaretakerController(CaretakerService caretakerService) {
        this.caretakerService = caretakerService;
    }

    @PostMapping
    public ResponseEntity<CaretakerDTO> create(
            @Valid @RequestBody CaretakerCreateRequest request) {

        return ResponseEntity.ok(
                caretakerService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<CaretakerDTO>> getAll() {

        return ResponseEntity.ok(
                caretakerService.getAllCaretakers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CaretakerDTO> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                caretakerService.getById(id));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<CaretakerDTO> deleteCaretaker(
            @PathVariable Long id,
            @Valid @RequestBody DeleteCaretakerRequest request) {

        return ResponseEntity.ok(
                caretakerService.deleteCaretaker(id, request));
    }

    @GetMapping("/history")
    public ResponseEntity<List<CaretakerDTO>> getHistory() {

        return ResponseEntity.ok(
                caretakerService.getAllCaretakersHistory());
    }
    
    @GetMapping("/caretaker/me")
    public ResponseEntity<CaretakerDTO> getMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(
                caretakerService.getByMobile(
                        userDetails.getUsername()));
    }

}