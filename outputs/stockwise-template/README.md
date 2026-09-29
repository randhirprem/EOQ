# Demand upload templates

Updated 14 September 2026. Use either [Excel](stockwise-demand-template.xlsx) or
[CSV](stockwise-demand-template.csv) in Stockwise's Demand Forecasting upload area.
The app's download buttons provide these templates. Replace all 12 fictional
sample rows with your own records before planning.

## Required structure

```csv
Date,Quantity
2025-01-31,100
2025-02-28,110
```

Keep the headers in row 1. Excel must keep **Demand data** as its first worksheet;
its **Instructions** worksheet is not imported. CSV must contain only headers and
data, with no notes, totals or instruction rows. Save as comma-separated CSV with
YYYY-MM-DD dates, or XLSX with real Excel dates. Quantity is a finite number of
units, zero or greater; decimals are allowed. Omit currency symbols and thousands
separators. Every populated row needs both fields.

You can supply individual transactions, daily totals or monthly totals. Avoid
mixing overlapping totals and transactions, which double-counts demand. Check
that the first and last months are complete. The app sums by calendar month and
fills missing months with zero; confirm this reflects actual demand.

Limits: one .xlsx or .csv file, 5 MB, 50,000 records, 256 columns and a 1,200-month
calendar span. The imported table supports sorting and shows 100 records per page.

## History and model choice

| Model | Minimum history |
| --- | --- |
| Linear Regression | Two monthly observations remaining after differencing; more are needed for inference |
| ARIMA | At least 12 months, with additional effective history for higher orders |
| SARIMA | At least three seasons: 36 months when s = 12, with enough observations after differences |

The 12-month template demonstrates format and is too short for annual seasonal
SARIMA. Extend it with real history. The app's **Try sample data** button uses a
separate 60-month fictional dataset for exploring all models.

An accepted upload starts fitting the selected model. After changing model or
transformation settings, select **Fit model**. **Check & suggest stationarity**
requires at least 12 months and tests ordinary/seasonal differences using ADF and
KPSS. The optional log transform is chosen manually. Suggestions do not guarantee
second-order stationarity and must be followed by a new fit.

Review R², adjusted R², named model p-value tests and ACF/PACF before using a
forecast. PDF reports include these diagnostics and transformation details.
Negative future forecasts are capped at zero. MYR/SGD applies to EOQ costs only;
this upload always contains unit quantities, not money.

Fitting runs locally after the statistical libraries download. Keep your source
file: imported records and results are cleared on reload or sign-out. If an
invalid import leaves earlier records visible, refit if their forecast was cleared.
See the [user guide](../stockwise-guide/Stockwise_User_Guide.docx) for full details.
