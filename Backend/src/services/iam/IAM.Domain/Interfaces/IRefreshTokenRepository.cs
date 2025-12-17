using System.Threading.Tasks;
using IAM.Domain.Entities;

namespace IAM.Domain.Interfaces
{
    public interface IRefreshTokenRepository
    {
        Task AddAsync(RefreshToken token);
        Task<RefreshToken?> GetByTokenAsync(string token);
        Task RevokeAsync(RefreshToken token);
        Task RemoveByUserAsync(int userId);
        Task SaveChangesAsync();
        Task<RefreshToken?> GetValidByUserAsync(int userId);
        Task<User?> GetByRefreshTokenAsync(string refreshToken);
    }
}
