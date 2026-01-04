# -------- BUILD STAGE --------
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and restore
COPY Backend.sln .
COPY src/services/request/Request.Api/Request.Api.csproj src/services/request/Request.Api/
COPY src/services/request/Request.Application/Request.Application.csproj src/services/request/Request.Application/
COPY src/services/request/Request.Domain/Request.Domain.csproj src/services/request/Request.Domain/
COPY src/services/request/Request.Infrastructure/Request.Infrastructure.csproj src/services/request/Request.Infrastructure/

# Restore (cached)
RUN dotnet restore src/services/request/Request.Api/Request.Api.csproj

# Copy source code AFTER restore
COPY src/services/request ./src/services/request

RUN dotnet publish src/services/request/Request.Api/Request.Api.csproj -o /app/publish /p:UseAppHost=false

# -------- RUNTIME STAGE --------
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "Request.Api.dll"]
