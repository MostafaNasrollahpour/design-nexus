using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.FileProviders;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using PortFolioService.Application.Commands.CreatePortfolio;
using PortFolioService.Domain.Interfaces;
using PortFolioService.Infrastructure.Data;
using PortFolioService.Infrastructure.Repositories;
using PortFolioService.Infrastructure.Services;

JwtSecurityTokenHandler.DefaultMapInboundClaims = false;

var builder = WebApplication.CreateBuilder(args);

// --------------------
// CORS Configuration
// --------------------
var corsPolicyName = "AllowFrontend";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: corsPolicyName,
        policy =>
        {
            policy.WithOrigins(
                               "http://localhost:5173", // React/Vite dev server
                               "https://localhost:5173",
                               "http://localhost:3000", // Next.js or other React
                               "https://localhost:3000")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials(); // اگر از کوکی یا احراز هویت استفاده می‌کنید
        });
});

// --------------------
// HttpClient
// --------------------
builder.Services.AddHttpClient<IUserServiceClient, UserServiceClient>(client =>
{
    client.BaseAddress = new Uri("http://localhost:5209"); // from config
});



// --------------------
// Database
// --------------------
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// --------------------
// HttpContextAccessor (for CurrentUser)
// --------------------
builder.Services.AddHttpContextAccessor();

// --------------------
// Repositories / Services
// --------------------
builder.Services.AddScoped<IDesignerProfileRepository, DesignerProfileRepository>();
builder.Services.AddScoped<IPortfolioRepository, PortfolioRepository>();
builder.Services.AddScoped<IFileStorage, FileStorage>();
builder.Services.AddScoped<ICurrentUser, CurrentUser>();

// --------------------
// Controllers
// --------------------
builder.Services.AddControllers();

// --------------------
// MediatR
// --------------------
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(CreatePortfolioCommandHandler).Assembly));

// --------------------
// Swagger + JWT Auth
// --------------------
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Portfolio Service API",
        Version = "v1"
    });

    // JWT Auth
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "توکن JWT را اینجا وارد کنید 👇\n\nمثال:\nBearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// --------------------
// Authentication / JWT
// --------------------
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
            ),

            RoleClaimType = "role"
        };
    });

// --------------------
// Authorization
// --------------------
builder.Services.AddAuthorization();

var app = builder.Build();

// --------------------
// Serve Static Files (uploads) from wwwroot/uploads
// --------------------
var uploadsPath = Path.Combine(builder.Environment.WebRootPath ?? Path.Combine(builder.Environment.ContentRootPath, "wwwroot"), "uploads");

// Ensure directory exists
Directory.CreateDirectory(uploadsPath);

// Use static files middleware
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(builder.Environment.WebRootPath ?? Path.Combine(builder.Environment.ContentRootPath, "wwwroot"), "uploads")),
    RequestPath = "/uploads"
});

// --------------------
// Migration و Database Initialization
// --------------------
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.Migrate();
        Console.WriteLine("Database migration completed successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"An error occurred while migrating the database: {ex.Message}");
        throw;
    }
}

// Default route
app.MapGet("/", () => "Portfolio Service is running. Go to /swagger for API documentation.");


// --------------------
// Swagger middleware
// --------------------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// --------------------
// Middleware Order
// --------------------
app.UseCors(corsPolicyName);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
