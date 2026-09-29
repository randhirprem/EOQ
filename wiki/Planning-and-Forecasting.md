# Planning and forecasting

## Economic order quantity

Enter positive annual demand, cost per order and annual holding cost per unit.
Choose MYR or SGD. Currency selection changes formatting; it does not convert
exchange rates. EOQ uses the square root of twice annual demand times ordering
cost, divided by annual holding cost per unit.

## Import and fit

1. Import an XLSX or CSV file with `Date` and `Quantity` headers. Quantities must
   be nonnegative. See the [upload instructions](../outputs/stockwise-template/README.md).
2. Review monthly totals. Missing months are treated as zero demand.
3. Choose Linear Regression, ARIMA or SARIMA and set the model orders. Uploading
   starts fitting; after changing controls, select **Fit model** again.
4. Optionally use the log transform and **Check & suggest stationarity**.
5. Review fit statistics, coefficients, residual tests and ACF/PACF charts.
6. Select **Use Forecasted Demand for EOQ**, verify the cost inputs, and choose
   **Generate PDF report**.

Linear Regression needs at least two observations after differencing; ARIMA
needs at least 12 monthly observations. SARIMA needs at least three seasons
(36 months for season length 12). Higher model orders need more effective history.

## Interpreting results

Forecasts cover the next 12 months. Negative forecasts are capped at zero for
planning. Historical R² does not establish future accuracy. Undefined statistics
are shown as N/A. ARIMA/SARIMA have no intercept or drift and no automatic order
selection. Log forecasts are inverted without a mean-bias correction.

Stationarity checks do not guarantee stationarity. Review missing periods and
model assumptions before using a forecast. PDF export with two or more imported
months needs a current fitted model. Reloading or signing out clears imported
data and calculator results; retain source files and downloaded reports.

[Wiki home](Home.md)
