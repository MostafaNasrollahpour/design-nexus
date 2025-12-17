using System.Threading;
using System.Threading.Tasks;
using IAM.Application.DTOs;
using IAM.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IAM.Application.Commands.UpdateUser
{
    public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, AuthResponseDto>
    {
        private readonly IRefreshTokenRepository _refreshRepo;
        private readonly IUserRepository _userRepository;
        private readonly ITokenService _tokenService;
        private readonly ILogger<UpdateUserCommandHandler> _logger;

        public UpdateUserCommandHandler(
            IRefreshTokenRepository refreshRepo,
            IUserRepository userRepository,
            ITokenService tokenService,
            ILogger<UpdateUserCommandHandler> logger
            )
        {
            _refreshRepo = refreshRepo;
            _userRepository = userRepository;
            _tokenService = tokenService;
            _logger = logger;
        }

        public async Task<AuthResponseDto> Handle(UpdateUserCommand command, CancellationToken cancellationToken)
        {
            var request = command.Request;

            var user = await _refreshRepo.GetByRefreshTokenAsync(command.RefreshToken);

            if (user == null)
            {
                _logger.LogWarning("Invalid refresh token");
                return AuthResponseDto.FailureResponse("رفرش توکن نامعتبر یا منقضی شده است");
            }

            user = await _userRepository.GetByIdAsync(user.UserId);

            if (user == null)
            {
                _logger.LogWarning("Invalid refresh token");
                return AuthResponseDto.FailureResponse("رفرش توکن نامعتبر یا منقضی شده است");
            }

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash);
            if (!isPasswordValid)
            {
                _logger.LogWarning($"Wrong current password for email: {user.Email}");
                return AuthResponseDto.FailureResponse("رمز شما اشتباه است.");
            }

            if (request.CurrentPassword == request.NewPassword)
            {
                _logger.LogWarning($"Same password for email: {user.Email}");
                return AuthResponseDto.FailureResponse("رمز عبور جدید نباید با رمز عبور فعلی یکسان باشد");
            }

            if (command.Request.NewPassword != command.Request.ConfirmNewPassword)
            {
                _logger.LogWarning($"Password and Confirm password are not same for  email: {user.Email}");
                return AuthResponseDto.FailureResponse("رمز عبور جدید و تکرار آن مطابقت ندارند");
            }

            user.UpdateFullName(request.FullName);
            var newPasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            
            user.UpdatePassword(newPasswordHash);

            await _refreshRepo.RemoveByUserAsync(user.UserId);

            await _userRepository.UpdateAsync(user);

            var accessToken = await _tokenService.GenerateAccessTokenAsync(user);
            var refreshToken = await _tokenService.GenerateAndSaveRefreshTokenAsync(user);


            return AuthResponseDto.SuccessResponse(
                "اطلاعات کاربر با موفقیت بروزرسانی شد",
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