using System;
using PortFolioService.Domain.Entities;

namespace PortFolioService.Domain.Interfaces;


public interface IDesignerProfileRepository
{
    Task<DesignerProfile?> GetByDesignerIdAsync(int designerId, CancellationToken ct);

    Task AddAsync(DesignerProfile profile, CancellationToken ct);

    Task UpdateAsync(DesignerProfile profile, CancellationToken ct);

    Task SaveChangesAsync(CancellationToken ct);

    Task<List<DesignerProfile>> GetAllAsync(CancellationToken ct);
}

