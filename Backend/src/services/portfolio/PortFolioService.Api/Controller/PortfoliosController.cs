using System.Threading.Tasks;
using PortFolioService.Application.DTOs;
using PortFolioService.Application.Commands.CreatePortfolio;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;

namespace PortFolioService.Api.Controllers
{
    [ApiController]
    [Route("api/portfolios")]
    public class PortfoliosController : ControllerBase
    {
        private readonly IMediator _mediator;

        public PortfoliosController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        [Authorize(Roles = "طراح")]
        public async Task<IActionResult> Create(
            [FromForm] CreatePortfolioRequestDto request)
        {
            var command = new CreatePortfolioCommand(request);
            var result = await _mediator.Send(command);

            return Ok(result);
        }
    }

}