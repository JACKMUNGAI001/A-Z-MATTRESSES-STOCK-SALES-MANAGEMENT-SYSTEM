from flask import request, jsonify
from services.user_service import update_profile, change_password
from flask_jwt_extended import get_jwt_identity

def update_profile_controller():
    user_data = get_jwt_identity()
    user_id = user_data['id']
    data = request.get_json() or {}
    name = data.get("name")
    phone_number = data.get("phone_number")
    
    user = update_profile(user_id, name, phone_number)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    return jsonify({"msg": "Profile updated successfully"}), 200

def change_password_controller():
    user_data = get_jwt_identity()
    user_id = user_data['id']
    data = request.get_json() or {}
    new_password = data.get("new_password")

    if not new_password:
        return jsonify({"msg": "New password is required"}), 400

    user = change_password(user_id, new_password)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    return jsonify({"msg": "Password changed successfully"}), 200
