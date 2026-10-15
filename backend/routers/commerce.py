from fastapi import APIRouter, HTTPException, Depends, Request, UploadFile, File, Form, Query
from fastapi.responses import JSONResponse
from firebase_admin import auth, firestore, storage
from datetime import datetime, timedelta
import logging
import uuid
import os
import re

logger = logging.getLogger(__name__)
router = APIRouter()
db = firestore.client()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

def _now_iso() -> str:
    return datetime.utcnow().isoformat()

def _serialize(doc):
    data = doc.to_dict() or {}
    data["id"] = doc.id
    return data

def _get_uid(current_user: dict) -> str:
    return current_user.get("uid") or current_user.get("uid")

def _generate_order_id() -> str:
    date_str = datetime.utcnow().strftime("%Y%m%d")
    suffix = uuid.uuid4().hex[:6].upper()
    return f"FAM-{date_str}-{suffix}"

# ---------- Seller Profiles ----------

DEFAULT_SELLER_STATUS = "unverified"

@router.get("/seller/profile")
async def get_seller_profile(current_user: dict = Depends(_get_uid)):
    try:
        docs = db.collection("seller_profiles").where("user_id", "==", current_user["uid"]).stream()
        profile = next((_serialize(doc) for doc in docs), None)
        if not profile:
            return {"profile": None}
        return {"profile": profile}
    except Exception as e:
        logger.error(f"Error getting seller profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to load seller profile")

@router.post("/seller/profile")
async def create_seller_profile(request: Request, current_user: dict = Depends(_get_uid)):
    try:
        body = await request.json()
        profile = {
            "user_id": current_user["uid"],
            "business_name": body.get("business_name", "").strip(),
            "business_email": body.get("business_email", "").strip(),
            "website": body.get("website", "").strip(),
            "category": body.get("category", "").strip(),
            "description": body.get("description", "").strip(),
            "address": body.get("address", "").strip(),
            "phone": body.get("phone", "").strip(),
            "return_policy_days": int(body.get("return_policy_days", 7)),
            "shipping_info": body.get("shipping_info", "").strip(),
            "status": "verification_pending",
            "is_verified": False,
            "created_at": _now_iso(),
            "updated_at": _now_iso(),
        }
        doc_ref = db.collection("seller_profiles").add(profile)
        profile["id"] = doc_ref.id
        return {"success": True, "profile": profile}
    except Exception as e:
        logger.error(f"Error creating seller profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to create seller profile")

# ---------- Products ----------

@router.post("/products")
async def create_product(request: Request, current_user: dict = Depends(_get_uid)):
    try:
        body = await request.json()
        product = {
            "seller_id": current_user["uid"],
            "name": body.get("name", "").strip(),
            "description": body.get("description", "").strip(),
            "price_inr": int(body.get("price_inr", 0)),
            "discount_price_inr": body.get("discount_price_inr"),
            "category": body.get("category", "").strip(),
            "images": body.get("images", []),
            "stock": int(body.get("stock", 0)),
            "variants": body.get("variants", []),
            "brand": body.get("brand", "").strip(),
            "return_policy": body.get("return_policy", "").strip(),
            "shipping_info": body.get("shipping_info", "").strip(),
            "delivery_estimate_days": int(body.get("delivery_estimate_days", 7)),
            "status": "active",
            "created_at": _now_iso(),
            "updated_at": _now_iso(),
        }
        if product["price_inr"] <= 0:
            raise HTTPException(status_code=400, detail="Price must be greater than 0")
        if not product["name"]:
            raise HTTPException(status_code=400, detail="Product name is required")
        doc_ref = db.collection("products").add(product)
        product["id"] = doc_ref.id
        return {"success": True, "product": product}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating product: {e}")
        raise HTTPException(status_code=500, detail="Failed to create product")

@router.get("/products/me")
async def get_my_products(current_user: dict = Depends(_get_uid)):
    try:
        products = db.collection("products").where("seller_id", "==", current_user["uid"]).order_by("created_at", direction=firestore.Query.DESCENDING).stream()
        return {"products": [_serialize(doc) for doc in products]}
    except Exception as e:
        logger.error(f"Error getting products: {e}")
        raise HTTPException(status_code=500, detail="Failed to load products")

