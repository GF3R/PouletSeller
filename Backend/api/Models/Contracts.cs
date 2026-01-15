namespace Knutti.Api.Models;

public class CustomerRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public int PouletSpezial { get; set; }
    public int PouletSpezialStueck { get; set; }
    public int Poulet3kg { get; set; }
    public int Truten5kg { get; set; }
    public int Truten10kg { get; set; }
    public string Address { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string InfoChannel { get; set; } = "WhatsApp";
    public string Phone { get; set; } = string.Empty;
}

public class OrderUpdateRequest
{
    public int PouletSpezial { get; set; }
    public int PouletSpezialStueck { get; set; }
    public int Poulet3kg { get; set; }
    public int Truten5kg { get; set; }
    public int Truten10kg { get; set; }
}

public class SaleRequest
{
    public Guid CustomerId { get; set; }
    public string Product { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public DateOnly Date { get; set; }
    public double BaseAmount { get; set; }
    public double FinalAmount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
}

public class FinanceRequest
{
    public DateOnly Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Person { get; set; } = string.Empty;
    public double Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public FinanceType Type { get; set; }
}
