using Request.Domain.Enums;

namespace Request.Domain.Entities;

public class Invoice
{
    public int InvoiceId { get; private set; }
    public int RequestId { get; private set; }

    public decimal Amount { get; private set; }
    public string Currency { get; private set; }

    public InvoiceStatus Status { get; private set; }

    public string? PaymentRef { get; private set; }

    public DateTime CreatedAt { get; private set; }
    public DateTime? PaidAt { get; private set; }

    private Invoice() {
        Currency = string.Empty;
    }
    public Invoice(int requestId, decimal amount, string currency)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be positive", nameof(amount));

        if (string.IsNullOrWhiteSpace(currency))
            throw new ArgumentNullException(nameof(currency));

        RequestId = requestId;
        Amount = amount;
        Currency = currency.ToUpperInvariant();

        Status = InvoiceStatus.Pending;
        CreatedAt = DateTime.UtcNow;
    }

    public void SetPaymentRef(string paymentRef)
    {
        if (string.IsNullOrWhiteSpace(paymentRef))
            throw new ArgumentException("Payment reference cannot be empty", nameof(paymentRef));

        PaymentRef = paymentRef;
    }

    public void MarkAsPaid(string? paymentRef = null)
    {
        if (Status == InvoiceStatus.Paid)
            throw new InvalidOperationException("Invoice is already paid");

        Status = InvoiceStatus.Paid;
        PaidAt = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(paymentRef))
            PaymentRef = paymentRef;
    }
}
