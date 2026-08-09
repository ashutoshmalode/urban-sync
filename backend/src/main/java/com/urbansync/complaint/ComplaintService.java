package com.urbansync.complaint;

import java.util.List;

public interface ComplaintService {

    ComplaintDTO raiseComplaint(RaiseComplaintRequest request);

    List<ComplaintDTO> getAllComplaints();

    ComplaintDTO getComplaintById(Long id);

    ComplaintDTO resolveComplaint(Long id);

    List<ComplaintDTO> getComplaintsByResident(Long residentId);

    CaretakerIssueDTO createIssue(CreateIssueRequest request);

    List<CaretakerIssueDTO> getIssuesByCaretaker(Long caretakerId);

    CaretakerIssueDTO updateIssueStatus(Long id,
            UpdateIssueStatusRequest request);

    List<CaretakerIssueDTO> getAllIssues();
    
    List<ComplaintMediaDTO> addMedia(AddComplaintMediaRequest request);

    List<ComplaintMediaDTO> getMediaByComplaintId(Long complaintId);
    
    List<CaretakerIssueMediaDTO> addIssueMedia(AddIssueMediaRequest request);

    List<CaretakerIssueMediaDTO> getIssueMedia(Long issueId);

}