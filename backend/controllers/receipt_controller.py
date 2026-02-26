from flask import jsonify, Response
from models.receipt import Receipt
from models.deposit import DepositSale, DepositPayment
from services.receipt_service import get_receipt_by_uuid

def get_receipt_controller(uuid):
    r = get_receipt_by_uuid(uuid)
    if not r:
        return jsonify({"msg": "Receipt not found"}), 404
    return Response(r.payload, mimetype='text/html')

def get_deposit_receipts_controller(deposit_id):
    deposit = DepositSale.query.get_or_404(deposit_id)
    # Sort payments by paid_on
    payments = sorted(deposit.payments, key=lambda x: x.paid_on)
    
    def get_ordinal_label(n):
        if 11 <= (n % 100) <= 13:
            suffix = 'TH'
        else:
            suffix = {1: 'ST', 2: 'ND', 3: 'RD'}.get(n % 10, 'TH')
        return f"{n}{suffix} PAYMENT RECEIPT"
    
    all_receipts_html = []
    for idx, payment in enumerate(payments):
        if payment.receipt_uuid:
            receipt = get_receipt_by_uuid(payment.receipt_uuid)
            if receipt:
                label = get_ordinal_label(idx + 1)
                # Add a separator and some spacing between receipts
                all_receipts_html.append(f"""
                    <div class="receipt-wrapper" style="margin-bottom: 50px; border-bottom: 2px dashed #000; padding-bottom: 20px;">
                        <h3 style="text-align: center; color: #333; margin-bottom: 10px; text-decoration: underline;">{label}</h3>
                        {receipt.payload}
                    </div>
                """)
    
    if not all_receipts_html:
        return jsonify({"msg": "No receipts found for this deposit"}), 404

    combined_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>All Receipts for Deposit #{deposit.id}</title>
        <style>
            body {{ font-family: sans-serif; padding: 20px; background-color: #f0f0f0; }}
            .receipt-wrapper {{ background: #fff; max-width: 400px; margin: 0 auto 30px auto; padding: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }}
            @media print {{
                body {{ background: none; padding: 0; }}
                .receipt-wrapper {{ box-shadow: none; margin-bottom: 0; page-break-after: always; border-bottom: 1px solid #ccc; }}
            }}
        </style>
    </head>
    <body>
        <h1 style="text-align: center;">Payment History - Deposit #{deposit.id}</h1>
        <p style="text-align: center;">Buyer: {deposit.buyer_name}</p>
        {"".join(all_receipts_html)}
    </body>
    </html>
    """
    return Response(combined_html, mimetype='text/html')
