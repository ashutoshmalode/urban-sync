package com.urbansync.communication;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.urbansync.exception.BadRequestException;
import com.urbansync.exception.ResourceNotFoundException;
import com.urbansync.resident.ResidentProfile;
import com.urbansync.resident.ResidentRepository;
import com.urbansync.secretary.SecretaryProfile;
import com.urbansync.secretary.SecretaryRepository;

@Service
public class CommunicationServiceImpl implements CommunicationService {

    private final PermissionRequestRepository permissionRepository;
    private final AnnouncementRepository announcementRepository;
    private final ResidentRepository residentRepository;
    private final SecretaryRepository secretaryRepository;

    public CommunicationServiceImpl(
            PermissionRequestRepository permissionRepository,
            AnnouncementRepository announcementRepository,
            ResidentRepository residentRepository,
            SecretaryRepository secretaryRepository) {

        this.permissionRepository = permissionRepository;
        this.announcementRepository = announcementRepository;
        this.residentRepository = residentRepository;
        this.secretaryRepository = secretaryRepository;
    }

    @Override
    @Transactional
    public PermissionRequestDTO raisePermission(
            RaisePermissionRequest request) {

        ResidentProfile resident = residentRepository
                .findById(request.getRaisedById())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Resident not found."));

        PermissionRequest permission = PermissionRequest.builder()
                .raisedBy(resident)
                .subject(request.getSubject())
                .description(request.getDescription())
                .requestDate(request.getRequestDate())
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        return CommunicationMapper.toPermissionDTO(
                permissionRepository.save(permission));
    }

    @Override
    public List<PermissionRequestDTO> getAllPermissions() {
        return permissionRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(CommunicationMapper::toPermissionDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PermissionRequestDTO getPermissionById(Long id) {
        return permissionRepository.findById(id)
                .map(CommunicationMapper::toPermissionDTO)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Permission request not found."));
    }

    @Override
    @Transactional
    public PermissionRequestDTO approvePermission(Long id) {

        PermissionRequest permission = permissionRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Permission request not found."));

        if (!permission.getStatus().equals("PENDING")) {
            throw new BadRequestException(
                    "Request is already " + permission.getStatus());
        }

        permission.setStatus("APPROVED");
        return CommunicationMapper.toPermissionDTO(
                permissionRepository.save(permission));
    }

    @Override
    @Transactional
    public PermissionRequestDTO rejectPermission(Long id,
            RejectPermissionRequest request) {

        PermissionRequest permission = permissionRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Permission request not found."));

        if (!permission.getStatus().equals("PENDING")) {
            throw new BadRequestException(
                    "Request is already " + permission.getStatus());
        }

        permission.setStatus("REJECTED");
        permission.setRejectionReason(request.getReason());
        return CommunicationMapper.toPermissionDTO(
                permissionRepository.save(permission));
    }

    @Override
    public List<PermissionRequestDTO> getPendingPermissions() {
        return permissionRepository.findAllPending()
                .stream()
                .map(CommunicationMapper::toPermissionDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PermissionRequestDTO> getPermissionsByResident(
            Long residentId) {
        return permissionRepository.findByRaisedById(residentId)
                .stream()
                .map(CommunicationMapper::toPermissionDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AnnouncementDTO createAnnouncement(
            CreateAnnouncementRequest request) {

        SecretaryProfile secretary = secretaryRepository
                .findById(request.getCreatedById())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Secretary not found."));

        List<String> validTypes = List.of(
                "ALERT", "NOTIFICATION", "GENERAL");
        if (!validTypes.contains(request.getType())) {
            throw new BadRequestException(
                    "Invalid type. Must be ALERT, NOTIFICATION or GENERAL.");
        }

        Announcement announcement = Announcement.builder()
                .createdBy(secretary)
                .type(request.getType())
                .title(request.getTitle())
                .message(request.getMessage())
                .createdAt(LocalDateTime.now())
                .build();

        return CommunicationMapper.toAnnouncementDTO(
                announcementRepository.save(announcement));
    }

    @Override
    public List<AnnouncementDTO> getAllAnnouncements() {
        return announcementRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(CommunicationMapper::toAnnouncementDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AnnouncementDTO getAnnouncementById(Long id) {
        return announcementRepository.findById(id)
                .map(CommunicationMapper::toAnnouncementDTO)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Announcement not found."));
    }

    @Override
    @Transactional
    public void deleteAnnouncement(Long id) {
        Announcement announcement = announcementRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Announcement not found."));
        announcementRepository.delete(announcement);
    }

    @Override
    public List<AnnouncementDTO> getAnnouncementsByType(String type) {
        return announcementRepository.findByType(type)
                .stream()
                .map(CommunicationMapper::toAnnouncementDTO)
                .collect(Collectors.toList());
    }

}