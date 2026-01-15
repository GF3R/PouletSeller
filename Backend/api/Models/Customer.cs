using System.Text.Json.Serialization;

namespace Knutti.Api.Models;

public class Customer
{
    public Guid Id { get; set; } = Guid.NewGuid();
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
    public double UmsatzTruten { get; set; }
    public double UmsatzPoulet { get; set; }
    public double UmsatzTotal { get; set; }
    public string InfoChannel { get; set; } = "WhatsApp";
    public string Phone { get; set; } = string.Empty;

    [JsonIgnore]
    public string FullName => $"{FirstName} {LastName}".Trim();
}
