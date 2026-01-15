using System.Text.Json;
using Knutti.Api.Json;
using Knutti.Api.Models;

namespace Knutti.Api.Services;

public class DataRepository
{
    private readonly string _basePath;
    private readonly JsonSerializerOptions _jsonOptions;

    private readonly object _customerLock = new();
    private readonly object _financeLock = new();
    private readonly object _inventoryLock = new();
    private readonly object _discountLock = new();
    private readonly object _counterLock = new();

    public DataRepository(IWebHostEnvironment env)
    {
        _basePath = Path.Combine(env.ContentRootPath, "Data");
        Directory.CreateDirectory(_basePath);
        Directory.CreateDirectory(Path.Combine(env.ContentRootPath, "wwwroot", "uploads"));

        _jsonOptions = new JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
        _jsonOptions.Converters.Add(new DateOnlyJsonConverter());
    }

    private string PathFor(string name) => Path.Combine(_basePath, name);

    private T Load<T>(string file, T fallback)
    {
        var path = PathFor(file);
        if (!File.Exists(path))
        {
            return fallback;
        }

        var json = File.ReadAllText(path);
        if (string.IsNullOrWhiteSpace(json))
        {
            return fallback;
        }

        return JsonSerializer.Deserialize<T>(json, _jsonOptions) ?? fallback;
    }

    private void Save<T>(string file, T data)
    {
        var path = PathFor(file);
        var json = JsonSerializer.Serialize(data, _jsonOptions);
        File.WriteAllText(path, json);
    }

    // -------- Customers --------
    public List<Customer> GetCustomers()
    {
        lock (_customerLock)
        {
            return Load("customers.json", new List<Customer>());
        }
    }

    public Customer? GetCustomer(Guid id)
    {
        lock (_customerLock)
        {
            var customers = Load("customers.json", new List<Customer>());
            return customers.FirstOrDefault(c => c.Id == id);
        }
    }

