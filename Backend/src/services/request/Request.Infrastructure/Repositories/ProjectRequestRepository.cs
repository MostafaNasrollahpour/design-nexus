using Microsoft.EntityFrameworkCore;
using Request.Domain.Entities;
using Request.Domain.Interfaces;
using Request.Infrastructure.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Request.Infrastructure.Repositories;

public class ProjectRequestRepository : IProjectRequestRepository
{
    private readonly AppDbContext _context;

    public ProjectRequestRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ProjectRequest?> GetByIdAsync(int requestId)
    {
        return await _context.ProjectRequests.FindAsync(requestId);
    }

    public async Task<IEnumerable<ProjectRequest>> GetByUserIdAsync(int userId)
    {
        return await _context.ProjectRequests
            .Where(r => r.UserId == userId)
            .ToListAsync();
    }

    public async Task<IEnumerable<ProjectRequest>> GetByDesignerIdAsync(int designerId)
    {
        return await _context.ProjectRequests
            .Where(r => r.DesignerId == designerId)
            .ToListAsync();
    }

    public async Task<IEnumerable<ProjectRequest>> GetByStatusAsync(string status)
    {
        return await _context.ProjectRequests
            .Where(r => r.Status == status)
            .ToListAsync();
    }

    public async Task AddAsync(ProjectRequest request)
    {
        await _context.ProjectRequests.AddAsync(request);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(ProjectRequest request)
    {
        _context.ProjectRequests.Update(request);
        await _context.SaveChangesAsync();
    }
}