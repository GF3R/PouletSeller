using System.Globalization;
using Knutti.Api.Models;
using Knutti.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});
builder.Services.AddSingleton<DataRepository>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseStaticFiles();
app.UseHttpsRedirection();

// ---- Utilities ----
DateOnly? ParseDate(string? value)
{
    if (DateOnly.TryParse(value, out var date))
    {
        return date;
    }
    return null;
}

IEnumerable<FinanceEntry> FilterByDate(IEnumerable<FinanceEntry> entries, string? from, string? to)
{
    var fromDate = ParseDate(from);
    var toDate = ParseDate(to);
    return entries.Where(e =>
        (!fromDate.HasValue || e.Date >= fromDate) &&
        (!toDate.HasValue || e.Date <= toDate));
}

string BuildFinanceCsv(IEnumerable<FinanceEntry> entries)
{
    var lines = new List<string>
    {
        "Belegnr,Datum,Beschreibung,Name,Betrag (CHF),Zahlungsart,Bemerkung,Typ"
    };

    foreach (var e in entries)
    {
        lines.Add($"{e.ReceiptNumber},{e.Date:yyyy-MM-dd},{Escape(e.Description)},{Escape(e.Person)},{e.Amount.ToString(CultureInfo.InvariantCulture)},{Escape(e.PaymentMethod)},{Escape(e.Note)},{e.Type}");
    }

    return string.Join("\n", lines);
}

string BuildCombinedCsv(IEnumerable<FinanceEntry> incomes, IEnumerable<FinanceEntry> expenses)
{
    var lines = new List<string>
    {
        "Datum (Ausgabe);Beschreibung;Betrag (CHF);Zahlungsart;Bemerkung;;Datum (Einnahme);Beschreibung;Betrag (CHF);Zahlungsart;Bemerkung"
    };

    var maxRows = Math.Max(expenses.Count(), incomes.Count());
    for (var i = 0; i < maxRows; i++)
    {
        var left = expenses.ElementAtOrDefault(i);
        var right = incomes.ElementAtOrDefault(i);

        var leftRow = left == null
            ? ";;;;"
            : $"{left.Date:yyyy-MM-dd};{Escape(left.Description)} {Escape(left.Person)};{left.Amount.ToString(CultureInfo.InvariantCulture)};{Escape(left.PaymentMethod)};{Escape(left.Note)}";

        var rightRow = right == null
            ? ";;;;"
            : $"{right.Date:yyyy-MM-dd};{Escape(right.Description)} {Escape(right.Person)};{right.Amount.ToString(CultureInfo.InvariantCulture)};{Escape(right.PaymentMethod)};{Escape(right.Note)}";

        lines.Add($"{leftRow};;{rightRow}");
    }

    return string.Join("\n", lines);
}

string Escape(string value) => value.Replace(",", " ").Replace(";", " ");

// ---- Health ----
app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

// ---- Customers ----
app.MapGet("/api/customers", (string? query, DataRepository repo) =>
{
    var customers = repo.GetCustomers();
    if (!string.IsNullOrWhiteSpace(query))
    {
        var q = query.Trim().ToLowerInvariant();
        customers = customers
            .Where(c => c.FullName.ToLowerInvariant().Contains(q))
            .ToList();
    }

    return Results.Ok(customers
        .OrderBy(c => c.LastName)
        .ThenBy(c => c.FirstName));
});

app.MapGet("/api/customers/{id:guid}", (Guid id, DataRepository repo) =>
{
    var customer = repo.GetCustomer(id);
    return customer is null ? Results.NotFound() : Results.Ok(customer);
});

app.MapPost("/api/customers", (CustomerRequest request, DataRepository repo) =>
{
    var created = repo.AddCustomer(request);
    return Results.Created($"/api/customers/{created.Id}", created);
});

app.MapPut("/api/customers/{id:guid}", (Guid id, CustomerRequest request, DataRepository repo) =>
{
    var updated = repo.UpdateCustomer(id, request);
    return updated is null ? Results.NotFound() : Results.Ok(updated);
});

app.MapPut("/api/customers/{id:guid}/orders", (Guid id, OrderUpdateRequest request, DataRepository repo) =>
{
    var updated = repo.UpdateOrders(id, request);
    return updated is null ? Results.NotFound() : Results.Ok(updated);
});

app.MapDelete("/api/customers/{id:guid}", (Guid id, DataRepository repo) =>
{
    var removed = repo.DeleteCustomer(id);
    return removed ? Results.NoContent() : Results.NotFound();
});

// ---- Inventory ----
app.MapGet("/api/inventory", (DataRepository repo) => Results.Ok(repo.GetInventory()));

app.MapPut("/api/inventory", (InventoryData request, DataRepository repo) =>
{
    var saved = repo.SaveInventory(request);
    return Results.Ok(saved);
});

// ---- Discount ----
app.MapGet("/api/discount", (DataRepository repo) => Results.Ok(repo.GetDiscount()));

