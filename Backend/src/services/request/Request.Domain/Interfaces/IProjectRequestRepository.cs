using Request.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;
using Request.Domain.Enums;

namespace Request.Domain.Interfaces;

public interface IProjectRequestRepository
{
    Task<ProjectRequest?> GetByIdAsync(int requestId);
    Task<IEnumerable<ProjectRequest>> GetByUserIdAsync(int userId);
    Task<IEnumerable<ProjectRequest>> GetByDesignerIdAsync(int designerId);
    Task<IEnumerable<ProjectRequest>> GetByStatusAsync(RequestStatus status);
    Task AddAsync(ProjectRequest request);
    Task UpdateAsync(ProjectRequest request);
}
