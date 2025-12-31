using System;

namespace Request.Domain.Entities;

public class ProjectRequest
{
    public int RequestId { get; private set; }
    public int UserId { get; private set; }
    public int? DesignerId { get; private set; }
    public string Title { get; private set; }
    public string Description { get; private set; }
    public decimal? Budget { get; private set; }
    public DateTime? Deadline { get; private set; }
    public string Address { get; private set; }
    public string Category { get; private set; }
    public string Status { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    private ProjectRequest()
    {
        Title = string.Empty;
        Description = string.Empty;
        Address = string.Empty;
        Category = string.Empty;
        Status = string.Empty;
    }

    public ProjectRequest(int userId, string title, string description, decimal? budget, DateTime? deadline, string address, string category)
    {
        UserId = userId;
        Title = title ?? throw new ArgumentNullException(nameof(title));
        Description = description ?? throw new ArgumentNullException(nameof(description));
        Budget = budget;
        Deadline = deadline;
        Address = address ?? throw new ArgumentNullException(nameof(address));
        Category = category ?? throw new ArgumentNullException(nameof(category));
        Status = "pending"; // default status
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AssignDesigner(int designerId)
    {
        DesignerId = designerId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateStatus(string status)
    {
        Status = status ?? throw new ArgumentNullException(nameof(status));
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(string title, string description, decimal? budget, DateTime? deadline, string address, string category)
    {
        Title = title ?? throw new ArgumentNullException(nameof(title));
        Description = description ?? throw new ArgumentNullException(nameof(description));
        Budget = budget;
        Deadline = deadline;
        Address = address ?? throw new ArgumentNullException(nameof(address));
        Category = category ?? throw new ArgumentNullException(nameof(category));
        UpdatedAt = DateTime.UtcNow;
    }
}