app.MapPut("/api/discount", (DiscountConfig config, DataRepository repo) =>
{
    var saved = repo.SaveDiscount(config);
    return Results.Ok(saved);
});

// ---- Sales ----
app.MapPost("/api/sales", (SaleRequest request, DataRepository repo) =>
{
    var result = repo.RegisterSale(request);
    if (result.Customer is null || result.Entry is null)
    {
        return Results.NotFound(new { message = "Customer not found" });
    }

    return Results.Ok(new
    {
        customer = result.Customer,
        finance = result.Entry,
        inventory = result.Inventory,
        quantity = result.QuantityUsed
    });
});

// ---- Finance ----
app.MapGet("/api/finance/incomes", (string? from, string? to, DataRepository repo) =>
{
    var incomes = FilterByDate(repo.GetFinanceEntries().Where(f => f.Type == FinanceType.Income), from, to);
    return Results.Ok(incomes.OrderByDescending(f => f.Date));
});

app.MapGet("/api/finance/expenses", (string? from, string? to, DataRepository repo) =>
{
    var expenses = FilterByDate(repo.GetFinanceEntries().Where(f => f.Type == FinanceType.Expense), from, to);
    return Results.Ok(expenses.OrderByDescending(f => f.Date));
});

app.MapPost("/api/finance/incomes", (FinanceRequest request, DataRepository repo) =>
{
    request.Type = FinanceType.Income;
    var entry = repo.AddFinanceEntry(request);
    return Results.Created($"/api/finance/incomes/{entry.Id}", entry);
});

app.MapPost("/api/finance/expenses", (FinanceRequest request, DataRepository repo) =>
{
    request.Type = FinanceType.Expense;
    var entry = repo.AddFinanceEntry(request);
    return Results.Created($"/api/finance/expenses/{entry.Id}", entry);
});

app.MapGet("/api/finance/overview", (DataRepository repo) =>
{
    var entries = repo.GetFinanceEntries();
    var incomes = entries.Where(e => e.Type == FinanceType.Income).Sum(e => e.Amount);
    var expenses = entries.Where(e => e.Type == FinanceType.Expense).Sum(e => e.Amount);
    return Results.Ok(new { incomes, expenses, balance = incomes - expenses });
});

app.MapGet("/api/finance/csv", (string? type, string? from, string? to, DataRepository repo) =>
{
    type = type?.ToLowerInvariant() ?? "income";
    var entries = repo.GetFinanceEntries();
    var filtered = FilterByDate(type switch
    {
        "expense" or "expenses" => entries.Where(e => e.Type == FinanceType.Expense),
        _ => entries.Where(e => e.Type == FinanceType.Income)
    }, from, to);

    var csv = BuildFinanceCsv(filtered);
    return Results.Text(csv, "text/csv");
});

app.MapGet("/api/finance/csv/combined", (string? from, string? to, DataRepository repo) =>
{
    var entries = repo.GetFinanceEntries();
    var incomes = FilterByDate(entries.Where(e => e.Type == FinanceType.Income), from, to).ToList();
    var expenses = FilterByDate(entries.Where(e => e.Type == FinanceType.Expense), from, to).ToList();
    var csv = BuildCombinedCsv(incomes, expenses);
    return Results.Text(csv, "text/csv");
});

// ---- Uploads (TWINT, Google, Logo) ----
app.MapGet("/api/uploads", (IWebHostEnvironment env) =>
{
    var uploads = Path.Combine(env.ContentRootPath, "wwwroot", "uploads");
    Directory.CreateDirectory(uploads);
    var files = Directory.GetFiles(uploads)
        .Select(f => new
        {
            name = Path.GetFileNameWithoutExtension(f),
            path = "/uploads/" + Path.GetFileName(f)
        });
    return Results.Ok(files);
});

app.MapPost("/api/uploads/{kind}", async (string kind, IFormFile file, IWebHostEnvironment env) =>
{
    var allowed = new[] { "twint", "google", "logo" };
    if (!allowed.Contains(kind.ToLowerInvariant()))
    {
        return Results.BadRequest(new { message = "Unknown upload kind" });
    }

    if (file.Length == 0)
    {
        return Results.BadRequest(new { message = "Empty file" });
    }

    var uploads = Path.Combine(env.ContentRootPath, "wwwroot", "uploads");
    Directory.CreateDirectory(uploads);

    foreach (var existing in Directory.GetFiles(uploads, $"{kind}.*"))
    {
        File.Delete(existing);
    }

    var ext = Path.GetExtension(file.FileName);
    if (string.IsNullOrWhiteSpace(ext) || ext.Length > 5)
    {
        ext = ".jpg";
    }

    var fileName = $"{kind}{ext.ToLowerInvariant()}";
    var path = Path.Combine(uploads, fileName);

    await using var stream = File.Create(path);
    await file.CopyToAsync(stream);

    return Results.Ok(new { path = "/uploads/" + fileName });
});

app.Run();
