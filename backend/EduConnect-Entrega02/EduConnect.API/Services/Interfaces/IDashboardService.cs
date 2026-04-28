using EduConnect.Api.DTOs.Dashboard;

namespace EduConnect.Api.Services.Interfaces;

public interface IDashboardService
{
    Task<AdminDashboardResponseDto> ObterDashboardAdminAsync();
}