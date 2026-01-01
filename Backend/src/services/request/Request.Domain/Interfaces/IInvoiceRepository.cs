using Request.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;
using Request.Domain.Enums;

namespace Request.Domain.Interfaces;

public interface IInvoiceRepository
{
    Task<Invoice?> GetByIdAsync(int invoiceId);
    Task<Invoice?> GetByRequestIdAsync(int requestId);
    Task<IEnumerable<Invoice>> GetByStatusAsync(InvoiceStatus status);
    Task AddAsync(Invoice invoice);
    Task UpdateAsync(Invoice invoice);
}
