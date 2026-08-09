package com.urbansync.complaint;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.urbansync.caretaker.CaretakerProfile;
import com.urbansync.caretaker.CaretakerRepository;
import com.urbansync.exception.BadRequestException;
import com.urbansync.exception.ResourceNotFoundException;
import com.urbansync.resident.ResidentProfile;
import com.urbansync.resident.ResidentRepository;
import com.urbansync.secretary.SecretaryProfile;
import com.urbansync.secretary.SecretaryRepository;

@Service
public class ComplaintServiceImpl implements ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final CaretakerIssueRepository issueRepository;
    private final ResidentRepository residentRepository;
    private final CaretakerRepository caretakerRepository;
    private final SecretaryRepository secretaryRepository;
    private final ComplaintMediaRepository mediaRepository;
    private final CaretakerIssueMediaRepository issueMediaRepository;

    public ComplaintServiceImpl(
            ComplaintRepository complaintRepository,
            CaretakerIssueRepository issueRepository,
            ResidentRepository residentRepository,
            CaretakerRepository caretakerRepository,
            SecretaryRepository secretaryRepository,
            ComplaintMediaRepository mediaRepository,
            CaretakerIssueMediaRepository issueMediaRepository) {

        this.complaintRepository = complaintRepository;
        this.issueRepository = issueRepository;
        this.residentRepository = residentRepository;
        this.caretakerRepository = caretakerRepository;
        this.secretaryRepository = secretaryRepository;
        this.mediaRepository = mediaRepository;
        this.issueMediaRepository = issueMediaRepository;
    }

    @Override
    @Transactional
    public ComplaintDTO raiseComplaint(RaiseComplaintRequest request) {

        ResidentProfile raisedBy = residentRepository
                .findById(request.getRaisedById())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Resident not found."));

        ResidentProfile targetResident = null;
        if (request.getTargetResidentId() != null) {
            targetResident = residentRepository
                    .findById(request.getTargetResidentId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Target resident not found."));
        }

        Complaint complaint = Complaint.builder()
                .raisedBy(raisedBy)
                .subject(request.getSubject())
                .description(request.getDescription())
                .photoUrl(request.getPhotoUrl())
                .targetType(request.getTargetType())
                .targetResident(targetResident)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        return ComplaintMapper.toDTO(
                complaintRepository.save(complaint));
    }

    @Override
    public List<ComplaintDTO> getAllComplaints() {
        return complaintRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(ComplaintMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ComplaintDTO getComplaintById(Long id) {
        return complaintRepository.findById(id)
                .map(ComplaintMapper::toDTO)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Complaint not found."));
    }

    @Override
    @Transactional
    public ComplaintDTO resolveComplaint(Long id) {

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Complaint not found."));

        if (complaint.getStatus().equals("RESOLVED")) {
            throw new BadRequestException("Complaint is already resolved.");
        }

        complaint.setStatus("RESOLVED");
        complaint.setResolvedAt(LocalDateTime.now());

        return ComplaintMapper.toDTO(
                complaintRepository.save(complaint));
    }

    @Override
    public List<ComplaintDTO> getComplaintsByResident(Long residentId) {
        return complaintRepository
                .findByRaisedById(residentId)
                .stream()
                .map(ComplaintMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CaretakerIssueDTO createIssue(CreateIssueRequest request) {

        CaretakerProfile caretaker = caretakerRepository
                .findById(request.getAssignedToId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Caretaker not found."));

        if (!caretaker.getStatus().equals("ACTIVE")) {
            throw new BadRequestException(
                    "Cannot assign issue to inactive caretaker.");
        }

        SecretaryProfile secretary = secretaryRepository
                .findById(request.getAssignedById())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Secretary not found."));

        CaretakerIssue issue = CaretakerIssue.builder()
                .assignedTo(caretaker)
                .assignedBy(secretary)
                .title(request.getTitle())
                .description(request.getDescription())
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        return ComplaintMapper.toIssueDTO(
                issueRepository.save(issue));
    }

    @Override
    public List<CaretakerIssueDTO> getIssuesByCaretaker(Long caretakerId) {
        return issueRepository
                .findByAssignedToId(caretakerId)
                .stream()
                .map(ComplaintMapper::toIssueDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CaretakerIssueDTO updateIssueStatus(Long id,
            UpdateIssueStatusRequest request) {

        CaretakerIssue issue = issueRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Issue not found."));

        List<String> validStatuses = List.of(
                "PENDING", "PROCESSING", "RESOLVED");

        if (!validStatuses.contains(request.getStatus())) {
            throw new BadRequestException(
                    "Invalid status. Must be PENDING, PROCESSING or RESOLVED.");
        }

        issue.setStatus(request.getStatus());

        if (request.getStatus().equals("RESOLVED")) {
            issue.setResolvedAt(LocalDateTime.now());
        }

        return ComplaintMapper.toIssueDTO(
                issueRepository.save(issue));
    }

    @Override
    public List<CaretakerIssueDTO> getAllIssues() {
        return issueRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(ComplaintMapper::toIssueDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<ComplaintMediaDTO> addMedia(
            AddComplaintMediaRequest request) {

        Complaint complaint = complaintRepository
                .findById(request.getComplaintId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Complaint not found."));

        List<String> validTypes = List.of("IMAGE", "VIDEO");
        if (!validTypes.contains(request.getMediaType())) {
            throw new BadRequestException(
                    "Invalid media type. Must be IMAGE or VIDEO.");
        }

        List<ComplaintMedia> mediaList = request.getMediaUrls()
                .stream()
                .map(url -> ComplaintMedia.builder()
                        .complaint(complaint)
                        .mediaUrl(url)
                        .mediaType(request.getMediaType())
                        .createdAt(LocalDateTime.now())
                        .build())
                .collect(Collectors.toList());

        return mediaRepository.saveAll(mediaList)
                .stream()
                .map(ComplaintMapper::toMediaDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ComplaintMediaDTO> getMediaByComplaintId(Long complaintId) {
        return mediaRepository.findByComplaintId(complaintId)
                .stream()
                .map(ComplaintMapper::toMediaDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<CaretakerIssueMediaDTO> addIssueMedia(
            AddIssueMediaRequest request) {

        CaretakerIssue issue = issueRepository
                .findById(request.getIssueId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Issue not found."));

        List<String> validTypes = List.of("IMAGE", "VIDEO");
        if (!validTypes.contains(request.getMediaType())) {
            throw new BadRequestException(
                    "Invalid media type. Must be IMAGE or VIDEO.");
        }

        List<String> validUploaders = List.of("SECRETARY", "CARETAKER");
        if (!validUploaders.contains(request.getUploadedBy())) {
            throw new BadRequestException(
                    "Invalid uploader. Must be SECRETARY or CARETAKER.");
        }

        List<CaretakerIssueMedia> mediaList = request.getMediaUrls()
                .stream()
                .map(url -> CaretakerIssueMedia.builder()
                        .issue(issue)
                        .mediaUrl(url)
                        .mediaType(request.getMediaType())
                        .uploadedBy(request.getUploadedBy())
                        .createdAt(LocalDateTime.now())
                        .build())
                .collect(Collectors.toList());

        return issueMediaRepository.saveAll(mediaList)
                .stream()
                .map(ComplaintMapper::toIssueMediaDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CaretakerIssueMediaDTO> getIssueMedia(Long issueId) {
        return issueMediaRepository.findByIssueId(issueId)
                .stream()
                .map(ComplaintMapper::toIssueMediaDTO)
                .collect(Collectors.toList());
    }

}