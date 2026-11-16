using Microsoft.EntityFrameworkCore;

namespace SmartTicketManagement.Infrastructure.Data;

public sealed class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : DbContext(options)
{
}
