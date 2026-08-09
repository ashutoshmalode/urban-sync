package com.urbansync.dashboard;

import java.math.BigDecimal;
import com.urbansync.registration.RegistrationRepository;
import org.springframework.stereotype.Service;
import com.urbansync.communication.PermissionRequestRepository;
import com.urbansync.caretaker.CaretakerRepository;
import com.urbansync.communication.AnnouncementRepository;
import com.urbansync.complaint.CaretakerIssueRepository;
import com.urbansync.complaint.ComplaintRepository;
import com.urbansync.maintenance.MaintenanceBillRepository;
import com.urbansync.payment.SocietyFundRepository;
import com.urbansync.property.FlatRepository;
import com.urbansync.property.PropertyPostRepository;
import com.urbansync.resident.ResidentRepository;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final ResidentRepository residentRepository;
    private final FlatRepository flatRepository;
    private final CaretakerRepository caretakerRepository;
    private final ComplaintRepository complaintRepository;
    private final CaretakerIssueRepository issueRepository;
    private final MaintenanceBillRepository billRepository;
    private final SocietyFundRepository fundRepository;
    private final RegistrationRepository registrationRepository;
    private final PermissionRequestRepository permissionRepository;
    private final AnnouncementRepository announcementRepository;
    private final PropertyPostRepository propertyPostRepository;

    public DashboardServiceImpl(
            ResidentRepository residentRepository,
            FlatRepository flatRepository,
            CaretakerRepository caretakerRepository,
            ComplaintRepository complaintRepository,
            CaretakerIssueRepository issueRepository,
            MaintenanceBillRepository billRepository,
            SocietyFundRepository fundRepository,
            RegistrationRepository registrationRepository,
            PermissionRequestRepository permissionRepository,
            AnnouncementRepository announcementRepository,
            PropertyPostRepository propertyPostRepository) {

        this.residentRepository = residentRepository;
        this.flatRepository = flatRepository;
        this.caretakerRepository = caretakerRepository;
        this.complaintRepository = complaintRepository;
        this.issueRepository = issueRepository;
        this.billRepository = billRepository;
        this.fundRepository = fundRepository;
        this.registrationRepository = registrationRepository;
        this.permissionRepository = permissionRepository;
        this.announcementRepository = announcementRepository;
        this.propertyPostRepository = propertyPostRepository;
    }

    @Override
    public DashboardDTO getSecretaryDashboard() {

        // Residents
        long totalResidents = residentRepository.countByStatus("ACTIVE");
        long totalOwners = residentRepository.countByResidentTypeAndStatus("OWNER", "ACTIVE");
        long totalTenants = residentRepository.countByResidentTypeAndStatus("TENANT", "ACTIVE");

        // Flats
        long totalFlats = flatRepository.count();
        long occupiedFlats = flatRepository.countByOwnerIsNotNull();
        long vacantFlats = flatRepository.countByOwnerIsNull();

        // Caretakers
        long activeCaretakers = caretakerRepository.countByStatus("ACTIVE");
        long totalCaretakers = caretakerRepository.count();

        // Complaints
        long totalComplaints = complaintRepository.count();
        long pendingComplaints = complaintRepository.countByStatus("PENDING");
        long resolvedComplaints = complaintRepository.countByStatus("RESOLVED");

        // Issues
        long totalIssues = issueRepository.count();
        long pendingIssues = issueRepository.countByStatus("PENDING");
        long processingIssues = issueRepository.countByStatus("PROCESSING");
        long resolvedIssues = issueRepository.countByStatus("RESOLVED");

        // Maintenance bills
        long totalBills = billRepository.count();
        long pendingBills = billRepository.countByStatus("PENDING");
        long paidBills = billRepository.countByStatus("PAID");
        BigDecimal totalCollected = billRepository.sumAmountByStatus("PAID");
        BigDecimal totalPending = billRepository.sumAmountByStatus("PENDING");

        // Society Fund
        BigDecimal fundBalance = fundRepository.findFirstByOrderByIdAsc()
                .map(f -> f.getBalance())
                .orElse(BigDecimal.ZERO);

        // Registrations
        long totalRegistrations = registrationRepository.count();
        long pendingRegistrations = registrationRepository.countByStatus("PENDING");
        long approvedRegistrations = registrationRepository.countByStatus("APPROVED");
        long rejectedRegistrations = registrationRepository.countByStatus("REJECTED");

        // Permissions
        long totalPermissions = permissionRepository.count();
        long pendingPermissions = permissionRepository.countByStatus("PENDING");
        long approvedPermissions = permissionRepository.countByStatus("APPROVED");

        // Announcements
        long totalAnnouncements = announcementRepository.count();
        long alertAnnouncements = announcementRepository.countByType("ALERT");

        // Property
        long activeListings = propertyPostRepository.countByIsActiveTrue();
        long totalListings = propertyPostRepository.count();

        return DashboardDTO.builder()
                .totalResidents(totalResidents)
                .totalOwners(totalOwners)
                .totalTenants(totalTenants)
                .totalFlats(totalFlats)
                .occupiedFlats(occupiedFlats)
                .vacantFlats(vacantFlats)
                .activeCaretakers(activeCaretakers)
                .totalCaretakers(totalCaretakers)
                .totalComplaints(totalComplaints)
                .pendingComplaints(pendingComplaints)
                .resolvedComplaints(resolvedComplaints)
                .totalIssues(totalIssues)
                .pendingIssues(pendingIssues)
                .processingIssues(processingIssues)
                .resolvedIssues(resolvedIssues)
                .totalBills(totalBills)
                .pendingBills(pendingBills)
                .paidBills(paidBills)
                .totalAmountCollected(totalCollected != null ? totalCollected : BigDecimal.ZERO)
                .totalAmountPending(totalPending != null ? totalPending : BigDecimal.ZERO)
                .societyFundBalance(fundBalance)
                .totalRegistrations(totalRegistrations)
                .pendingRegistrations(pendingRegistrations)
                .approvedRegistrations(approvedRegistrations)
                .rejectedRegistrations(rejectedRegistrations)
                .totalPermissions(totalPermissions)
                .pendingPermissions(pendingPermissions)
                .approvedPermissions(approvedPermissions)
                .totalAnnouncements(totalAnnouncements)
                .alertAnnouncements(alertAnnouncements)
                .activeListings(activeListings)
                .totalListings(totalListings)
                .build();
    }

}