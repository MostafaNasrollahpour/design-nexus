using System;

namespace PortFolioService.Domain.Interfaces;

public interface ICurrentUser
{
    int UserId { get; }
    string Role { get; }
}

