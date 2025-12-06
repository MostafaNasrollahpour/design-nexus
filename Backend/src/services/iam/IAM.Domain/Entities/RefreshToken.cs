using System;

namespace IAM.Domain.Entities
{
    public class RefreshToken
    {
        public int Id { get; set; }
        public string Token { get; set; } = default!;
        public int UserId { get; set; }
        public User User { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool IsRevoked { get; set; }
        public string? ReplacedByToken { get; set; } // برای rotation (اختیاری)
    }
}
