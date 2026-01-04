FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY Backend.sln .
COPY src/gateway/Gateway/Gateway.csproj src/gateway/Gateway/
RUN dotnet restore src/gateway/Gateway/Gateway.csproj

COPY src/gateway/Gateway ./src/gateway/Gateway

RUN dotnet publish src/gateway/Gateway/Gateway.csproj -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

EXPOSE 5157
ENV ASPNETCORE_URLS=http://+:5157

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "Gateway.dll"]
