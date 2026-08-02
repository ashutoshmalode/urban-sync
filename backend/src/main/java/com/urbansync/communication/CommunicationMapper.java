package com.urbansync.communication;

public class CommunicationMapper {

    private CommunicationMapper() {}

    public static PermissionRequestDTO toPermissionDTO(
            PermissionRequest req) {
        return PermissionRequestDTO.builder()
                .id(req.getId())
                .raisedById(req.getRaisedBy() != null
                        ? req.getRaisedBy().getId() : null)
                .raisedByName(req.getRaisedBy() != null
                        ? req.getRaisedBy().getFirstName() + " "
                          + req.getRaisedBy().getLastName() : null)
                .raisedByFlat(req.getRaisedBy() != null
                        ? req.getRaisedBy().getFlatNumber() : null)
                .subject(req.getSubject())
                .description(req.getDescription())
                .requestDate(req.getRequestDate())
                .status(req.getStatus())
                .rejectionReason(req.getRejectionReason())
                .createdAt(req.getCreatedAt())
                .build();
    }

    public static AnnouncementDTO toAnnouncementDTO(
            Announcement announcement) {
        return AnnouncementDTO.builder()
                .id(announcement.getId())
                .createdById(announcement.getCreatedBy() != null
                        ? announcement.getCreatedBy().getId() : null)
                .createdByName(announcement.getCreatedBy() != null
                        ? announcement.getCreatedBy().getFirstName() + " "
                          + announcement.getCreatedBy().getLastName() : null)
                .type(announcement.getType())
                .title(announcement.getTitle())
                .message(announcement.getMessage())
                .createdAt(announcement.getCreatedAt())
                .build();
    }

}