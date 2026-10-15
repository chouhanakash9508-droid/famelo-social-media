from fastapi import APIRouter, HTTPException, Depends, Request, UploadFile, File, Form
from fastapi.responses import JSONResponse
from firebase_admin import auth, firestore, storage
from datetime import datetime, timedelta
import logging
import uuid
import os

logger = logging.getLogger(__name__)
router = APIRouter()
db = firestore.client()

# In production, load these from environment variables
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

# ---------- Helpers ----------

def _now_iso() -> str:
    return datetime.utcnow().isoformat()

def _serialize(doc):
    data = doc.to_dict() or {}
    data["id"] = doc.id
    return data

def _get_uid(current_user: dict) -> str:
    return current_user.get("uid") or current_user.get("uid")

# ---------- Packages ----------

DEFAULT_PACKAGES = [
    {
        "id": "starter",
        "name": "Starter",
        "price_inr": 499,
        "duration_days": 3,
        "max_impressions": 5000,
        "max_creatives": 1,
        "targeting": "basic",
        "analytics": "basic",
        "features": ["Basic analytics", "1 advertisement", "Basic targeting"],
        "active": True,
    },
    {
        "id": "growth",
        "name": "Growth",
        "price_inr": 999,
        "duration_days": 7,
        "max_impressions": 15000,
        "max_creatives": 2,
        "targeting": "audience",
        "analytics": "basic",
        "features": ["Basic analytics", "2 advertisements", "Audience targeting", "Optimization suggestions"],
        "active": True,
    },
    {
        "id": "business",
        "name": "Business",
        "price_inr": 2499,
        "duration_days": 14,
        "max_impressions": 50000,
        "max_creatives": 5,
        "targeting": "advanced",
        "analytics": "detailed",
        "features": ["Detailed analytics", "5 advertisements", "Advanced targeting", "Priority review"],
        "active": True,
    },
    {
        "id": "premium",
        "name": "Premium Campaign",
        "price_inr": 4999,
        "duration_days": 30,
        "max_impressions": 120000,
        "max_creatives": 10,
        "targeting": "advanced",
        "analytics": "detailed",
        "features": ["Detailed analytics", "10 advertisements", "Advanced targeting", "Priority review", "Featured placement"],
        "active": True,
    },
]


@router.get("/ads/packages")
async def get_ad_packages():
    try:
        packages_ref = db.collection("ad_packages")
        docs = packages_ref.stream()
        packages = []
        for doc in docs:
            packages.append(_serialize(doc))
        if not packages:
            for pkg in DEFAULT_PACKAGES:
                db.collection("ad_packages").document(pkg["id"]).set(pkg)
            packages = DEFAULT_PACKAGES
        return {"packages": packages}
    except Exception as e:
        logger.error(f"Error getting ad packages: {e}")
        raise HTTPException(status_code=500, detail="Failed to load packages")


