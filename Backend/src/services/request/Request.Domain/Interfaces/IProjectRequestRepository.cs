using Request.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Request.Domain.Interfaces
{
    public interface IProjectRequestRepository
    {
        Task<ProjectRequest?> GetByIdAsync(int requestId);
        Task<IEnumerable<ProjectRequest>> GetByUserIdAsync(int userId);
        Task<IEnumerable<ProjectRequest>> GetByDesignerIdAsync(int designerId);
        Task<IEnumerable<ProjectRequest>> GetByStatusAsync(string status);
        Task AddAsync(ProjectRequest request);
        Task UpdateAsync(ProjectRequest request);
    }
}