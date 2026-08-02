package com.urbansync.communication;

import java.util.List;

public interface CommunicationService {

    PermissionRequestDTO raisePermission(RaisePermissionRequest request);

    List<PermissionRequestDTO> getAllPermissions();

    PermissionRequestDTO getPermissionById(Long id);

    PermissionRequestDTO approvePermission(Long id);

    PermissionRequestDTO rejectPermission(Long id,
            RejectPermissionRequest request);

    List<PermissionRequestDTO> getPendingPermissions();

    List<PermissionRequestDTO> getPermissionsByResident(Long residentId);

    AnnouncementDTO createAnnouncement(CreateAnnouncementRequest request);

    List<AnnouncementDTO> getAllAnnouncements();

    AnnouncementDTO getAnnouncementById(Long id);

    void deleteAnnouncement(Long id);

    List<AnnouncementDTO> getAnnouncementsByType(String type);

}