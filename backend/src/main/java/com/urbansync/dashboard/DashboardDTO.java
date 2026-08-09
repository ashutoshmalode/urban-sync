package com.urbansync.dashboard;

import java.math.BigDecimal;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDTO {

    // Society overview
    private Long totalResidents;
    private Long totalOwners;
    private Long totalTenants;
    private Long totalFlats;
    private Long occupiedFlats;
    private Long vacantFlats;

    // Caretakers
    private Long activeCaretakers;
    private Long totalCaretakers;

    // Complaints
    private Long totalComplaints;
    private Long pendingComplaints;
    private Long resolvedComplaints;

    // Caretaker Issues
    private Long totalIssues;
    private Long pendingIssues;
    private Long processingIssues;
    private Long resolvedIssues;

    // Maintenance
    private Long totalBills;
    private Long pendingBills;
    private Long paidBills;
    private BigDecimal totalAmountCollected;
    private BigDecimal totalAmountPending;

    // Society Fund
    private BigDecimal societyFundBalance;

    // Registrations
    private Long totalRegistrations;
    private Long pendingRegistrations;
    private Long approvedRegistrations;
    private Long rejectedRegistrations;

    // Permissions
    private Long totalPermissions;
    private Long pendingPermissions;
    private Long approvedPermissions;

    // Announcements
    private Long totalAnnouncements;
    private Long alertAnnouncements;

    // Property
    private Long activeListings;
    private Long totalListings;

}