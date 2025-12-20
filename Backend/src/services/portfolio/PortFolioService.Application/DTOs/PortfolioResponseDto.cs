using System;

namespace PortFolioService.Application.DTOs
{
    public class PortfolioResponseDto
    {
        public bool Success { get; set; }
        public int Id { get; set; }
        public int DesignerId { get; set; }

        public string Title { get; set; } = null!;
        public string? Description { get; set; }

        public int? CategoryId { get; set; }

        public string ImageUrl { get; set; } = null!;
        public long ImageSize { get; set; }

        public DateTime CreatedAt { get; set; }

    }

    public class PortfolioResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public PortfolioResponseDto? Data { get; set; }
        public List<string> Errors { get; set; } = new();

        public static PortfolioResponse SuccessResult(PortfolioResponseDto data, string message = "عملیات با موفقیت انجام شد")
        {
            return new PortfolioResponse
            {
                Success = true,
                Message = message,
                Data = data,
                Errors = new List<string>()
            };
        }

        public static PortfolioResponse FailureResult(string errorMessage, List<string>? errors = null)
        {
            return new PortfolioResponse
            {
                Success = false,
                Message = errorMessage,
                Data = null,
                Errors = errors ?? new List<string>()
            };
        }

        public static PortfolioResponse FailureResult(string errorMessage)
        {
            return FailureResult(errorMessage, new List<string> { errorMessage });
        }
    }
}

