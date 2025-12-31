using System.Threading.Tasks;
using IAM.Application.DTOs;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

using IAM.Application.Queries.GetDesignerUser;

namespace IAM.Api.Controllers;

[ApiController]
[Route("internal/designers")]
public class InternalController : ControllerBase
{
    private readonly IMediator _mediator;

    public InternalController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{designerId:int}")]
    public async Task<IActionResult> GetDesignerUser(int designerId)
    {
        var user = await _mediator.Send(new GetDesignerUserQuery(designerId));

        if (user is null)
            return NotFound();

        return Ok(user);
    }
}

