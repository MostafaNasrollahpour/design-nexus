using System;

namespace PortFolioService.Domain.Entities;

public class DesignerProfile
{
    public int DesignerId { get; private set; }
    public string? Bio { get; private set; }
    public string? Location { get; private set; }
    public string? Specialty { get; private set; }
    public string? AvatarUrl { get; private set; }
    public long? AvatarSize { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    private DesignerProfile() { }

    public DesignerProfile(int designerId, string? bio, string? location, string? specialty)
    {
        DesignerId = designerId;
        Bio = bio;
        Location = location;
        Specialty = specialty;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateAvatar(string avatarUrl, long avatarSize)
    {
        AvatarUrl = avatarUrl;
        AvatarSize = avatarSize;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateProfile(string? bio, string? location, string? specialty)
    {
        Bio = bio;
        Location = location;
        Specialty = specialty;
        UpdatedAt = DateTime.UtcNow;
    }
}