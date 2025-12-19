using System;
using Microsoft.EntityFrameworkCore;
using PortFolioService.Domain.Interfaces;
using PortFolioService.Domain.Entities;
using PortFolioService.Infrastructure.Data;

namespace PortFolioService.Infrastructure.Repositories;

public class PortfolioRepository : IPortfolioRepository
{
    private readonly AppDbContext _dbContext;

    public PortfolioRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddAsync(Portfolio portfolio, CancellationToken ct)
    {
        await _dbContext.Portfolios.AddAsync(portfolio, ct);
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task<List<Portfolio>> GetByDesignerIdAsync(
        int designerId,
        CancellationToken ct)
    {
        return await _dbContext.Portfolios
            .Where(p => p.DesignerId == designerId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<List<Portfolio>> GetRecentAsync(
        int count,
        CancellationToken ct)
    {
        return await _dbContext.Portfolios
            .OrderByDescending(p => p.CreatedAt)
            .Take(count)
            .ToListAsync(ct);
    }
}

