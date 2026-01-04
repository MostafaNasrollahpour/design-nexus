using Request.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Request.Application.Commands.CreateProjectRequest;
using Request.Application.DTOs;

namespace Request.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectRequestController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ProjectRequestController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        [Authorize] 
        public async Task<IActionResult> CreateProjectRequest(
            [FromBody] CreateProjectRequestDto request)
        {
            var command = new CreateProjectRequestCommand(request);
            var result = await _mediator.Send(command);

            if (result.Success)
                return Ok(result);
            else
                return BadRequest(result);
        }
    }
}