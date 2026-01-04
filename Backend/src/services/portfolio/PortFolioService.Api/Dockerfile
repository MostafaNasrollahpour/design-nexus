# -------- BUILD STAGE --------
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and restore
COPY Backend.sln .
COPY src/services/portfolio/PortFolioService.Api/PortFolioService.Api.csproj src/services/portfolio/PortFolioService.Api/
COPY src/services/portfolio/PortFolioService.Application/PortFolioService.Application.csproj src/services/portfolio/PortFolioService.Application/
COPY src/services/portfolio/PortFolioService.Domain/PortFolioService.Domain.csproj src/services/portfolio/PortFolioService.Domain/
COPY src/services/portfolio/PortFolioService.Infrastructure/PortFolioService.Infrastructure.csproj src/services/portfolio/PortFolioService.Infrastructure/

# Restore (cached)
RUN dotnet restore src/services/portfolio/PortFolioService.Api/PortFolioService.Api.csproj

# Copy source code AFTER restore
COPY src/services/portfolio ./src/services/portfolio

RUN dotnet publish src/services/portfolio/PortFolioService.Api/PortFolioService.Api.csproj -o /app/publish /p:UseAppHost=false

# -------- RUNTIME STAGE --------
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "PortFolioService.Api.dll"]
