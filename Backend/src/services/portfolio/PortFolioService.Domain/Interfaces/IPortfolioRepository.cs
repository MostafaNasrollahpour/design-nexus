using System;
using PortFolioService.Domain.Entities;


namespace PortFolioService.Domain.Interfaces;

public interface IPortfolioRepository
{
    Task AddAsync(Portfolio portfolio, CancellationToken ct);
    Task<List<Portfolio>> GetByDesignerIdAsync(int designerId, CancellationToken ct);
    Task<List<Portfolio>> GetRecentAsync(int count, CancellationToken ct);
    Task<List<Portfolio>> GetByCategoryIdAsync(int categoryId, CancellationToken ct);
    Task<Portfolio?> GetByIdAsync(int id, CancellationToken ct);
    Task DeleteAsync(Portfolio portfolio, CancellationToken ct);

}

