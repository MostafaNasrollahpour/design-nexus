using System.Threading;
using System.Threading.Tasks;
using IAM.Application.DTOs;
using IAM.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IAM.Application.Commands.ChangePassword
{
    public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, AuthResponseDto>
    {
        private readonly IUserRepository _userRepository;
        private readonly IOtpService _otpService;
        private readonly ILogger<ChangePasswordCommandHandler> _logger;

        public ChangePasswordCommandHandler(
            IUserRepository userRepository,
            IOtpService otpService,
            ITokenService tokenService,
            ILogger<ChangePasswordCommandHandler> logger)
        {
            _userRepository = userRepository;
            _otpService = otpService;
            _logger = logger;
        }

        public async Task<AuthResponseDto> Handle(ChangePasswordCommand command, CancellationToken cancellationToken)
        {
            var request = command.Request;
            if (!await _userRepository.EmailExistsAsync(request.Email))
            {
                return AuthResponseDto.FailureResponse("کاربری با این ایمیل یافت نشد");
            }
            var user = await _userRepository.GetByEmailAsync(request.Email);
            if (user == null)
            {
                return AuthResponseDto.FailureResponse("کاربری با این ایمیل یافت نشد");
            }

            if (!await _otpService.ValidateOtpAsync(request.Email, request.Otp, true))
            {
                return AuthResponseDto.FailureResponse("کد otp منقضی شده است");
            }

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            user.UpdatePassword(passwordHash);

            try
            {
                await _userRepository.UpdateAsync(user);
                _logger.LogInformation("password changed successfully for user {Email}", request.Email);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Error updating password for user {Email}", request.Email);
                return AuthResponseDto.FailureResponse("خطا در ذخیره‌سازی تغییرات");
            
            }

            try
            {
                return AuthResponseDto.SuccessResponse(
                    "رمز با موفقیت تغییر یافت. با رمز جدید ورود کنید.",
                    string.Empty,
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating token for user {Email}", request.Email);
                return AuthResponseDto.FailureResponse("رمز عبور با موفقیت تغییر یافت، اما خطا در ایجاد توکن");
            }
        }
    }
}