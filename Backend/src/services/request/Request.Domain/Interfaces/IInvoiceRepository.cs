using Request.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Request.Domain.Interfaces
{
    public interface IInvoiceRepository
    {
        Task<Invoice?> GetByIdAsync(int invoiceId);
        Task<IEnumerable<Invoice>> GetByRequestIdAsync(int requestId);
        Task<IEnumerable<Invoice>> GetByStatusAsync(string status);
        Task AddAsync(Invoice invoice);
        Task UpdateAsync(Invoice invoice);
    }
}