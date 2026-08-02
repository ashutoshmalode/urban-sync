package com.urbansync.payment;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentTransactionRepository
        extends JpaRepository<PaymentTransaction, Long> {

    @Query("""
        SELECT t FROM PaymentTransaction t
        LEFT JOIN FETCH t.bill b
        LEFT JOIN FETCH b.resident
        LEFT JOIN FETCH b.flat
        WHERE t.id = :id
    """)
    Optional<PaymentTransaction> findById(Long id);

    @Query("""
        SELECT t FROM PaymentTransaction t
        LEFT JOIN FETCH t.bill b
        LEFT JOIN FETCH b.resident
        LEFT JOIN FETCH b.flat
        ORDER BY t.createdAt DESC
    """)
    List<PaymentTransaction> findAll();

    List<PaymentTransaction> findByBillId(Long billId);

    Optional<PaymentTransaction> findByRazorpayOrderId(
            String razorpayOrderId);

}