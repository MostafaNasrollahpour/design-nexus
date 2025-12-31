namespace Request.Application.DTOs
{
    public class BaseResponseDto
    {
        public bool Success { get; set; }
        public required string Message { get; set; }
        public object? Data { get; set; }

        public static BaseResponseDto SuccessResponse(string message, object? data = null)
        {
            return new BaseResponseDto
            {
                Success = true,
                Message = message,
                Data = data
            };
        }

        public static BaseResponseDto FailureResponse(string message)
        {
            return new BaseResponseDto
            {
                Success = false,
                Message = message,
                Data = null
            };
        }
    }
}