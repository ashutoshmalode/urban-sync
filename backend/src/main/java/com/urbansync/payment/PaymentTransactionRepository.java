package com.urbansync.payment;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentTransactionRepository
        extends JpaRepository<PaymentTransaction, Long> {

    List<PaymentTransaction> findByBillId(Long billId);

    Optional<PaymentTransaction> findByRazorpayOrderId(
            String razorpayOrderId);

}