@router.put("/ads/packages/{package_id}")
async def update_ad_package(package_id: str, request: Request, current_user: dict = Depends(_get_uid)):
    try:
        body = await request.json()
        doc_ref = db.collection("ad_packages").document(package_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Package not found")
        doc_ref.update(body)
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating ad package: {e}")
        raise HTTPException(status_code=500, detail="Failed to update package")


# ---------- Businesses ----------

@router.post("/businesses")
async def create_business(request: Request, current_user: dict = Depends(_get_uid)):
    try:
        body = await request.json()
        business = {
            "user_id": current_user["uid"],
            "business_name": body.get("business_name", "").strip(),
            "business_email": body.get("business_email", "").strip(),
            "website": body.get("website", "").strip(),
            "category": body.get("category", "").strip(),
            "description": body.get("description", "").strip(),
            "address": body.get("address", "").strip(),
            "phone": body.get("phone", "").strip(),
            "is_verified": False,
            "status": "active",
            "created_at": _now_iso(),
            "updated_at": _now_iso(),
        }
        doc_ref = db.collection("businesses").add(business)
        business["id"] = doc_ref.id
        return {"success": True, "business": business}
    except Exception as e:
        logger.error(f"Error creating business: {e}")
        raise HTTPException(status_code=500, detail="Failed to create business profile")


@router.get("/businesses/me")
async def get_my_business(current_user: dict = Depends(_get_uid)):
    try:
        businesses = db.collection("businesses").where("user_id", "==", current_user["uid"]).stream()
        business = next((_serialize(doc) for doc in businesses), None)
        if not business:
            return {"business": None}
        return {"business": business}
    except Exception as e:
        logger.error(f"Error getting business: {e}")
        raise HTTPException(status_code=500, detail="Failed to load business")


# ---------- Campaigns ----------

@router.post("/campaigns")
async def create_campaign(request: Request, current_user: dict = Depends(_get_uid)):
    try:
        body = await request.json()
        package_id = body.get("package_id")
        if not package_id:
            raise HTTPException(status_code=400, detail="package_id is required")

        pkg_doc = db.collection("ad_packages").document(package_id).get()
        if not pkg_doc.exists:
            raise HTTPException(status_code=404, detail="Package not found")
        pkg = pkg_doc.to_dict() or {}

        business_q = db.collection("businesses").where("user_id", "==", current_user["uid"]).stream()
        business = next((_serialize(doc) for doc in business_q), None)
        if not business:
            raise HTTPException(status_code=400, detail="Create a business profile first")

        campaign = {
            "user_id": current_user["uid"],
            "business_id": business["id"],
            "business_name": business.get("business_name", ""),
            "package_id": package_id,
            "name": body.get("name", "").strip(),
            "title": body.get("title", "").strip(),
            "description": body.get("description", "").strip(),
            "image_url": body.get("image_url", "").strip(),
            "cta_text": body.get("cta_text", "Learn More").strip(),
            "destination_url": body.get("destination_url", "").strip(),
            "target_audience": body.get("target_audience", "general").strip(),
            "interest_category": body.get("interest_category", "other").strip(),
            "location": body.get("location", "").strip(),
            "status": "draft",
            "payment_status": "unpaid",
            "price_inr": pkg.get("price_inr", 0),
            "duration_days": pkg.get("duration_days", 7),
            "max_impressions": pkg.get("max_impressions", 15000),
            "max_creatives": pkg.get("max_creatives", 2),
            "impressions": 0,
            "clicks": 0,
            "start_date": body.get("start_date", "").strip(),
            "end_date": body.get("end_date", "").strip(),
            "created_at": _now_iso(),
            "updated_at": _now_iso(),
        }
        doc_ref = db.collection("campaigns").add(campaign)
        campaign["id"] = doc_ref.id
        return {"success": True, "campaign": campaign}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating campaign: {e}")
        raise HTTPException(status_code=500, detail="Failed to create campaign")


@router.get("/campaigns/me")
async def get_my_campaigns(current_user: dict = Depends(_get_uid)):
    try:
        campaigns = db.collection("campaigns").where("user_id", "==", current_user["uid"]).order_by("created_at", direction=firestore.Query.DESCENDING).stream()
        return {"campaigns": [_serialize(doc) for doc in campaigns]}
    except Exception as e:
        logger.error(f"Error getting campaigns: {e}")
        raise HTTPException(status_code=500, detail="Failed to load campaigns")


@router.get("/campaigns/{campaign_id}")
async def get_campaign(campaign_id: str, current_user: dict = Depends(_get_uid)):
    try:
        doc = db.collection("campaigns").document(campaign_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Campaign not found")
        campaign = _serialize(doc)
        if campaign.get("user_id") != current_user["uid"]:
            raise HTTPException(status_code=403, detail="Not authorized")
        return {"campaign": campaign}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting campaign: {e}")
        raise HTTPException(status_code=500, detail="Failed to load campaign")


@router.post("/campaigns/{campaign_id}/submit")
async def submit_campaign(campaign_id: str, current_user: dict = Depends(_get_uid)):
    try:
        doc_ref = db.collection("campaigns").document(campaign_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Campaign not found")
        campaign = doc.to_dict() or {}
        if campaign.get("user_id") != current_user["uid"]:
            raise HTTPException(status_code=403, detail="Not authorized")
        if campaign.get("payment_status") != "paid":
            raise HTTPException(status_code=400, detail="Payment is required before submission")
        doc_ref.update({"status": "pending_review", "updated_at": _now_iso()})
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting campaign: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit campaign")


@router.put("/admin/campaigns/{campaign_id}/status")
async def update_campaign_status(campaign_id: str, request: Request, current_user: dict = Depends(_get_uid)):
    try:
        body = await request.json()
        new_status = body.get("status")
        if new_status not in {"active", "paused", "rejected", "completed"}:
            raise HTTPException(status_code=400, detail="Invalid status")
        doc_ref = db.collection("campaigns").document(campaign_id)
        doc_ref.update({"status": new_status, "updated_at": _now_iso()})
        if new_status == "active":
            doc_ref.update({"start_date": _now_iso()})
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating campaign status: {e}")
        raise HTTPException(status_code=500, detail="Failed to update status")


# ---------- Payments ----------

@router.post("/payments/create-order")
async def create_payment_order(request: Request, current_user: dict = Depends(_get_uid)):
    try:
        body = await request.json()
        campaign_id = body.get("campaign_id")
        if not campaign_id:
            raise HTTPException(status_code=400, detail="campaign_id is required")

        doc = db.collection("campaigns").document(campaign_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Campaign not found")
        campaign = doc.to_dict() or {}
        if campaign.get("user_id") != current_user["uid"]:
            raise HTTPException(status_code=403, detail="Not authorized")

        amount = int(campaign.get("price_inr", 0))
        if amount <= 0:
            raise HTTPException(status_code=400, detail="Invalid campaign price")

        # If Razorpay keys are configured, create a real order.
        # Otherwise, return a simulated order for development/testing.
        if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
            try:
                import razorpay
                client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
                order = client.order.create({
                    "amount": amount * 100,
                    "currency": "INR",
                    "payment_capture": 1,
                    "notes": {"campaign_id": campaign_id, "user_id": current_user["uid"]},
                })
                return {
                    "success": True,
                    "order_id": order.get("id"),
                    "amount": amount,
                    "currency": "INR",
                    "key_id": RAZORPAY_KEY_ID,
                }
            except Exception as e:
                logger.error(f"Razorpay order creation failed: {e}")
                raise HTTPException(status_code=500, detail="Payment initialization failed")

        # Simulated order
        return {
            "success": True,
            "order_id": f"dev_order_{uuid.uuid4().hex[:12]}",
            "amount": amount,
            "currency": "INR",
            "key_id": "dev_key",
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
        campaign_id = body.get("campaign_id")
        razorpay_order_id = body.get("razorpay_order_id")
        razorpay_payment_id = body.get("razorpay_payment_id")
        razorpay_signature = body.get("razorpay_signature")

        if not campaign_id:
            raise HTTPException(status_code=400, detail="campaign_id is required")

        doc_ref = db.collection("campaigns").document(campaign_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Campaign not found")
        campaign = doc.to_dict() or {}
        if campaign.get("user_id") != current_user["uid"]:
            raise HTTPException(status_code=403, detail="Not authorized")

        # If Razorpay is configured, verify signature server-side.
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

        # In dev mode without Razorpay, accept payment without signature check.
        doc_ref.update({
            "payment_status": "paid",
            "status": "pending_review",
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "paid_at": _now_iso(),
            "updated_at": _now_iso(),
        })
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying payment: {e}")
        raise HTTPException(status_code=500, detail="Failed to verify payment")


# ---------- Ads Feed & Events ----------

@router.get("/ads/feed")
async def get_ads_feed(current_user: dict = Depends(_get_uid)):
    try:
        now = datetime.utcnow().isoformat()
        campaigns = db.collection("campaigns").where("status", "==", "active").where("payment_status", "==", "paid").stream()
        ads = []
        for doc in campaigns:
            campaign = _serialize(doc)
            # Simple targeting fallback: serve to all users unless audience is set.
            ads.append({
                "id": campaign["id"],
                "campaign_id": campaign["id"],
                "title": campaign.get("title", ""),
                "description": campaign.get("description", ""),
                "image_url": campaign.get("image_url", ""),
                "cta_text": campaign.get("cta_text", "Learn More"),
                "destination_url": campaign.get("destination_url", ""),
                "business_name": campaign.get("business_name", ""),
                "interest_category": campaign.get("interest_category", "general"),
                "target_audience": campaign.get("target_audience", "general"),
                "is_sponsored": True,
            })
        return {"ads": ads}
    except Exception as e:
        logger.error(f"Error getting ads feed: {e}")
        raise HTTPException(status_code=500, detail="Failed to load ads")


@router.post("/ads/{ad_id}/click")
async def track_ad_click(ad_id: str, current_user: dict = Depends(_get_uid)):
    try:
        doc_ref = db.collection("campaigns").document(ad_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Ad not found")

        # Record event
        event = {
            "campaign_id": ad_id,
            "user_id": current_user["uid"],
            "event_type": "click",
            "created_at": _now_iso(),
        }
        db.collection("ad_events").add(event)

        # Increment click count
        doc_ref.update({"clicks": firestore.Increment(1)})

        campaign = doc.to_dict() or {}
        return {"success": True, "destination_url": campaign.get("destination_url", "")}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error tracking ad click: {e}")
        raise HTTPException(status_code=500, detail="Failed to track click")
