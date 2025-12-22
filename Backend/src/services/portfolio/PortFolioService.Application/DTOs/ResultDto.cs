namespace PortFolioService.Application.DTOs;

public class ResultDto
{
    public bool Success { get; }
    public string? Error { get; }

    protected ResultDto(bool success, string? error)
    {
        Success = success;
        Error = error;
    }

    // --------------------
    // Factory Methods
    // --------------------

    public static ResultDto SuccessResult()
        => new ResultDto(true, null);

    public static ResultDto FailureResult(string error)
        => new ResultDto(false, error);
}
