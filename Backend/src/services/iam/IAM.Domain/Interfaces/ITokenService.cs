using System.Threading.Tasks;
using IAM.Domain.Entities;

namespace IAM.Domain.Interfaces
{
    public interface ITokenService
    {
        Task<string> GenerateAccessTokenAsync(User user);
        Task<string> GenerateAndSaveRefreshTokenAsync(User user);
        Task<bool> ValidateTokenAsync(string token);
        Task<string> GetUserIdFromTokenAsync(string token);
    }
}
