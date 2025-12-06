using System.Threading;
using System.Threading.Tasks;
using IAM.Application.Commands;
using IAM.Application.DTOs;
using IAM.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IAM.Application.Handlers
{
    public class VerifyChangePasswordCommandHandler : IRequestHandler<VerifyChangePasswordCommand, AuthResponseDto>
    {
        private readonly IUserRepository _userRepository;
        private readonly IOtpService _otpService;
        private readonly ILogger<VerifyChangePasswordCommandHandler> _logger;

        public VerifyChangePasswordCommandHandler(
            IUserRepository userRepository,
            IOtpService otpService,
            ILogger<VerifyChangePasswordCommandHandler> logger)
        {
            _userRepository = userRepository;
            _otpService = otpService;
            _logger = logger;
        }

        public async Task<AuthResponseDto> Handle(VerifyChangePasswordCommand command, CancellationToken cancellationToken)
        {
            var request = command.Request;

            var isValidOtp = await _otpService.ValidateOtpAsync(request.Email, request.Otp, false);
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

            _logger.LogInformation($"User {user.Email} verified change password successfully");

            return AuthResponseDto.SuccessResponse(
                "احراز هویت موفقیت‌آمیز بود",
                string.Empty,
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