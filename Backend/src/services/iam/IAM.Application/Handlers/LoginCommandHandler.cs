using System;
using System.Threading;
using System.Threading.Tasks;
using IAM.Application.Commands;
using IAM.Application.DTOs;
using IAM.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IAM.Application.Handlers
{
    public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponseDto>
    {
        private readonly IUserRepository _userRepository;
        private readonly ITokenService _tokenService;
        private readonly ILogger<LoginCommandHandler> _logger;

        public LoginCommandHandler(
            IUserRepository userRepository,
            ITokenService tokenService,
            ILogger<LoginCommandHandler> logger)
        {
            _userRepository = userRepository;
            _tokenService = tokenService;
            _logger = logger;
        }

        public async Task<AuthResponseDto> Handle(LoginCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var request = command.Request;

                var user = await _userRepository.GetByEmailAsync(request.Email);
                if (user == null)
                {
                    _logger.LogWarning($"Login attempt for non-existing email: {request.Email}");
                    return AuthResponseDto.FailureResponse("ایمیل یا رمز عبور اشتباه است");
                }

                if (!user.IsVerified)
                {
                    _logger.LogWarning($"Login attempt for unverified user: {request.Email}");
                    return AuthResponseDto.FailureResponse("لطفاً ابتدا حساب خود را تأیید کنید");
                }

                bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
                if (!isPasswordValid)
                {
                    _logger.LogWarning($"Invalid password for user: {request.Email}");
                    return AuthResponseDto.FailureResponse("ایمیل یا رمز عبور اشتباه است");
                }

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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in user login");
                return AuthResponseDto.FailureResponse("خطا در ورود. لطفاً مجدداً تلاش کنید");
            }
        }
    }
}