    public Customer AddCustomer(CustomerRequest request)
    {
        lock (_customerLock)
        {
            var customers = Load("customers.json", new List<Customer>());
            var customer = new Customer
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                PouletSpezial = request.PouletSpezial,
                PouletSpezialStueck = request.PouletSpezialStueck,
                Poulet3kg = request.Poulet3kg,
                Truten5kg = request.Truten5kg,
                Truten10kg = request.Truten10kg,
                Address = request.Address,
                PostalCode = request.PostalCode,
                City = request.City,
                InfoChannel = request.InfoChannel,
                Phone = request.Phone,
                UmsatzPoulet = 0,
                UmsatzTruten = 0,
                UmsatzTotal = 0
            };

            customers.Add(customer);
            Save("customers.json", customers);
            return customer;
        }
    }

    public Customer? UpdateCustomer(Guid id, CustomerRequest request)
    {
        lock (_customerLock)
        {
            var customers = Load("customers.json", new List<Customer>());
            var existing = customers.FirstOrDefault(c => c.Id == id);
            if (existing == null)
            {
                return null;
            }

            existing.FirstName = request.FirstName;
            existing.LastName = request.LastName;
            existing.PouletSpezial = request.PouletSpezial;
            existing.PouletSpezialStueck = request.PouletSpezialStueck;
            existing.Poulet3kg = request.Poulet3kg;
            existing.Truten5kg = request.Truten5kg;
            existing.Truten10kg = request.Truten10kg;
            existing.Address = request.Address;
            existing.PostalCode = request.PostalCode;
            existing.City = request.City;
            existing.InfoChannel = request.InfoChannel;
            existing.Phone = request.Phone;
            existing.UmsatzTotal = existing.UmsatzPoulet + existing.UmsatzTruten;

            Save("customers.json", customers);
            return existing;
        }
    }

    public Customer? UpdateOrders(Guid id, OrderUpdateRequest request)
    {
        lock (_customerLock)
        {
            var customers = Load("customers.json", new List<Customer>());
            var existing = customers.FirstOrDefault(c => c.Id == id);
            if (existing == null)
            {
                return null;
            }

            existing.PouletSpezial = request.PouletSpezial;
            existing.PouletSpezialStueck = request.PouletSpezialStueck;
            existing.Poulet3kg = request.Poulet3kg;
            existing.Truten5kg = request.Truten5kg;
            existing.Truten10kg = request.Truten10kg;

            Save("customers.json", customers);
            return existing;
        }
    }

    public bool DeleteCustomer(Guid id)
    {
        lock (_customerLock)
        {
            var customers = Load("customers.json", new List<Customer>());
            var removed = customers.RemoveAll(c => c.Id == id) > 0;
            if (removed)
            {
                Save("customers.json", customers);
            }

            return removed;
        }
    }

    // -------- Inventory --------
    public InventoryData GetInventory()
    {
        lock (_inventoryLock)
        {
            return Load("inventory.json", new InventoryData());
        }
    }

    public InventoryData SaveInventory(InventoryData data)
    {
        lock (_inventoryLock)
        {
            Save("inventory.json", data);
            return data;
        }
    }

    // -------- Discount --------
    public DiscountConfig GetDiscount()
    {
        lock (_discountLock)
        {
            return Load("discount.json", new DiscountConfig());
        }
    }

    public DiscountConfig SaveDiscount(DiscountConfig config)
    {
        lock (_discountLock)
        {
            Save("discount.json", config);
            return config;
        }
    }

    // -------- Finance --------
    public List<FinanceEntry> GetFinanceEntries()
    {
        lock (_financeLock)
        {
            return Load("finance.json", new List<FinanceEntry>());
        }
    }

    public FinanceEntry AddFinanceEntry(FinanceRequest request)
    {
        lock (_financeLock)
        {
            var entries = Load("finance.json", new List<FinanceEntry>());
            var receipt = NextReceiptNumber(request.Type == FinanceType.Income ? "E" : "A");
            var entry = new FinanceEntry
            {
                ReceiptNumber = receipt,
                Date = request.Date,
                Description = request.Description,
                Person = request.Person,
                Amount = request.Amount,
                PaymentMethod = request.PaymentMethod,
                Note = request.Note,
                Type = request.Type
            };

            entries.Add(entry);
            Save("finance.json", entries);
            return entry;
        }
    }

    public (Customer? Customer, FinanceEntry? Entry, InventoryData? Inventory, int QuantityUsed) RegisterSale(SaleRequest request)
    {
        lock (_customerLock)
        {
            lock (_inventoryLock)
            {
                lock (_financeLock)
                {
                    var customers = Load("customers.json", new List<Customer>());
                    var customer = customers.FirstOrDefault(c => c.Id == request.CustomerId);
                    if (customer == null)
                    {
                        return (null, null, null, 0);
                    }

                    var finalAmount = request.FinalAmount > 0 ? request.FinalAmount : request.BaseAmount;
                    var quantity = request.Quantity;
                    if (quantity <= 0)
                    {
                        quantity = request.Product switch
                        {
                            "Poulet Spezial" => customer.PouletSpezial,
                            "Poulet Spezial Stück" => customer.PouletSpezialStueck,
                            "Poulet 3kg" => customer.Poulet3kg,
                            "Truten 5kg" => customer.Truten5kg,
                            "Truten 10kg" => customer.Truten10kg,
                            _ => 0
                        };
                    }

                    customer.UmsatzPoulet += IsTruten(request.Product) ? 0 : finalAmount;
                    customer.UmsatzTruten += IsTruten(request.Product) ? finalAmount : 0;
                    customer.UmsatzTotal = customer.UmsatzPoulet + customer.UmsatzTruten;

                    switch (request.Product)
                    {
                        case "Poulet Spezial":
                            customer.PouletSpezial = 0;
                            break;
                        case "Poulet Spezial Stück":
                            customer.PouletSpezialStueck = 0;
                            break;
                        case "Poulet 3kg":
                            customer.Poulet3kg = 0;
                            break;
                        case "Truten 5kg":
                            customer.Truten5kg = 0;
                            break;
                        case "Truten 10kg":
                            customer.Truten10kg = 0;
                            break;
                    }

                    Save("customers.json", customers);

                    var inventory = Load("inventory.json", new InventoryData());
                    switch (request.Product)
                    {
                        case "Poulet 3kg":
                            inventory.Poulet3kg = Math.Max(0, inventory.Poulet3kg - quantity);
                            break;
                        case "Truten 5kg":
                            inventory.Truten5kg = Math.Max(0, inventory.Truten5kg - quantity);
                            break;
                        case "Truten 10kg":
                            inventory.Truten10kg = Math.Max(0, inventory.Truten10kg - quantity);
                            break;
                    }
                    Save("inventory.json", inventory);

                    var finance = Load("finance.json", new List<FinanceEntry>());
                    var receipt = NextReceiptNumber("E");
                    var entry = new FinanceEntry
                    {
                        ReceiptNumber = receipt,
                        Date = request.Date,
                        Description = request.Product,
                        Person = customer.FullName,
                        Amount = finalAmount,
                        PaymentMethod = request.PaymentMethod,
                        Note = request.Note,
                        Type = FinanceType.Income
                    };
                    finance.Add(entry);
                    Save("finance.json", finance);

                    return (customer, entry, inventory, quantity);
                }
            }
        }
    }

    // -------- Counter --------
    private string NextReceiptNumber(string prefix)
    {
        lock (_counterLock)
        {
            var counter = Load("counter.json", new CounterState());
            var number = counter.NextNumber++;
            Save("counter.json", counter);
            return $"{prefix}{number}";
        }
    }

    private static bool IsTruten(string product) =>
        product.Equals("Truten 5kg", StringComparison.OrdinalIgnoreCase) ||
        product.Equals("Truten 10kg", StringComparison.OrdinalIgnoreCase);
}
