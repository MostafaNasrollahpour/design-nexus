using System.Threading;
using System.Threading.Tasks;
using IAM.Application.DTOs;
using IAM.Domain.Entities;
using IAM.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IAM.Application.Commands.Register
{
    public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponseDto>
    {
        private readonly IUserRepository _userRepository;
        private readonly IOtpService _otpService;
        private readonly ILogger<RegisterCommandHandler> _logger;

        public RegisterCommandHandler(
            IUserRepository userRepository,
            IOtpService otpService,
            ILogger<RegisterCommandHandler> logger)
        {
            _userRepository = userRepository;
            _otpService = otpService;
            _logger = logger;
        }

        public async Task<AuthResponseDto> Handle(RegisterCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var request = command.Request;
                User? existingUser = null;
                if (await _userRepository.EmailExistsAsync(request.Email))
                {
                    existingUser = await _userRepository.GetByEmailAsync(request.Email);
                    if (existingUser != null && existingUser.IsVerified)
                    {
                        return AuthResponseDto.FailureResponse("این ایمیل قبلاً ثبت شده است");
                    }
                }

                string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

                
                var user = new User(
                    request.FullName,
                    request.Email.ToLower(),
                    passwordHash,
                    request.Role
                );

                if (existingUser == null)
                {
                    await _userRepository.AddAsync(user);
                }

                var otp = await _otpService.GenerateOtpAsync(request.Email);
                

                _logger.LogInformation($"OTP for {request.Email}: {otp}");

                return AuthResponseDto.SuccessResponse(
                    "ثبت‌نام موفقیت‌آمیز بود. لطفاً ایمیل خود را تأیید کنید.",
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
                _logger.LogError(ex, "Error in user registration");
                return AuthResponseDto.FailureResponse("خطا در ثبت‌نام. لطفاً مجدداً تلاش کنید");
            }
        }
    
    }
}