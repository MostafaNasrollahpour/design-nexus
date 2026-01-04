using Request.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Request.Application.DTOs;

using Request.Application.Commands.CreateProjectRequest;

using Request.Application.Queries.GetProjectRequestsByRequester;
using Request.Application.Queries.GetProjectRequestsByDesigner;

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
        public async Task<IActionResult> GetProjectRequestsByRequester(CancellationToken ct)
        {
            var query = new GetProjectRequestsByRequesterQuery();
            var result = await _mediator.Send(query, ct);

            if (result.Success)
            {
                return Ok(result.Data);
            }

            return BadRequest(result.Message);
        }

        [HttpGet("by-designer")]
        [Authorize] 
        public async Task<IActionResult> GetProjectRequestsByDesigner(
            [FromServices] ICurrentUser currentUser,
            CancellationToken ct)
        {
            
            if (currentUser.Role != "طراح")
                return Forbid(); 

            var query = new GetProjectRequestsByDesignerQuery();
            var result = await _mediator.Send(query, ct);

            if (result.Success)
                return Ok(result);
            else
                return BadRequest(result);
        }
    }
}