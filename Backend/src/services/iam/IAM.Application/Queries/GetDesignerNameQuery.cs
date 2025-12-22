using MediatR;
namespace IAM.Application.Queries;

public record GetDesignerNameQuery(int DesignerId) : IRequest<string>;
