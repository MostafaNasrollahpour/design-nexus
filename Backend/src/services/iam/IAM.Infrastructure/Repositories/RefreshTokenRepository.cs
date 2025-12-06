using System.Threading.Tasks;
using IAM.Domain.Entities;
using IAM.Domain.Interfaces;
using IAM.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace IAM.Infrastructure.Repositories
{
    public class RefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly AppDbContext _context;

        public RefreshTokenRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(RefreshToken token)
        {
            await _context.RefreshTokens.AddAsync(token);
            await _context.SaveChangesAsync();
        }

        public async Task<RefreshToken?> GetByTokenAsync(string token)
        {
            return await _context.RefreshTokens
                .FirstOrDefaultAsync(t => t.Token == token && !t.IsRevoked);
        }

        public async Task RevokeAsync(RefreshToken token)
        {
            token.IsRevoked = true;
            _context.RefreshTokens.Update(token);
            await _context.SaveChangesAsync();
        }

        public async Task RemoveByUserAsync(int userId)
        {
            var tokens = _context.RefreshTokens.Where(t => t.UserId == userId);
            _context.RefreshTokens.RemoveRange(tokens);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
