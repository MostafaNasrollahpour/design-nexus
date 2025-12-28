using Microsoft.EntityFrameworkCore;
using PortFolioService.Domain.Entities;
using PortFolioService.Domain.Interfaces;
using PortFolioService.Infrastructure.Data;

namespace PortFolioService.Infrastructure.Repositories;

public class DesignerProfileRepository : IDesignerProfileRepository
{
    private readonly AppDbContext _dbContext;

    public DesignerProfileRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<DesignerProfile?> GetByDesignerIdAsync(
        int designerId,
        CancellationToken ct)
    {
        return await _dbContext.DesignerProfiles
            .FirstOrDefaultAsync(x => x.DesignerId == designerId, ct);
    }

    public async Task AddAsync(DesignerProfile profile, CancellationToken ct)
    {
        await _dbContext.DesignerProfiles.AddAsync(profile, ct);
    }

    public Task UpdateAsync(DesignerProfile profile, CancellationToken ct)
    {
        _dbContext.DesignerProfiles.Update(profile);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync(CancellationToken ct)
    {
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task<List<DesignerProfile>> GetAllAsync(CancellationToken ct)
    {
        return await _dbContext.DesignerProfiles.ToListAsync(ct);
    }

}
