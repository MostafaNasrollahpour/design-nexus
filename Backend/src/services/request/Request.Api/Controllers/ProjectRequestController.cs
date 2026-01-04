using Request.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Request.Application.DTOs;

using Request.Application.Commands.CreateProjectRequest;

using Request.Application.Queries.GetProjectRequests;

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
            [FromBody] CreateProjectRequestDto request, CancellationToken ct)
        {
            var command = new CreateProjectRequestCommand(request);
            var result = await _mediator.Send(command, ct);

            if (result.Success)
                return Ok(result);
            else
                return BadRequest(result);
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetProjectRequests(CancellationToken ct)
        {
            var query = new GetProjectRequestsQuery();
            var result = await _mediator.Send(query, ct);

            if (result.Success)
            {
                return Ok(result.Data);
            }

            return BadRequest(result.Message);
        }
    }
}