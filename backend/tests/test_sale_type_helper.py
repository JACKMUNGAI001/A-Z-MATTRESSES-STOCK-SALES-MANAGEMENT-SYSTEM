import unittest

from services.sale_service import get_sale_type_label


class SaleTypeLabelTests(unittest.TestCase):
    def test_credit_sales_use_baadaye_label(self):
        self.assertEqual(get_sale_type_label("credit"), "BAADAYE ( SOLD ON CREDIT)")

    def test_standard_sales_use_regular_label(self):
        self.assertEqual(get_sale_type_label("standard"), "Regular Sale")


if __name__ == "__main__":
    unittest.main()
