namespace IAM.Domain.Entities
{
    public class User
    {
        public int UserId { get; private set; }
        public string FullName { get; private set; }
        public string Email { get; private set; }
        public string PasswordHash { get; private set; }
        public string Role { get; private set; }
        public bool IsVerified { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        private User() 
        {
            FullName = string.Empty;
            Email = string.Empty;
            PasswordHash = string.Empty;
            Role = string.Empty;
        }

        public User(string fullName, string email, string passwordHash, string role)
        {
            FullName = fullName ?? throw new ArgumentNullException(nameof(fullName));
            Email = email ?? throw new ArgumentNullException(nameof(email));
            PasswordHash = passwordHash ?? throw new ArgumentNullException(nameof(passwordHash));
            Role = role ?? throw new ArgumentNullException(nameof(role));
            IsVerified = false;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        public void MarkAsVerified()
        {
            IsVerified = true;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdatePassword(string newPasswordHash)
        {
            PasswordHash = newPasswordHash;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateFullName(string fullName)
        {
            FullName = fullName;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}