package com.urbansync.maintenance;

public class MaintenanceMapper {

    private MaintenanceMapper() {}

    public static MaintenanceSettingsDTO toSettingsDTO(
            GlobalMaintenanceSetting settings) {
        return MaintenanceSettingsDTO.builder()
                .id(settings.getId())
                .maintenanceAmount(settings.getMaintenanceAmount())
                .dueFinePerDay(settings.getDueFinePerDay())
                .validityDays(settings.getValidityDays())
                .lastUpdatedAt(settings.getLastUpdatedAt())
                .build();
    }

    public static MaintenanceBillDTO toBillDTO(MaintenanceBill bill) {
        return MaintenanceBillDTO.builder()
                .id(bill.getId())
                .flatId(bill.getFlat() != null
                        ? bill.getFlat().getId() : null)
                .flatNumber(bill.getFlat() != null
                        ? bill.getFlat().getFlatNumber() : null)
                .residentId(bill.getResident() != null
                        ? bill.getResident().getId() : null)
                .residentName(bill.getResident() != null
                        ? bill.getResident().getFirstName() + " "
                          + bill.getResident().getLastName() : null)
                .baseAmount(bill.getBaseAmount())
                .fineAmount(bill.getFineAmount())
                .totalAmount(bill.getTotalAmount())
                .status(bill.getStatus())
                .billMonth(bill.getBillMonth())
                .billYear(bill.getBillYear())
                .dueDate(bill.getDueDate())
                .paidAt(bill.getPaidAt())
                .createdAt(bill.getCreatedAt())
                .build();
    }

}