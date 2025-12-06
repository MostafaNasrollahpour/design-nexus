using System.Threading;
using System.Threading.Tasks;
using IAM.Application.Commands;
using IAM.Application.DTOs;
using IAM.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IAM.Application.Handlers
{
    public class VerifyOtpCommandHandler : IRequestHandler<VerifyOtpCommand, AuthResponseDto>
    {
        private readonly IUserRepository _userRepository;
        private readonly IOtpService _otpService;
        private readonly ITokenService _tokenService;
        private readonly ILogger<VerifyOtpCommandHandler> _logger;

        public VerifyOtpCommandHandler(
            IUserRepository userRepository,
            IOtpService otpService,
            ITokenService tokenService,
            ILogger<VerifyOtpCommandHandler> logger)
        {
            _userRepository = userRepository;
            _otpService = otpService;
            _tokenService = tokenService;
            _logger = logger;
        }

        public async Task<AuthResponseDto> Handle(VerifyOtpCommand command, CancellationToken cancellationToken)
        {
            var request = command.Request;

            // اعتبارسنجی OTP
            var isValidOtp = await _otpService.ValidateOtpAsync(request.Email, request.Otp, true);
            if (!isValidOtp)
            {
                return AuthResponseDto.FailureResponse("کد OTP نامعتبر یا منقضی شده است");
            }

            var user = await _userRepository.GetByEmailAsync(request.Email);
            if (user == null)
            {
                return AuthResponseDto.FailureResponse("کاربر پیدا نشد");
            }

            user.MarkAsVerified();
            await _userRepository.UpdateAsync(user);

            // داخل Handle، بعد از اعتبارسنجی:
            var accessToken = await _tokenService.GenerateAccessTokenAsync(user);
            var refreshToken = await _tokenService.GenerateAndSaveRefreshTokenAsync(user);

            return AuthResponseDto.SuccessResponse(
                "ورود موفقیت‌آمیز بود",
                accessToken,
                refreshToken,
                new UserDto
                {
                    UserId = user.UserId,
                    FullName = user.FullName,
                    Email = user.Email,
                    Role = user.Role,
                    IsVerified = user.IsVerified
                }
            );

        }
    }
}