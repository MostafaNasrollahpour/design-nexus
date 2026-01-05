using IAM.Domain.Interfaces;
using IAM.Infrastructure.Data;
using IAM.Infrastructure.Repositories;
using IAM.Infrastructure.Services;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

using IAM.Application.Commands.Register;


var builder = WebApplication.CreateBuilder(args);

// افزودن خدمات به container
builder.Services.AddControllers();

// تنظیمات Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "IAM Service API", 
        Version = "v1",
        Description = "Identity and Access Management Service",
        Contact = new OpenApiContact
        {
            Name = "Support",
            Email = "support@example.com"
        }
    });
    
    // تنظیمات XML Documentation
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = System.IO.Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (System.IO.File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IOtpService, OtpService>();

var dbConnectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured in appsettings.json");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(dbConnectionString));

var redisConnectionString = builder.Configuration.GetConnectionString("Redis");
if (!string.IsNullOrEmpty(redisConnectionString))
{
    builder.Services.AddStackExchangeRedisCache(options =>
    {
        options.Configuration = redisConnectionString;
        options.InstanceName = "IAM_";
    });
}

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
builder.Services.AddScoped<IOtpService, OtpService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IEmailService, EmailService>();


builder.Services.AddMediatR(cfg => 
{
    cfg.RegisterServicesFromAssembly(typeof(RegisterCommandHandler).Assembly);
});

// تنظیمات JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secret = jwtSettings["Secret"] ?? throw new InvalidOperationException("JWT Secret is not configured in appsettings.json");
var key = Encoding.UTF8.GetBytes(secret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // ⚠️ چون توکن از هدر نمی‌آید، بلکه از کوکی می‌آید
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            // گرفتن توکن از کوکی
            if (context.Request.Cookies.ContainsKey("access_token"))
            {
                context.Token = context.Request.Cookies["access_token"];
            }

            return Task.CompletedTask;
        },
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"Authentication failed: {context.Exception.Message}");
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            Console.WriteLine("Token validated successfully");
            return Task.CompletedTask;
        }
    };

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),

        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],

        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],

        ValidateLifetime = true,

        // ⛔ برای امنیت بالاتر و انقضا دقیق، حتماً صفرش کن
        ClockSkew = TimeSpan.Zero
    };

    // برای اینکه HTTPS لازم نباشه در لوکال (در پروڈاکشن حذف کن!)
    options.RequireHttpsMetadata = false;
});

// افزودن Authorization
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => 
        policy.RequireClaim("Role", "Admin"));
    
    options.AddPolicy("UserOnly", policy => 
        policy.RequireClaim("Role", "User", "Admin"));
});

// تنظیم CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
    
    options.AddPolicy("Production",
        builder =>
        {
            builder.WithOrigins("https://example.com")
                   .AllowAnyMethod()
                   .AllowAnyHeader()
                   .AllowCredentials();
        });
});

// تنظیمات Health Check - با بررسی null بودن connection string
var healthChecksBuilder = builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>();

if (!string.IsNullOrEmpty(redisConnectionString))
{
    healthChecksBuilder.AddRedis(redisConnectionString);
}
else
{
    Console.WriteLine("Skipping Redis health check because Redis is not configured.");
}

// تنظیمات Response Compression
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
});

var app = builder.Build();

// میدلورها
app.UseResponseCompression();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "IAM Service API V1");
        c.RoutePrefix = "swagger";
        c.DisplayRequestDuration();
        c.EnableDeepLinking();
        c.DefaultModelsExpandDepth(-1); // غیرفعال کردن نمایش مدل‌ها
    });
    
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/error");
    app.UseHsts();
}

// اجرای migrations در زمان راه‌اندازی
using (var scope = app.Services.CreateScope())
{
    try
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await dbContext.Database.MigrateAsync();
        Console.WriteLine("Database migrations applied successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"An error occurred while applying migrations: {ex.Message}");
    }
}

// temp comment
app.UseHttpsRedirection();


// app.UseCors("AllowAll");
app.UseCors(builder => builder
    .WithOrigins("http://localhost:3000") // origin دقیق را مشخص کنید
    .AllowAnyMethod()
    .AllowAnyHeader()
    .AllowCredentials());

// Health Check endpoint
app.MapHealthChecks("/health");

// Error handling endpoint
app.Map("/error", (HttpContext context) =>
{
    var exceptionHandler = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
    var exception = exceptionHandler?.Error;
    return Results.Problem(
        detail: exception?.Message,
        title: "An error occurred",
        statusCode: StatusCodes.Status500InternalServerError
    );
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Middleware برای لاگ‌گیری درخواست‌ها
app.Use(async (context, next) =>
{
    var startTime = DateTime.UtcNow;
    
    await next();
    
    var endTime = DateTime.UtcNow;
    var duration = endTime - startTime;
    
    Console.WriteLine($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] {context.Request.Method} {context.Request.Path} - {context.Response.StatusCode} - {duration.TotalMilliseconds}ms");
});

// Default route
app.MapGet("/", () => "IAM Service is running. Go to /swagger for API documentation.");

try
{
    Console.WriteLine("Starting IAM Service...");
    Console.WriteLine($"Environment: {app.Environment.EnvironmentName}");
    Console.WriteLine($"URLs: {string.Join(", ", app.Urls)}");
    
    app.Run();
}
catch (Exception ex)
{
    Console.WriteLine($"Application failed to start: {ex.Message}");
    Console.WriteLine(ex.StackTrace);
    throw;
}