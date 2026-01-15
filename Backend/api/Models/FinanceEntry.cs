namespace Knutti.Api.Models;

public enum FinanceType
{
    Income,
    Expense
}

public class FinanceEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ReceiptNumber { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Person { get; set; } = string.Empty;
    public double Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public FinanceType Type { get; set; }
}
