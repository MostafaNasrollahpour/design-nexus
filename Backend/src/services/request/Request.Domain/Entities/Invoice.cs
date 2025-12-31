using System;

namespace Request.Domain.Entities;

public class Invoice
{
    public int InvoiceId { get; private set; }
    public int RequestId { get; private set; }
    public decimal Amount { get; private set; }
    public string Currency { get; private set; }
    public string Status { get; private set; }
    public string PaymentRef { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? PaidAt { get; private set; }

    private Invoice()
    {
        Currency = string.Empty;
        Status = string.Empty;
        PaymentRef = string.Empty;
    }

    public Invoice(int requestId, decimal amount, string currency, string paymentRef)
    {
        RequestId = requestId;
        Amount = amount > 0 ? amount : throw new ArgumentException("Amount must be positive", nameof(amount));
        Currency = currency ?? throw new ArgumentNullException(nameof(currency));
        Status = "pending"; // default status
        PaymentRef = paymentRef ?? throw new ArgumentNullException(nameof(paymentRef));
        CreatedAt = DateTime.UtcNow;
    }

    public void MarkAsPaid()
    {
        Status = "paid";
        PaidAt = DateTime.UtcNow;
    }

    public void UpdateStatus(string status)
    {
        Status = status ?? throw new ArgumentNullException(nameof(status));
        if (status == "paid" && !PaidAt.HasValue)
        {
            PaidAt = DateTime.UtcNow;
        }
    }
}