@router.get("/products/{product_id}")
async def get_product(product_id: str):
    try:
        doc = db.collection("products").document(product_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Product not found")
        product = _serialize(doc)
        seller_doc = db.collection("users").document(product.get("seller_id", "")).get()
        if seller_doc.exists:
            seller_data = seller_doc.to_dict() or {}
            product["seller"] = {
                "id": seller_doc.id,
                "username": seller_data.get("username", ""),
                "displayName": seller_data.get("displayName", ""),
                "photoURL": seller_data.get("photoURL", ""),
            }
        seller_profile_docs = db.collection("seller_profiles").where("user_id", "==", product.get("seller_id", "")).stream()
        seller_profile = next((_serialize(doc) for doc in seller_profile_docs), None)
        product["seller_profile"] = seller_profile
        return {"product": product}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting product: {e}")
        raise HTTPException(status_code=500, detail="Failed to load product")

@router.put("/products/{product_id}")
async def update_product(product_id: str, request: Request, current_user: dict = Depends(_get_uid)):
    try:
        doc_ref = db.collection("products").document(product_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Product not found")
        product = doc.to_dict() or {}
        if product.get("seller_id") != current_user["uid"]:
            raise HTTPException(status_code=403, detail="Not authorized")
        body = await request.json()
        allowed_updates = {
            "name", "description", "price_inr", "discount_price_inr", "category",
            "images", "stock", "variants", "brand", "return_policy",
            "shipping_info", "delivery_estimate_days", "status"
        }
        update_data = {k: v for k, v in body.items() if k in allowed_updates}
        update_data["updated_at"] = _now_iso()
        doc_ref.update(update_data)
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating product: {e}")
        raise HTTPException(status_code=500, detail="Failed to update product")

# ---------- Reel-Product Linking ----------

@router.post("/reels/{reel_id}/product")
async def attach_product_to_reel(reel_id: str, request: Request, current_user: dict = Depends(_get_uid)):
    try:
        body = await request.json()
        product_id = body.get("product_id")
        if not product_id:
            raise HTTPException(status_code=400, detail="product_id is required")
        product_doc = db.collection("products").document(product_id).get()
        if not product_doc.exists:
            raise HTTPException(status_code=404, detail="Product not found")
        product = product_doc.to_dict() or {}
        if product.get("seller_id") != current_user["uid"]:
            raise HTTPException(status_code=403, detail="Not authorized")
        reel_doc = db.collection("reels").document(reel_id).get()
        if not reel_doc.exists:
            raise HTTPException(status_code=404, detail="Reel not found")
        reel_data = reel_doc.to_dict() or {}
        if reel_data.get("user_id") != current_user["uid"]:
            raise HTTPException(status_code=403, detail="Not authorized")
        db.collection("reels").document(reel_id).update({
            "product_id": product_id,
            "updated_at": _now_iso(),
        })
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error attaching product to reel: {e}")
        raise HTTPException(status_code=500, detail="Failed to attach product")

@router.delete("/reels/{reel_id}/product")
async def remove_product_from_reel(reel_id: str, current_user: dict = Depends(_get_uid)):
    try:
        reel_doc = db.collection("reels").document(reel_id).get()
        if not reel_doc.exists:
            raise HTTPException(status_code=404, detail="Reel not found")
        reel_data = reel_doc.to_dict() or {}
        if reel_data.get("user_id") != current_user["uid"]:
            raise HTTPException(status_code=403, detail="Not authorized")
        db.collection("reels").document(reel_id).update({
            "product_id": firestore.DELETE_FIELD,
            "updated_at": _now_iso(),
        })
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing product from reel: {e}")
        raise HTTPException(status_code=500, detail="Failed to remove product")

# ---------- Cart ----------

@router.get("/cart")
async def get_cart(current_user: dict = Depends(_get_uid)):
    try:
        cart_ref = db.collection("carts").where("user_id", "==", current_user["uid"]).limit(1)
        cart_doc = next(cart_ref.stream(), None)
        if not cart_doc:
            return {"cart": {"items": [], "total_inr": 0}}
        cart = _serialize(cart_doc)
        items = cart.get("items", [])
        enriched_items = []
        for item in items:
            product_doc = db.collection("products").document(item.get("product_id", "")).get()
            if product_doc.exists:
                product = product_doc.to_dict() or {}
                enriched_items.append({**item, "product": product})
        return {"cart": {**cart, "items": enriched_items}}
    except Exception as e:
        logger.error(f"Error getting cart: {e}")
        raise HTTPException(status_code=500, detail="Failed to load cart")

@router.post("/cart/items")
async def add_to_cart(request: Request, current_user: dict = Depends(_get_uid)):
    try:
        body = await request.json()
        product_id = body.get("product_id")
        quantity = int(body.get("quantity", 1))
        variant = body.get("variant")
        if not product_id:
            raise HTTPException(status_code=400, detail="product_id is required")
        if quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be greater than 0")
        product_doc = db.collection("products").document(product_id).get()
        if not product_doc.exists:
            raise HTTPException(status_code=404, detail="Product not found")
        product = product_doc.to_dict() or {}
        if product.get("status") != "active":
            raise HTTPException(status_code=400, detail="Product is not available")
        cart_ref = db.collection("carts").where("user_id", "==", current_user["uid"]).limit(1)
        cart_doc = next(cart_ref.stream(), None)
        if cart_doc:
            cart = cart_doc.to_dict() or {}
            items = cart.get("items", [])
            existing = next((i for i in items if i.get("product_id") == product_id and i.get("variant") == variant), None)
            if existing:
                existing["quantity"] = existing.get("quantity", 1) + quantity
            else:
                items.append({
                    "product_id": product_id,
                    "quantity": quantity,
                    "variant": variant,
                    "added_at": _now_iso(),
                })
            db.collection("carts").document(cart_doc.id).update({"items": items, "updated_at": _now_iso()})
        else:
            new_cart = {
                "user_id": current_user["uid"],
                "items": [{
                    "product_id": product_id,
                    "quantity": quantity,
                    "variant": variant,
                    "added_at": _now_iso(),
                }],
                "created_at": _now_iso(),
                "updated_at": _now_iso(),
            }
            db.collection("carts").add(new_cart)
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding to cart: {e}")
        raise HTTPException(status_code=500, detail="Failed to add to cart")

@router.delete("/cart/items/{product_id}")
async def remove_from_cart(product_id: str, current_user: dict = Depends(_get_uid)):
    try:
        cart_ref = db.collection("carts").where("user_id", "==", current_user["uid"]).limit(1)
        cart_doc = next(cart_ref.stream(), None)
        if not cart_doc:
            return {"success": True}
        cart = cart_doc.to_dict() or {}
        items = [i for i in cart.get("items", []) if i.get("product_id") != product_id]
        db.collection("carts").document(cart_doc.id).update({"items": items, "updated_at": _now_iso()})
        return {"success": True}
    except Exception as e:
        logger.error(f"Error removing from cart: {e}")
        raise HTTPException(status_code=500, detail="Failed to remove from cart")

# ---------- Orders ----------

@router.post("/orders")
async def create_order(request: Request, current_user: dict = Depends(_get_uid)):
    try:
        body = await request.json()
        items = body.get("items", [])
        address = body.get("address", {})
        if not items:
            raise HTTPException(status_code=400, detail="Cart is empty")
        total_inr = 0
        order_items = []
        for item in items:
            product_doc = db.collection("products").document(item.get("product_id", "")).get()
            if not product_doc.exists:
                raise HTTPException(status_code=404, detail=f"Product {item.get('product_id')} not found")
            product = product_doc.to_dict() or {}
            if product.get("status") != "active":
                raise HTTPException(status_code=400, detail=f"Product {product.get('name')} is not available")
            quantity = int(item.get("quantity", 1))
            price = product.get("discount_price_inr") or product.get("price_inr", 0)
            line_total = price * quantity
            total_inr += line_total
            order_items.append({
                "product_id": product.get("id", item.get("product_id")),
                "name": product.get("name", ""),
                "price_inr": price,
                "quantity": quantity,
                "variant": item.get("variant"),
                "image_url": (product.get("images") or [""])[0],
            })
        order = {
            "user_id": current_user["uid"],
            "order_id": _generate_order_id(),
            "items": order_items,
            "address": address,
            "subtotal_inr": total_inr,
            "shipping_fee_inr": int(body.get("shipping_fee_inr", 0)),
            "tax_inr": int(body.get("tax_inr", 0)),
            "total_inr": total_inr + int(body.get("shipping_fee_inr", 0)) + int(body.get("tax_inr", 0)),
            "currency": "INR",
            "status": "pending_payment",
            "payment_status": "unpaid",
            "seller_id": order_items[0].get("seller_id") if order_items else None,
            "created_at": _now_iso(),
            "updated_at": _now_iso(),
        }
        doc_ref = db.collection("orders").add(order)
        order["id"] = doc_ref.id
        return {"success": True, "order": order}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating order: {e}")
        raise HTTPException(status_code=500, detail="Failed to create order")

@router.get("/orders/me")
async def get_my_orders(current_user: dict = Depends(_get_uid)):
    try:
        orders = db.collection("orders").where("user_id", "==", current_user["uid"]).order_by("created_at", direction=firestore.Query.DESCENDING).stream()
        return {"orders": [_serialize(doc) for doc in orders]}
    except Exception as e:
        logger.error(f"Error getting orders: {e}")
        raise HTTPException(status_code=500, detail="Failed to load orders")

@router.get("/orders/seller")
async def get_seller_orders(current_user: dict = Depends(_get_uid)):
    try:
        orders = db.collection("orders").where("seller_id", "==", current_user["uid"]).order_by("created_at", direction=firestore.Query.DESCENDING).stream()
        return {"orders": [_serialize(doc) for doc in orders]}
    except Exception as e:
        logger.error(f"Error getting seller orders: {e}")
        raise HTTPException(status_code=500, detail="Failed to load orders")

@router.get("/orders/{order_id}")
async def get_order(order_id: str, current_user: dict = Depends(_get_uid)):
    try:
        orders = db.collection("orders").where("order_id", "==", order_id).stream()
        order_doc = next(orders, None)
        if not order_doc:
            raise HTTPException(status_code=404, detail="Order not found")
        order = _serialize(order_doc)
        if order.get("user_id") != current_user["uid"]:
            raise HTTPException(status_code=403, detail="Not authorized")
        return {"order": order}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting order: {e}")
        raise HTTPException(status_code=500, detail="Failed to load order")

@router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, request: Request, current_user: dict = Depends(_get_uid)):
    try:
        body = await request.json()
        new_status = body.get("status")
        if not new_status:
            raise HTTPException(status_code=400, detail="Status is required")
        allowed_transitions = {
            "pending_payment": ["payment_confirmed", "cancelled"],
            "payment_confirmed": ["order_confirmed", "cancelled"],
            "order_confirmed": ["processing", "cancelled"],
            "processing": ["packed", "cancelled"],
            "packed": ["shipped", "cancelled"],
            "shipped": ["in_transit", "delivered"],
            "in_transit": ["out_for_delivery", "delivered"],
            "out_for_delivery": ["delivered"],
            "delivered": ["return_requested"],
            "return_requested": ["return_approved", "return_rejected"],
            "return_approved": ["return_pickup_scheduled", "refund_initiated"],
            "return_pickup_scheduled": ["returned"],
            "returned": ["refund_initiated"],
            "refund_initiated": ["refunded"],
            "refunded": [],
            "cancelled": [],
            "return_rejected": [],
        }
        orders = db.collection("orders").where("order_id", "==", order_id).stream()
        order_doc = next(orders, None)
        if not order_doc:
            raise HTTPException(status_code=404, detail="Order not found")
        order = order_doc.to_dict() or {}
        current_status = order.get("status", "")
        if new_status not in allowed_transitions.get(current_status, []):
            raise HTTPException(status_code=400, detail=f"Cannot transition from {current_status} to {new_status}")
        if order.get("seller_id") != current_user["uid"]:
            raise HTTPException(status_code=403, detail="Not authorized")
        order_doc.reference.update({"status": new_status, "updated_at": _now_iso()})
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating order status: {e}")
        raise HTTPException(status_code=500, detail="Failed to update order status")

# ---------- Payments ----------

@router.post("/payments/create-order")
async def create_payment_order(request: Request, current_user: dict = Depends(_get_uid)):
    try:
        body = await request.json()
        order_id = body.get("order_id")
        if not order_id:
            raise HTTPException(status_code=400, detail="order_id is required")
        orders = db.collection("orders").where("order_id", "==", order_id).stream()
        order_doc = next(orders, None)
        if not order_doc:
            raise HTTPException(status_code=404, detail="Order not found")
        order = order_doc.to_dict() or {}
        if order.get("user_id") != current_user["uid"]:
            raise HTTPException(status_code=403, detail="Not authorized")
        if order.get("payment_status") == "paid":
            raise HTTPException(status_code=400, detail="Order is already paid")
        amount = int(order.get("total_inr", 0))
        if amount <= 0:
            raise HTTPException(status_code=400, detail="Invalid order amount")
        if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
            try:
                import razorpay
                client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
                rzp_order = client.order.create({
                    "amount": amount * 100,
                    "currency": "INR",
                    "payment_capture": 1,
                    "notes": {"order_id": order_id, "user_id": current_user["uid"]},
                })
                payment = {
                    "order_id": order_id,
                    "user_id": current_user["uid"],
                    "amount_inr": amount,
                    "currency": "INR",
                    "razorpay_order_id": rzp_order.get("id"),
                    "status": "created",
                    "created_at": _now_iso(),
                }
                db.collection("payments").add(payment)
                return {
                    "success": True,
                    "order_id": rzp_order.get("id"),
                    "amount": amount,
                    "currency": "INR",
                    "key_id": RAZORPAY_KEY_ID,
                    "order_ref": order_id,
                }
            except Exception as e:
                logger.error(f"Razorpay order creation failed: {e}")
                raise HTTPException(status_code=500, detail="Payment initialization failed")
        return {
            "success": True,
            "order_id": f"dev_pay_{uuid.uuid4().hex[:12]}",
            "amount": amount,
            "currency": "INR",
            "key_id": "dev_key",
            "order_ref": order_id,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating payment order: {e}")
        raise HTTPException(status_code=500, detail="Failed to create payment order")

@router.post("/payments/verify")
async def verify_payment(request: Request, current_user: dict = Depends(_get_uid)):
    try:
        body = await request.json()
        order_ref = body.get("order_ref")
        razorpay_order_id = body.get("razorpay_order_id")
        razorpay_payment_id = body.get("razorpay_payment_id")
        razorpay_signature = body.get("razorpay_signature")
        if not order_ref:
            raise HTTPException(status_code=400, detail="order_ref is required")
        orders = db.collection("orders").where("order_id", "==", order_ref).stream()
        order_doc = next(orders, None)
        if not order_doc:
            raise HTTPException(status_code=404, detail="Order not found")
        order = order_doc.to_dict() or {}
        if order.get("user_id") != current_user["uid"]:
            raise HTTPException(status_code=403, detail="Not authorized")
        if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET and razorpay_order_id and razorpay_payment_id and razorpay_signature:
            try:
                import razorpay
                client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
                client.utility.verify_payment_signature({
                    "razorpay_order_id": razorpay_order_id,
                    "razorpay_payment_id": razorpay_payment_id,
                    "razorpay_signature": razorpay_signature,
                })
            except Exception as e:
                logger.error(f"Payment verification failed: {e}")
                raise HTTPException(status_code=400, detail="Payment verification failed")
        order_doc.reference.update({
            "payment_status": "paid",
            "status": "payment_confirmed",
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "paid_at": _now_iso(),
            "updated_at": _now_iso(),
        })
        db.collection("payments").add({
            "order_id": order_ref,
            "user_id": current_user["uid"],
            "amount_inr": order.get("total_inr", 0),
            "currency": "INR",
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "status": "paid",
            "created_at": _now_iso(),
        })
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying payment: {e}")
        raise HTTPException(status_code=500, detail="Failed to verify payment")

# ---------- Returns / Refunds ----------

@router.post("/returns")
async def create_return(request: Request, current_user: dict = Depends(_get_uid)):
    try:
        body = await request.json()
        order_id = body.get("order_id")
        reason = body.get("reason", "").strip()
        evidence_urls = body.get("evidence_urls", [])
        if not order_id or not reason:
            raise HTTPException(status_code=400, detail="order_id and reason are required")
        orders = db.collection("orders").where("order_id", "==", order_id).stream()
        order_doc = next(orders, None)
        if not order_doc:
            raise HTTPException(status_code=404, detail="Order not found")
        order = order_doc.to_dict() or {}
        if order.get("user_id") != current_user["uid"]:
            raise HTTPException(status_code=403, detail="Not authorized")
        return_request = {
            "order_id": order_id,
            "user_id": current_user["uid"],
            "reason": reason,
            "evidence_urls": evidence_urls,
            "status": "requested",
            "created_at": _now_iso(),
            "updated_at": _now_iso(),
        }
        db.collection("returns").add(return_request)
        order_doc.reference.update({"status": "return_requested", "updated_at": _now_iso()})
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating return: {e}")
        raise HTTPException(status_code=500, detail="Failed to create return")

@router.get("/returns/me")
async def get_my_returns(current_user: dict = Depends(_get_uid)):
    try:
        returns = db.collection("returns").where("user_id", "==", current_user["uid"]).order_by("created_at", direction=firestore.Query.DESCENDING).stream()
        return {"returns": [_serialize(doc) for doc in returns]}
    except Exception as e:
        logger.error(f"Error getting returns: {e}")
        raise HTTPException(status_code=500, detail="Failed to load returns")

# ---------- Admin Commerce ----------

@router.get("/admin/orders")
async def admin_get_orders(current_user: dict = Depends(_get_uid)):
    try:
        orders = db.collection("orders").order_by("created_at", direction=firestore.Query.DESCENDING).stream()
        return {"orders": [_serialize(doc) for doc in orders]}
    except Exception as e:
        logger.error(f"Error getting admin orders: {e}")
        raise HTTPException(status_code=500, detail="Failed to load orders")

@router.get("/admin/products")
async def admin_get_products(current_user: dict = Depends(_get_uid)):
    try:
        products = db.collection("products").order_by("created_at", direction=firestore.Query.DESCENDING).stream()
        return {"products": [_serialize(doc) for doc in products]}
    except Exception as e:
        logger.error(f"Error getting admin products: {e}")
        raise HTTPException(status_code=500, detail="Failed to load products")

@router.put("/admin/products/{product_id}/status")
async def admin_update_product_status(product_id: str, request: Request, current_user: dict = Depends(_get_uid)):
    try:
        body = await request.json()
        status = body.get("status")
        if status not in {"active", "archived", "restricted"}:
            raise HTTPException(status_code=400, detail="Invalid status")
        doc_ref = db.collection("products").document(product_id)
        doc_ref.update({"status": status, "updated_at": _now_iso()})
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating product status: {e}")
        raise HTTPException(status_code=500, detail="Failed to update product")

@router.get("/admin/returns")
async def admin_get_returns(current_user: dict = Depends(_get_uid)):
    try:
        returns = db.collection("returns").order_by("created_at", direction=firestore.Query.DESCENDING).stream()
        return {"returns": [_serialize(doc) for doc in returns]}
    except Exception as e:
        logger.error(f"Error getting returns: {e}")
        raise HTTPException(status_code=500, detail="Failed to load returns")
