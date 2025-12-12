using System.Threading.Tasks;
using IAM.Application.DTOs;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

using IAM.Application.Commands.Register;
using IAM.Application.Commands.VerifyOtp;
using IAM.Application.Commands.Login;
using IAM.Application.Commands.ResendCode;
using IAM.Application.Commands.VerifyChangePassword;
using IAM.Application.Commands.ChangePassword;
using IAM.Application.Commands.Refresh;
using IAM.Application.Commands.Logout;

namespace IAM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<AuthController> _logger;
        private readonly IConfiguration _configuration;
        public AuthController(IMediator mediator, ILogger<AuthController> logger, IConfiguration configuration)
        {
            _mediator = mediator;
            _logger = logger;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
        {
            _logger.LogInformation($"Register attempt for email: {request.Email}");
            
            var command = new RegisterCommand(request);
            var result = await _mediator.Send(command);
            
            if (result.Success)
            {
                return Ok(result);
            }
            
            return BadRequest(result);
        }

        [HttpPost("verify")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequestDto request)
        {
            _logger.LogInformation($"OTP verification attempt for email: {request.Email}");
            
            var command = new VerifyOtpCommand(request);
            var result = await _mediator.Send(command);
            
            if (!result.Success)
                return BadRequest(result);

            if (!string.IsNullOrEmpty(result.RefreshToken))
            {
                Response.Cookies.Append("refreshToken", result.RefreshToken!, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Expires = DateTime.UtcNow.AddDays(
                        Convert.ToDouble(_configuration["Jwt:RefreshTokenDays"] ?? "7")
                    )
                });

                result.RefreshToken = null;
            }
            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            _logger.LogInformation($"Login attempt for email: {request.Email}");

            var command = new LoginCommand(request);
            var result = await _mediator.Send(command);

            if (!result.Success)
                return Unauthorized(result);

            if (!string.IsNullOrEmpty(result.RefreshToken))
            {
                Response.Cookies.Append("refreshToken", result.RefreshToken!, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Expires = DateTime.UtcNow.AddDays(
                        Convert.ToDouble(_configuration["Jwt:RefreshTokenDays"] ?? "7")
                    )
                });

                result.RefreshToken = null;
            }

            return Ok(result);
        }

        [HttpPost("forgot-password")]
        [HttpPost("resend-code")]
        public async Task<IActionResult> ResendCode([FromBody] ResendCodeRequestDto request)
        {
            _logger.LogInformation($"Resend otp code for email: {request.Email}");
            
            var command = new ResendCodeCommand(request);
            var result = await _mediator.Send(command);
            
            if (result.Success)
            {
                return Ok(result);
            }
            
            return Unauthorized(result);
        }

        [HttpPost("verify-change-password")]
        public async Task<IActionResult> VerifyChangePassword([FromBody] VerifyChangePasswordRequestDto request)
        {
            _logger.LogInformation($"Change-password verify attempt for email: {request.Email}");
            
            var command = new VerifyChangePasswordCommand(request);
            var result = await _mediator.Send(command);
            
            if (result.Success)
            {
                return Ok(result);
            }
            
            return Unauthorized(result);
        }
        
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto request)
        {
            _logger.LogInformation($"Change-password attempt for email: {request.Email}");
            
            var command = new ChangePasswordCommand(request);
            var result = await _mediator.Send(command);
            
            if (result.Success)
            {
                return Ok(result);
            }
            
            return Unauthorized(result);
        }


        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshToken))
                return Unauthorized(new { message = "No refresh token" });

            var command = new RefreshTokenCommand(refreshToken);
            var result = await _mediator.Send(command);

            if (!result.Success)
                return Unauthorized(result);

            Response.Cookies.Append("refreshToken", result.RefreshToken!, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddDays(
                    Convert.ToDouble(_configuration["Jwt:RefreshTokenDays"] ?? "7")
                )
            });
            result.RefreshToken = null;

            return Ok(result);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var refresh = Request.Cookies["refreshToken"];

            var command = new LogoutCommand(refresh);
            var result = await _mediator.Send(command);

            // Always delete cookie
            Response.Cookies.Delete("refreshToken", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None
            });

            return Ok(result);
        }

    }
}