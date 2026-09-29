# Forecasting checks

The application remains a single `index.html`. Its numerical engine is embedded in
`statistics-python` and runs in a browser worker using Pyodide 0.27.7 and the
bundled Statsmodels 0.14.4. No Python server is needed to use the app.

For development, numerical tests extract that same embedded engine. Tested with
Python 3.12 and these native equivalents:

```sh
python3.12 -m venv /tmp/stockwise-test-env
/tmp/stockwise-test-env/bin/pip install statsmodels==0.14.4 numpy==2.0.2 scipy==1.14.1 pandas==2.2.3
/tmp/stockwise-test-env/bin/python tests/test_forecasting.py
node tests/report.test.cjs
node tests/model-controls.test.cjs
```

The numerical suite checks linear inference, random-walk ARIMA, seasonal random
walks, estimated AR dependence, inverse log/differencing transformations, constant
series, short histories, and invalid values. Report tests check content; actual
PDF layout is additionally inspected from the browser-generated report.

The browser smoke test requires Playwright and a browser. It creates only a
throwaway browser profile, serves the app on localhost port 8876, and writes QA
screenshots/PDF into `/tmp/stockwise-models`. It needs internet access to the app's
CDNs. Set `CHROME_BIN` to an installed Chrome executable, or install Playwright's
Chromium first:

```sh
npm install --prefix /tmp/stockwise-browser-tests playwright
NODE_PATH=/tmp/stockwise-browser-tests/node_modules node tests/browser.smoke.cjs
```

The smoke test covers all three models, PDF download, stationarity suggestions,
mobile width, hidden-field validation, EOQ transfer in SGD, cancellation, and a
short-history rejection. All accounts used by this test are local demo accounts.

## Statistical conventions

- ARIMA/SARIMA are estimated without an intercept or drift, with stationary AR
  and invertible MA constraints. The user chooses the orders.
- R² uses original-scale, uncapped one-step fitted demand after initialization.
  Adjusted R² uses `1 - (1-R²)(n-1)/(n-k)`, with ARIMA's estimated variance included
  in `k`. Transformed and ARIMA/SARIMA values are explicitly descriptive, not
  ordinary least-squares inference or out-of-sample forecast accuracy.
- Linear model p-values are slope F-tests. ARIMA/SARIMA model p-values are joint
  asymptotic Wald tests of AR/MA coefficients, excluding innovation variance.
  Undefined tests display N/A; numerical underflow in a p-value displays `<1e-16`.
- ACF/PACF show approximate pointwise white-noise bounds. Residual Ljung–Box tests
  adjust degrees of freedom for AR/MA terms.
- ADF and KPSS jointly inform the stationarity suggestion; they do not guarantee
  second-order stationarity. Original records remain intact. Log point forecasts
  are back-transformed without a mean-bias correction, and future negative demand
  is capped at zero only for planning.

## Documentation and template maintenance

The [project README](../README.md) links the current Word guides and upload
instructions. The deployment guide describes future production work; these tests
exercise the existing local demo, not a backend or container deployment.

When changing the numerical engine, update the user guide's model controls,
minimum history, statistical conventions, unavailable-result behavior and PDF
contents. Keep the deployment plan's model snapshot and parity requirements in
sync. Check PDF layout for all models when report content changes.

The Excel workbook's first worksheet is upload data; its second worksheet holds
instructions. If editing that workbook, update the base64 XLSX in the
`download-template` handler in `index.html` to the identical exported bytes.
Preserve the Date/Quantity sample data and verify that both the external and
embedded workbook parse. CSV has no instruction rows; its guidance lives in
[upload instructions](../outputs/stockwise-template/README.md).

## Admin account checks

```sh
node tests/admin-accounts.test.cjs
node tests/account-types.test.cjs
NODE_PATH=/tmp/stockwise-browser-tests/node_modules node tests/admin.browser.cjs
```

The browser check uses the same Playwright/CHROME_BIN setup above, on port 8877.
It checks Member/Admin creation and sign-in, duplicate emails, preservation of
the administrator session and mobile layout. Screenshots go to
`/tmp/stockwise-admin-desktop.png` and `/tmp/stockwise-admin-mobile.png`.
The numerical-free account test also checks password hashing, invalid inputs,
role restrictions and session revocation while hashing is in progress.

Custom-type checks cover unique names, reserved labels, access mapping, assignment
to existing users, persistence after reload and sign-in under custom types.

The account/browser tests generate temporary demo passwords at runtime. Account
identifiers use fictional `example.com` addresses. The admin browser check also
verifies masked inputs, account labels and accessible labels.
