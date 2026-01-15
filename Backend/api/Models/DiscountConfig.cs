namespace Knutti.Api.Models;

public class DiscountConfig
{
    // NONE, PERCENT, ABS
    public string Mode { get; set; } = "NONE";
    public double Value { get; set; }
}
