#!/usr/bin/env python3
"""Adds sample products (and a few PDF documents) through the REST API.

Usage: ADMIN_PASSWORD=... python3 scripts/seed_mock_data.py [API_BASE_URL]   (default http://localhost:8081/api)
Signs in with ADMIN_USERNAME (default admin) / ADMIN_PASSWORD (default: read from .env).
Dates are relative to today so the dashboard shows expiring / active / expired examples.
Products whose name already exists are skipped, so it is safe to re-run.
"""
import http.cookiejar
import json
import os
import sys
import urllib.request
import uuid
from datetime import date, timedelta

API = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8081/api").rstrip("/")
today = date.today()

def env_password():
    if os.environ.get("ADMIN_PASSWORD"):
        return os.environ["ADMIN_PASSWORD"]
    try:
        with open(os.path.join(os.path.dirname(__file__), "..", ".env")) as f:
            for line in f:
                if line.startswith("ADMIN_PASSWORD="):
                    return line.split("=", 1)[1].strip()
    except OSError:
        pass
    return ""


OPENER = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
OPENER.open(urllib.request.Request(
    API + "/auth/login", method="POST", headers={"Content-Type": "application/json"},
    data=json.dumps({"username": os.environ.get("ADMIN_USERNAME", "admin"), "password": env_password()}).encode()), timeout=20)


def call(method, path, body=None):
    req = urllib.request.Request(API + path, method=method, data=json.dumps(body).encode() if body is not None else None,
                                 headers={"Content-Type": "application/json"})
    with OPENER.open(req, timeout=20) as r:
        raw = r.read()
        return json.loads(raw) if raw else None


def upload_pdf(product_id, file_name, doc_type, title):
    pdf = (f"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
           f"3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 120]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n"
           f"4 0 obj<</Length 60>>stream\nBT /F1 14 Tf 20 60 Td ({title}) Tj ET\nendstream endobj\n"
           f"5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n").encode()
    b = uuid.uuid4().hex
    body = (f'--{b}\r\nContent-Disposition: form-data; name="documentType"\r\n\r\n{doc_type}\r\n'
            f'--{b}\r\nContent-Disposition: form-data; name="file"; filename="{file_name}"\r\nContent-Type: application/pdf\r\n\r\n').encode() \
        + pdf + f"\r\n--{b}--\r\n".encode()
    req = urllib.request.Request(f"{API}/products/{product_id}/documents", data=body, method="POST",
                                 headers={"Content-Type": f"multipart/form-data; boundary={b}"})
    OPENER.open(req, timeout=20).read()


def purchased_so_that_expiry_is(days_from_today, years=None, months=None):
    """Purchase date such that purchase + warranty period lands `days_from_today` away."""
    expiry = today + timedelta(days=days_from_today)
    if years:
        return expiry.replace(year=expiry.year - years, day=min(expiry.day, 28))
    m = expiry.year * 12 + expiry.month - 1 - months
    return date(m // 12, m % 12 + 1, min(expiry.day, 28))


# name, brand, model, serial, barcode, category, price, store, notes, (days to expiry, years, months) | None, docs
PRODUCTS = [
    ('Samsung 55" Smart TV', "Samsung", "UA55CU8000", "SN123456789", "8806094948631", "Electronics", 45000, "Reliance Digital",
     "Wall mounted in living room.", (1, 1, None), True),
    ("HP Laptop 15s", "HP", "15s-fq5007TU", "5CD2345XYZ", "195908123456", "Computers", 52999, "Amazon",
     "Work laptop.", (5, 1, None), True),
    ("LG Washing Machine", "LG", "FHM1408BDL", "LG-WM-88231", None, "Home Appliances", 38990, "Croma",
     "Front load, 8 kg.", (-40, 2, None), True),
    ("Apple iPhone 15", "Apple", "MTP43HN/A", "F2LXK9QWQ1", "0194253396000", "Mobile", 79900, "Apple Store",
     "128 GB, Black.", (240, 1, None), True),
    ("Sony WH-1000XM5 Headphones", "Sony", "WH-1000XM5", "S01-7731902", "4548736132580", "Electronics", 29990, "Flipkart",
     None, (160, 1, None), False),
    ("Dell 27\" Monitor", "Dell", "S2722DC", "CN-0W5H2-74261", None, "Computers", 24500, "Dell Exclusive Store",
     "USB-C, QHD.", (520, 3, None), False),
    ("Whirlpool Double Door Fridge", "Whirlpool", "IF INV CNV 278", "WP-FR-5521", None, "Home Appliances", 31490, "Vijay Sales",
     "10 year compressor warranty.", (2900, 10, None), True),
    ("Dyson V8 Vacuum Cleaner", "Dyson", "V8 Absolute", "DY-V8-90817", None, "Home Appliances", 34900, "Dyson Demo Store",
     None, (6, None, 24), False),
    ("IKEA Standing Desk", "IKEA", "BEKANT", None, None, "Furniture", 18999, "IKEA Hyderabad",
     "Oak veneer, 160x80.", (-200, 5, None), False),
    ("Honda Activa 6G", "Honda", "DLX", "MD34E2020N1", None, "Vehicle", 82000, "Honda Showroom",
     "Registration TS09 XX 1234.", (700, 3, None), True),
    ("Nike Running Shoes", "Nike", "Air Zoom Pegasus", None, None, "Fashion", 9995, "Nike Store", "No warranty.", None, False),
]

cats = {c["name"]: c["id"] for c in call("GET", "/categories")}
existing = {p["name"] for p in call("GET", "/products")}
added = 0
for name, brand, model, serial, barcode, cat, price, store, notes, warranty, docs in PRODUCTS:
    if name in existing:
        print(f"skip  {name}")
        continue
    if cat not in cats:
        print(f"skip  {name} (category {cat} missing)")
        continue
    body = {"name": name, "brand": brand, "modelNumber": model, "serialNumber": serial, "barcode": barcode,
            "categoryId": cats[cat], "purchasePrice": price, "storeSeller": store, "notes": notes}
    if warranty:
        days, years, months = warranty
        body["purchaseDate"] = purchased_so_that_expiry_is(days, years, months).isoformat()
        body["warrantyPeriod"] = years or months
        body["warrantyPeriodUnit"] = "YEARS" if years else "MONTHS"
    else:
        body["purchaseDate"] = (today - timedelta(days=90)).isoformat()
    created = call("POST", "/products", {k: v for k, v in body.items() if v is not None})
    if docs:
        upload_pdf(created["id"], "Purchase Bill.pdf", "PURCHASE_BILL", f"Purchase bill - {name}".replace("(", "").replace(")", ""))
        upload_pdf(created["id"], "Warranty Card.pdf", "WARRANTY_CARD", f"Warranty card - {name}".replace("(", "").replace(")", ""))
    print(f"added {name:32} {created['warrantyStatus']:14} expires {created['warrantyExpiryDate']}")
    added += 1
print(f"\nDone: {added} added. Restart the backend (docker compose restart backend) to generate the 'expires tomorrow' notification now.")
