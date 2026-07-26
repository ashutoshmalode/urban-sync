package com.urbansync.payment;

import java.util.List;

public interface PaymentService {

    PaymentOrderResponse createOrder(PaymentOrderRequest request);

    PaymentTransactionDTO verifyPayment(PaymentVerifyRequest request);

    SocietyFundDTO getFundBalance();

    List<PaymentTransactionDTO> getAllTransactions();

    List<PaymentTransactionDTO> getTransactionsByBillId(Long billId);

}