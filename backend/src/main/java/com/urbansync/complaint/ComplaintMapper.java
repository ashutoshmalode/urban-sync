package com.urbansync.complaint;

public class ComplaintMapper {

    private ComplaintMapper() {}

    public static ComplaintDTO toDTO(Complaint complaint) {
        return ComplaintDTO.builder()
                .id(complaint.getId())
                .raisedById(complaint.getRaisedBy() != null
                        ? complaint.getRaisedBy().getId() : null)
                .raisedByName(complaint.getRaisedBy() != null
                        ? complaint.getRaisedBy().getFirstName()
                          + " " + complaint.getRaisedBy().getLastName()
                        : null)
                .subject(complaint.getSubject())
                .description(complaint.getDescription())
                .photoUrl(complaint.getPhotoUrl())
                .targetType(complaint.getTargetType())
                .targetResidentId(complaint.getTargetResident() != null
                        ? complaint.getTargetResident().getId() : null)
                .targetResidentName(complaint.getTargetResident() != null
                        ? complaint.getTargetResident().getFirstName()
                          + " " + complaint.getTargetResident().getLastName()
                        : null)
                .status(complaint.getStatus())
                .resolvedAt(complaint.getResolvedAt())
                .createdAt(complaint.getCreatedAt())
                .build();
    }

    public static CaretakerIssueDTO toIssueDTO(CaretakerIssue issue) {
        return CaretakerIssueDTO.builder()
                .id(issue.getId())
                .assignedToId(issue.getAssignedTo() != null
                        ? issue.getAssignedTo().getId() : null)
                .assignedToName(issue.getAssignedTo() != null
                        ? issue.getAssignedTo().getFirstName()
                          + " " + issue.getAssignedTo().getLastName()
                        : null)
                .assignedById(issue.getAssignedBy() != null
                        ? issue.getAssignedBy().getId() : null)
                .assignedByName(issue.getAssignedBy() != null
                        ? issue.getAssignedBy().getFirstName()
                          + " " + issue.getAssignedBy().getLastName()
                        : null)
                .title(issue.getTitle())
                .description(issue.getDescription())
                .status(issue.getStatus())
                .resolvedAt(issue.getResolvedAt())
                .createdAt(issue.getCreatedAt())
                .build();
    }
    
    public static ComplaintMediaDTO toMediaDTO(ComplaintMedia media) {
        return ComplaintMediaDTO.builder()
                .id(media.getId())
                .complaintId(media.getComplaint() != null
                        ? media.getComplaint().getId() : null)
                .mediaUrl(media.getMediaUrl())
                .mediaType(media.getMediaType())
                .createdAt(media.getCreatedAt())
                .build();
    }
    
    public static CaretakerIssueMediaDTO toIssueMediaDTO(
            CaretakerIssueMedia media) {
        return CaretakerIssueMediaDTO.builder()
                .id(media.getId())
                .issueId(media.getIssue() != null
                        ? media.getIssue().getId() : null)
                .mediaUrl(media.getMediaUrl())
                .mediaType(media.getMediaType())
                .uploadedBy(media.getUploadedBy())
                .createdAt(media.getCreatedAt())
                .build();
    }

}