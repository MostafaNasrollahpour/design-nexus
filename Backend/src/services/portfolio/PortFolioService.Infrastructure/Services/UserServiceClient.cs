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
        var response = await _httpClient.GetAsync($"internal/designers/{designerId}");
        if (response.IsSuccessStatusCode)
        {
            return await response.Content.ReadFromJsonAsync<UserServiceDesignerDto>();
        }
        else if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }
        else
        {
            throw new HttpRequestException($"Failed to retrieve designer with ID {designerId}. Status code: {response.StatusCode}");
        }
    }
}

