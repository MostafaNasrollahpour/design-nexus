using System.Threading;
using System.Threading.Tasks;
using IAM.Application.DTOs;
using IAM.Domain.Interfaces;
using IAM.Domain.Entities;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IAM.Application.Commands.ResendCode
{
    public class ResendCodeCommandHandler : IRequestHandler<ResendCodeCommand, AuthResponseDto>
    {
        private readonly IUserRepository _userRepository;
        private readonly IOtpService _otpService;
        private readonly ILogger<ResendCodeCommandHandler> _logger;

        public ResendCodeCommandHandler(
            IUserRepository userRepository,
            IOtpService otpService,
            ILogger<ResendCodeCommandHandler> logger)
        {
            _userRepository = userRepository;
            _otpService = otpService;
            _logger = logger;
        }

        public async Task<AuthResponseDto> Handle(ResendCodeCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var request = command.Request;
                if (!await _userRepository.EmailExistsAsync(request.Email))
                {
                    _logger.LogWarning($"Invalid password for user: {request.Email}");
                    return AuthResponseDto.FailureResponse("ایمیل اشتباه است");
                
                }
                
                User? user = await _userRepository.GetByEmailAsync(request.Email);

                var otp = await _otpService.GenerateOtpAsync(request.Email);
                

                _logger.LogInformation($"OTP for {request.Email}: {otp}");

                return AuthResponseDto.SuccessResponse(
                    "کد تایید دوباره برایتان ارسال شد",
                    string.Empty,
                    string.Empty,
                    new UserDto
                    {
                        UserId = user!.UserId,
                        FullName = user.FullName,
                        Email = user.Email,
                        Role = user.Role,
                        IsVerified = user.IsVerified
                    }
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in resend otp code");
                return AuthResponseDto.FailureResponse("خطا در ارسال. لطفاً مجدداً تلاش کنید");
            }
        }
    }
}