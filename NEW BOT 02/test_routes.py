import json
from app import app

client = app.test_client()

view_routes = [
    "/",
    "/home",
    "/inter-sales",
    "/bom",
    "/spare-parts",
    "/fan-assemble",
    "/armature-winding",
    "/semi-finished",
    "/fan-store-closing",
    "/finished-goods-movement"
]

print("=== 1. Testing View Routes ===")
for r in view_routes:
    res = client.get(r)
    print(f"{r} -> HTTP {res.status_code} (len: {len(res.data)})")
    assert res.status_code == 200, f"Route {r} failed with {res.status_code}"

api_data_routes = [
    "/api/fan-assemble/data",
    "/api/armature-winding/data",
    "/api/semi-finished/data",
    "/api/fan-store/data",
    "/api/stock-movement/data"
]

print("\n=== 2. Testing Data API Routes ===")
for r in api_data_routes:
    res = client.get(r)
    data = json.loads(res.data.decode("utf-8"))
    print(f"{r} -> HTTP {res.status_code} | status={data.get('status')} | items={len(data.get('items', []))}")
    assert res.status_code == 200
    assert data.get("status") == "success"
    assert len(data.get("items", [])) > 0

api_download_routes = [
    "/api/fan-assemble/download",
    "/api/armature-winding/download",
    "/api/semi-finished/download",
    "/api/fan-store/download",
    "/api/stock-movement/download"
]

print("\n=== 3. Testing Download API Routes ===")
for r in api_download_routes:
    res = client.get(r)
    print(f"{r} -> HTTP {res.status_code} | Content-Type={res.content_type} | bytes={len(res.data)}")
    assert res.status_code == 200
    assert "spreadsheet" in res.content_type or "openxml" in res.content_type
    assert len(res.data) > 5000

print("\nAll basic route assertions PASSED!")
