package com.urbansync.maintenance;

import java.util.List;

public interface MaintenanceService {

    MaintenanceSettingsDTO getSettings();

    MaintenanceSettingsDTO updateSettings(UpdateSettingsRequest request);

    MaintenanceBillDTO generateBill(GenerateBillRequest request);

    List<MaintenanceBillDTO> getAllBills();

    List<MaintenanceBillDTO> getPendingBills();

    List<MaintenanceBillDTO> getPaidBills();

    List<MaintenanceBillDTO> getBillsByResident(Long residentId);

    List<MaintenanceBillDTO> getBillsByFlat(Long flatId);

    MaintenanceBillDTO markAsPaid(Long billId);

}