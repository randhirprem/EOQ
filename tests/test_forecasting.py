"""Run with Python + numpy/scipy/statsmodels 0.14.4; tests the embedded engine."""
import json
import re
import unittest
from pathlib import Path


class ForecastingTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        html = (Path(__file__).resolve().parents[1] / 'index.html').read_text()
        match = re.search(r'<script id="statistics-python" type="text/plain">(.*?)</script>', html, re.S)
        assert match, 'The statistical forecasting engine is not implemented'
        cls.engine = {}
        exec(match.group(1), cls.engine)

    def run_model(self, y, **options):
        config = dict(model='linear', p=1, d=0, q=0, P=0, D=0, Q=0, s=12, log=False)
        config.update(options)
        return self.engine['analyze']({'values': list(y), 'options': config})

    def test_linear_matches_known_trend_and_inference(self):
        r = self.run_model([10 + 2*t + (-1)**t for t in range(36)])
        self.assertEqual(len(r['future']), 12)
        self.assertGreater(r['r2'], .99)
        self.assertLess(r['adjustedR2'], r['r2'])
        self.assertLess(r['modelP'], .001)
        self.assertEqual(r['modelPTest'], 'Slope F-test')
        self.assertEqual(len(r['correlations']), 3)
        json.dumps(r, allow_nan=False)

    def test_second_difference_is_reversed_to_demand_units(self):
        r = self.run_model([10 + t*t for t in range(36)], d=2)
        self.assertAlmostEqual(r['future'][0], 10 + 36**2, places=6)
        self.assertAlmostEqual(r['future'][-1], 10 + 47**2, places=6)
        self.assertEqual(len(r['transformed']), 34)

    def test_random_walk_arima_forecasts_last_observation(self):
        r = self.run_model([100 + t + (-1)**t for t in range(48)], model='arima', p=0, d=1)
        for value in r['future']:
            self.assertAlmostEqual(value, 146, places=5)
        self.assertIsNone(r['modelP'])  # no dynamic coefficients to test

    def test_seasonal_random_walk_repeats_last_season(self):
        y = [100 + 2*t + 20*(t % 12) for t in range(60)]
        r = self.run_model(y, model='sarima', p=0, D=1)
        for actual, expected in zip(r['future'], y[-12:]):
            self.assertAlmostEqual(actual, expected, places=4)

    def test_stationarity_assistant_preserves_input(self):
        y = [100 + t*t + (t % 3) for t in range(60)]
        original = y[:]
        r = self.run_model(y, action='stationarity')
        self.assertEqual(y, original)
        self.assertIn(r['options']['d'], [0, 1, 2])
        self.assertIn('adf', r['stationarity']['after'])

    def test_short_seasonal_history_rejected(self):
        with self.assertRaisesRegex(ValueError, 'season|months'):
            self.run_model(range(12), model='sarima', P=1, D=1)

    def test_constant_and_short_data_do_not_fabricate_statistics(self):
        r = self.run_model([42]*36)
        self.assertIsNone(r['r2'])
        self.assertIsNone(r['modelP'])
        self.assertIsNone(r['stationarity']['before']['adf'])
        for value in r['future']:
            self.assertAlmostEqual(value, 42.0, places=10)
        r = self.run_model([10, 20])
        self.assertIsNone(r['adjustedR2'])
        self.assertIsNone(r['modelP'])

    def test_log_transform_returns_original_scale(self):
        import math
        r = self.run_model([math.expm1(2+.02*t) for t in range(36)], log=True)
        self.assertAlmostEqual(r['future'][0], math.expm1(2+.02*36), places=6)

    def test_arima_recovers_autoregressive_dependence(self):
        import numpy as np
        rng = np.random.default_rng(812)
        increments = [0.0]
        for innovation in rng.normal(size=300):
            increments.append(.65*increments[-1]+innovation)
        y = 1000 + np.cumsum(increments)
        r = self.run_model(y, model='arima', p=1, d=1)
        coefficient = next(c for c in r['coefficients'] if c['name']=='ar.L1')
        self.assertAlmostEqual(coefficient['value'], .65, delta=.15)
        self.assertLess(r['modelP'], .001)
        self.assertGreater(r['correlations'][1]['acf'][0], .4)
        self.assertEqual(r['lbDf'], r['lbLag']-1)

    def test_seasonal_and_second_difference_inverse_composes(self):
        y = [100 + t*t + 20*(t % 12) for t in range(60)]
        r = self.run_model(y, d=2, D=1)
        for i, value in enumerate(r['future'], 60):
            self.assertAlmostEqual(value, 100+i*i+20*(i % 12), places=5)

    def test_invalid_input_is_rejected(self):
        for y in ([1, float('nan')], [1, -2], []):
            with self.assertRaises(ValueError):
                self.run_model(y)


if __name__ == '__main__':
    unittest.main()
