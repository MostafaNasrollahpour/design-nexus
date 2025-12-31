using System.Net.Http.Json;
using PortFolioService.Domain.Interfaces;

namespace PortFolioService.Infrastructure.Services;

public class UserServiceClient : IUserServiceClient
{
    private readonly HttpClient _httpClient;

    public UserServiceClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<UserServiceDesignerDto?> GetDesignerUserAsync(int designerId)
    {
        return await _httpClient.GetFromJsonAsync<UserServiceDesignerDto>(
            $"internal/designers/{designerId}");
    }
}

