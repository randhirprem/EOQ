# Stockwise inventory planning

Updated 14 September 2026. Stockwise is a responsive single-file browser demo for
EOQ calculations, monthly demand forecasting and PDF reports. Accounts and the
admin dashboard are local demos, as currently requested.

## Run the demo

From this folder, serve the app on localhost:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Open <http://localhost:8080>. Use a modern browser with internet access for the
CDN libraries. Localhost or HTTPS is needed for account features. This command is
a local preview, not the production service described in the deployment plan.

Create a demo account; the first account in that browser workspace becomes an
administrator. In **Admin dashboard → Add user**, administrators can create a
Member or Admin with a name, email and confirmed demo password (10–128 characters).
Creating an account keeps the administrator signed in; no invitation is emailed.
Under **Account types**, enter a unique name (up to 40 characters) and choose
Member or Admin access, then **Add account type**. Custom types remain available
in this browser after reload. Their names and access levels are fixed at creation;
create a new type to use a different permission level. Built-in Member and Admin
remain available, and self-registration still creates Members.
Use the account-type selector in the Accounts table to change another user’s role.
Members use planning and reports; Admins also manage accounts. Accounts and report activity stay in that browser's storage.
Name, email, password and account-search fields are masked. Account displays use
numbered labels, including accessible control labels and report activity.
Masking hides details on screen; names and emails remain in local browser storage.
They do not sync across browsers or devices and are not secure shared access
control. No verification/reset email is sent. Reloading or signing out clears
imported data and calculator results; retain original files and downloaded PDFs.

## Typical workflow

1. Choose MYR (Malaysian ringgit) or SGD (Singapore dollars) and enter positive
   annual demand, cost per order and annual holding cost in **EOQ Calculator**.
   Currency selection changes formatting, without converting exchange rates.
2. In **Demand Forecasting**, import an XLSX or CSV with `Date` and `Quantity`
   headers. Quantities are nonnegative units. Records are summed by month;
   missing months count as zero, so check that gaps really mean no demand.
3. Choose **Linear Regression**, **ARIMA** or **SARIMA** and review model orders.
   Uploading starts fitting. After changing controls, select **Fit model** again.
4. If appropriate, select the optional log transform and use **Check & suggest
   stationarity**. Review ADF/KPSS and the suggested differences, then fit again.
   Second-order stationarity is not the same as second differencing; no test or
   transformation guarantees it.
5. Review R², adjusted R², the named model p-value test, coefficients, residual
   Ljung–Box test and original/transformed/residual ACF and PACF charts.
6. Select **Use Forecasted Demand for EOQ** to transfer the positive 12-month
   total. Verify cost inputs and currency, then **Generate PDF report**.
   Reports include the fitted model, transformations, diagnostics and charts.

Linear Regression requires at least two observations after differencing. ARIMA
requires at least 12 monthly observations; SARIMA requires at least three seasons
(36 months with season length 12). Higher orders require more effective history.
The XLSX/CSV templates contain 12 fictional months and are format examples;
**Try sample data** supplies a separate 60-month fictional demonstration.

Forecasts cover the 12 months after the last historical month. Negative future
predictions are capped at zero for planning. R² describes historical fit, not
future accuracy; transformed/ARIMA adjusted R² is descriptive. ARIMA/SARIMA have
no intercept or drift and do not automatically select orders. Undefined statistics
display N/A. Log forecasts are inverted without a mean-bias correction.

## Documentation and templates

Start with the [project wiki](wiki/Home.md) for setup, usage and account guidance.

| File | Purpose |
| --- | --- |
| [User guide](outputs/stockwise-guide/Stockwise_User_Guide.docx) | Accounts, EOQ, imports, models, stationarity, diagnostics, PDF reports and troubleshooting |
| [Fedora deployment plan](outputs/stockwise-deployment/Stockwise_Fedora_Deployment_Plan.docx) | Future Docker/Cloudflare production architecture, backend work, model migration, operations and acceptance checks |
| [Upload instructions](outputs/stockwise-template/README.md) | XLSX/CSV structure, limits and history requirements |
| [Excel template](outputs/stockwise-template/stockwise-demand-template.xlsx) | First-sheet sample data and updated Instructions worksheet |
| [CSV template](outputs/stockwise-template/stockwise-demand-template.csv) | The same simple data format without instruction rows |
| [Development checks](tests/README.md) | Numerical, control, report and browser test commands and statistical conventions |

## Implementation and deployment status

All application code remains in `index.html`, including the Python statistical
engine in the `statistics-python` script. A background browser worker loads
Pyodide 0.27.7 and Statsmodels 0.14.4; fitting does not upload the imported data.
Chart.js, SheetJS, jsPDF and Tailwind are loaded from CDNs. No Python backend is
needed to use the demo. First-time engine loading can take a minute. Cancel stops
analysis; runs are limited to two minutes. Changes invalidate previous forecasts,
and PDF export with two or more imported months requires a current fitted model.

The Fedora/Docker/Cloudflare document is a **future production roadmap**. This
workspace does not yet provide its Django backend, real authentication, shared
saved plans, database migrations, Docker images, Compose files or release scripts.
The plan now specifies how to preserve all three models and diagnostics, package
the runtime, store versioned results, bound server computation and verify recovery.

## License and contact

Copyright (c) 2026 Randhir Prem. The original project code and accompanying
documentation, including the wiki, are licensed under the [MIT License](LICENSE).
Third-party libraries remain subject to their respective licenses.

Maintainer: Randhir Prem — [randhir.prem89@gmail.com](mailto:randhir.prem89@gmail.com).
