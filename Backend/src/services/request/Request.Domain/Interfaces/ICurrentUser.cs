namespace Request.Domain.Interfaces
{
    public interface ICurrentUser
    {
        int UserId { get; }
        string Role { get; }
    }
}