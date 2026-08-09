package com.urbansync.maintenance;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.urbansync.exception.BadRequestException;
import com.urbansync.exception.ResourceNotFoundException;
import com.urbansync.property.Flat;
import com.urbansync.property.FlatRepository;
import com.urbansync.resident.ResidentProfile;
import com.urbansync.resident.ResidentRepository;

@Service
public class MaintenanceServiceImpl implements MaintenanceService {

    private final GlobalMaintenanceSettingsRepository settingsRepository;
    private final MaintenanceBillRepository billRepository;
    private final FlatRepository flatRepository;
    private final ResidentRepository residentRepository;

    public MaintenanceServiceImpl(
            GlobalMaintenanceSettingsRepository settingsRepository,
            MaintenanceBillRepository billRepository,
            FlatRepository flatRepository,
            ResidentRepository residentRepository) {

        this.settingsRepository = settingsRepository;
        this.billRepository = billRepository;
        this.flatRepository = flatRepository;
        this.residentRepository = residentRepository;
    }

    @Override
    public MaintenanceSettingsDTO getSettings() {
        return settingsRepository.findFirstByOrderByIdAsc()
                .map(MaintenanceMapper::toSettingsDTO)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Maintenance settings not found."));
    }

    @Override
    @Transactional
    public MaintenanceSettingsDTO updateSettings(
            UpdateSettingsRequest request) {

        GlobalMaintenanceSetting settings = settingsRepository
                .findFirstByOrderByIdAsc()
                .orElse(GlobalMaintenanceSetting.builder().build());

        settings.setMaintenanceAmount(request.getMaintenanceAmount());
        settings.setDueFinePerDay(request.getDueFinePerDay());
        settings.setValidityDays(request.getValidityDays());
        settings.setLastUpdatedAt(LocalDateTime.now());
        settings.setLastUpdatedBySecretaryAt(LocalDateTime.now());

        return MaintenanceMapper.toSettingsDTO(
                settingsRepository.save(settings));
    }

    @Override
    @Transactional
    public MaintenanceBillDTO generateBill(GenerateBillRequest request) {

        // Check if bill already exists for this flat+month+year
        if (billRepository.existsByFlatIdAndBillMonthAndBillYear(
                request.getFlatId(),
                request.getBillMonth(),
                request.getBillYear())) {
            throw new BadRequestException(
                    "Bill already exists for this flat for "
                    + request.getBillMonth() + "/" + request.getBillYear());
        }

        Flat flat = flatRepository.findById(request.getFlatId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Flat not found."));

        ResidentProfile resident = residentRepository
                .findById(request.getResidentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Resident not found."));

        GlobalMaintenanceSetting settings = settingsRepository
                .findFirstByOrderByIdAsc()
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Maintenance settings not found."));

        // Calculate due date
        LocalDate dueDate = LocalDate.of(
                request.getBillYear(),
                request.getBillMonth(),
                settings.getValidityDays());

        // Calculate fine if overdue
        BigDecimal fineAmount = BigDecimal.ZERO;
        LocalDate today = LocalDate.now();

        if (today.isAfter(dueDate)) {
            long daysOverdue = today.toEpochDay() - dueDate.toEpochDay();
            fineAmount = settings.getDueFinePerDay()
                    .multiply(BigDecimal.valueOf(daysOverdue));
        }

        BigDecimal baseAmount = settings.getMaintenanceAmount();
        BigDecimal totalAmount = baseAmount.add(fineAmount);

        MaintenanceBill bill = MaintenanceBill.builder()
                .flat(flat)
                .resident(resident)
                .baseAmount(baseAmount)
                .fineAmount(fineAmount)
                .totalAmount(totalAmount)
                .status("PENDING")
                .billMonth(request.getBillMonth())
                .billYear(request.getBillYear())
                .dueDate(dueDate)
                .createdAt(LocalDateTime.now())
                .build();

        return MaintenanceMapper.toBillDTO(
                billRepository.save(bill));
    }

    @Override
    public List<MaintenanceBillDTO> getAllBills() {
        return billRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(MaintenanceMapper::toBillDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MaintenanceBillDTO> getPendingBills() {
        return billRepository.findAllPending()
                .stream()
                .map(MaintenanceMapper::toBillDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MaintenanceBillDTO> getPaidBills() {
        return billRepository.findAllPaid()
                .stream()
                .map(MaintenanceMapper::toBillDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MaintenanceBillDTO> getBillsByResident(Long residentId) {
        return billRepository.findByResidentId(residentId)
                .stream()
                .map(MaintenanceMapper::toBillDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MaintenanceBillDTO> getBillsByFlat(Long flatId) {
        return billRepository.findByFlatId(flatId)
                .stream()
                .map(MaintenanceMapper::toBillDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MaintenanceBillDTO markAsPaid(Long billId) {

        MaintenanceBill bill = billRepository.findById(billId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Bill not found."));

        if (bill.getStatus().equals("PAID")) {
            throw new BadRequestException(
                    "Bill is already paid.");
        }

        bill.setStatus("PAID");
        bill.setPaidAt(LocalDateTime.now());

        return MaintenanceMapper.toBillDTO(
                billRepository.save(bill));
    }

}