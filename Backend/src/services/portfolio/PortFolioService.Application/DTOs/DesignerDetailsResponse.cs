namespace PortFolioService.Application.DTOs;

public class DesignerDetailsResponse : ResultDto
{
    public DesignerDetailsDto? Data { get; }

    private DesignerDetailsResponse(bool success, string? error, DesignerDetailsDto? data) : base(success, error)
    {
        Data = data;
    }

    public static DesignerDetailsResponse CreateSuccess(DesignerDetailsDto data)
        => new DesignerDetailsResponse(true, null, data);

    public static DesignerDetailsResponse Failure(string error)
        => new DesignerDetailsResponse(false, error, null);
}