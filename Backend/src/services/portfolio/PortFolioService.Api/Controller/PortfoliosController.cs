using System.Threading.Tasks;
using PortFolioService.Application.DTOs;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

using PortFolioService.Application.Commands.CreatePortfolio;
using PortFolioService.Application.Commands.UpdateDesignerProfile;
using PortFolioService.Application.Commands.DeletePortfolio;
using PortFolioService.Application.Commands.UpdatePortfolio;

using PortFolioService.Application.Queries.GetRecentPortfolio;
using PortFolioService.Application.Queries.GetPortfolioByCategory;
using PortFolioService.Application.Queries.GetPortfolioByDesigner;
using PortFolioService.Application.Queries.GetPortfolioById;
using PortFolioService.Application.Queries.GetAllDesigners;
using PortFolioService.Application.Queries.GetDesignerDetails;

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

            if (!result.Success)
            {
                return Unauthorized(result);
            }
            return Ok(result);
        }


        [HttpGet("recent")]
        public async Task<IActionResult> GetRecent(
            [FromQuery] int count = 50,
            CancellationToken ct = default)
        {
            var query = new GetRecentPortfoliosQuery(count);
            var result = await _mediator.Send(query, ct);

            return Ok(result);
        }


        [HttpGet("category/{categoryId:int}")]
        public async Task<IActionResult> GetByCategory(
            int categoryId,
            CancellationToken ct)
        {
            var query = new GetPortfolioByCategoryQuery(categoryId);
            var result = await _mediator.Send(query, ct);

            return Ok(result);
        }

        [HttpGet("designer/{designerId:int}")]
        public async Task<IActionResult> GetByDesigner(
            int designerId,
            CancellationToken ct)
        {
            var query = new GetPortfolioByDesignerQuery(designerId);
            var result = await _mediator.Send(query, ct);

            return Ok(result);
        }

        [HttpPost("profile")]
        [Authorize(Roles = "طراح")]
        public async Task<IActionResult> UploadProfileImage(
            [FromForm] UpdateDesignerProfileRequestDto request)
        {
            var command = new UpdateDesignerProfileCommand(request);
            var result = await _mediator.Send(command);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpDelete("{portfolioId:int}")]
        [Authorize(Roles = "طراح")]
        public async Task<IActionResult> Delete(
            int portfolioId,
            CancellationToken ct)
        {
            var command = new DeletePortfolioCommand(portfolioId);
            var result = await _mediator.Send(command, ct);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(
            int id,
            CancellationToken ct)
        {
            var query = new GetPortfolioByIdQuery(id);
            var result = await _mediator.Send(query, ct);

            return Ok(result);
        }

        [HttpGet("designer/me")]
        [Authorize(Roles = "طراح")]
        public async Task<IActionResult> GetMyPortfolios(CancellationToken ct)
        {
            var query = new GetMyPortfolioQuery();
            var result = await _mediator.Send(query, ct);
            return Ok(result);
        }

        [HttpGet("designers")]
        public async Task<IActionResult> GetAllDesigners(CancellationToken ct)
        {
            var query = new GetAllDesignersQuery();
            var result = await _mediator.Send(query, ct);
            return Ok(result);
        }

        [HttpGet("designer-details/{designerId:int}")]
        public async Task<IActionResult> GetDesignerDetails(
            int designerId,
            CancellationToken ct)
        {
            var query = new GetDesignerDetailsQuery(designerId);
            var result = await _mediator.Send(query, ct);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPut("{portfolioId:int}")]
        [Authorize(Roles = "طراح")]
        public async Task<IActionResult> Edit(
            int portfolioId,
            [FromForm] UpdatePortfolioRequestDto request,
            CancellationToken ct)
        {
            var command = new UpdatePortfolioCommand(portfolioId, request);
            var result = await _mediator.Send(command, ct);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        
    }

}