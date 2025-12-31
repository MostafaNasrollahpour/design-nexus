using Microsoft.EntityFrameworkCore;
using Request.Domain.Entities;
using Request.Domain.Interfaces;
using Request.Infrastructure.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Request.Infrastructure.Repositories;

public class InvoiceRepository : IInvoiceRepository
{
    private readonly AppDbContext _context;

    public InvoiceRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Invoice?> GetByIdAsync(int invoiceId)
    {
        return await _context.Invoices.FindAsync(invoiceId);
    }

    public async Task<IEnumerable<Invoice>> GetByRequestIdAsync(int requestId)
    {
        return await _context.Invoices
            .Where(i => i.RequestId == requestId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Invoice>> GetByStatusAsync(string status)
    {
        return await _context.Invoices
            .Where(i => i.Status == status)
            .ToListAsync();
    }

    public async Task AddAsync(Invoice invoice)
    {
        await _context.Invoices.AddAsync(invoice);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Invoice invoice)
    {
        _context.Invoices.Update(invoice);
        await _context.SaveChangesAsync();
    }
}