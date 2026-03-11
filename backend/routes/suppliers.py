from flask import Blueprint
from controllers.supplier_controller import (
    list_suppliers_controller, create_supplier_controller, update_supplier_controller, delete_supplier_controller,
    list_invoices_controller, create_invoice_controller, get_invoice_controller, 
    delete_invoice_controller,
    update_invoice_status_controller,
    record_invoice_payment_controller, list_supplier_products_controller
)
from flask_jwt_extended import jwt_required

suppliers_bp = Blueprint("suppliers", __name__)

@suppliers_bp.route("/", methods=["GET"])
@jwt_required()
def list_suppliers():
    return list_suppliers_controller()

@suppliers_bp.route("/", methods=["POST"])
@jwt_required()
def create_supplier():
    return create_supplier_controller()

@suppliers_bp.route("/<int:supplier_id>", methods=["PUT"])
@jwt_required()
def update_supplier(supplier_id):
    return update_supplier_controller(supplier_id)

@suppliers_bp.route("/<int:supplier_id>", methods=["DELETE"])
@jwt_required()
def delete_supplier(supplier_id):
    return delete_supplier_controller(supplier_id)

@suppliers_bp.route("/invoices", methods=["GET"])
@jwt_required()
def list_invoices():
    return list_invoices_controller()

@suppliers_bp.route("/invoices", methods=["POST"])
@jwt_required()
def create_invoice():
    return create_invoice_controller()

@suppliers_bp.route("/invoices/<int:invoice_id>", methods=["GET"])
@jwt_required()
def get_invoice(invoice_id):
    return get_invoice_controller(invoice_id)

@suppliers_bp.route("/invoices/<int:invoice_id>", methods=["DELETE"])
@jwt_required()
def delete_invoice(invoice_id):
    return delete_invoice_controller(invoice_id)

@suppliers_bp.route("/invoices/<int:invoice_id>/status", methods=["PUT"])
@jwt_required()
def update_status(invoice_id):
    return update_invoice_status_controller(invoice_id)

@suppliers_bp.route("/invoices/<int:invoice_id>/payments", methods=["POST"])
@jwt_required()
def record_payment(invoice_id):
    return record_invoice_payment_controller(invoice_id)

@suppliers_bp.route("/<int:supplier_id>/products", methods=["GET"])
@jwt_required()
def list_supplier_products(supplier_id):
    return list_supplier_products_controller(supplier_id)
