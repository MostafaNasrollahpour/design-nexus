# -------- BUILD STAGE --------
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and restore
COPY Backend.sln .
COPY src/services/iam/IAM.Api/IAM.Api.csproj src/services/iam/IAM.Api/
COPY src/services/iam/IAM.Application/IAM.Application.csproj src/services/iam/IAM.Application/
COPY src/services/iam/IAM.Domain/IAM.Domain.csproj src/services/iam/IAM.Domain/
COPY src/services/iam/IAM.Infrastructure/IAM.Infrastructure.csproj src/services/iam/IAM.Infrastructure/

# Restore (cached)
RUN dotnet restore src/services/iam/IAM.Api/IAM.Api.csproj

# Copy source code AFTER restore
COPY src/services/iam ./src/services/iam

RUN dotnet publish src/services/iam/IAM.Api/IAM.Api.csproj -o /app/publish /p:UseAppHost=false

# -------- RUNTIME STAGE --------
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "IAM.Api.dll"]
