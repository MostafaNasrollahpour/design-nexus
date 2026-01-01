namespace Request.Domain.Entities;

public class Invoice
{
    public int InvoiceId { get; private set; }
    public int RequestId { get; private set; }
    public decimal Amount { get; private set; }
    public string Currency { get; private set; }
    public string Status { get; private set; }
    public string? PaymentRef { get; private set; } 
    public DateTime CreatedAt { get; private set; }
    public DateTime? PaidAt { get; private set; }

    public Invoice(int requestId, decimal amount, string currency)
    {
        RequestId = requestId;
        Amount = amount > 0 ? amount : throw new ArgumentException("Amount must be positive", nameof(amount));
        Currency = currency ?? throw new ArgumentNullException(nameof(currency));
        Status = "pending";
        PaymentRef = null; 
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
        Status = "paid";
        PaidAt = DateTime.UtcNow;
        
        if (!string.IsNullOrWhiteSpace(paymentRef))
        {
            PaymentRef = paymentRef;
        }
    }
}