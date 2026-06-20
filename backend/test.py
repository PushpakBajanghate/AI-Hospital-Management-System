from app.core.database import SessionLocal
from app.api.v1.endpoints.auth import login_access_token_json, JsonLoginRequest

db = SessionLocal()
req = JsonLoginRequest(email='testing123@gmail.com', password='password123')
try:
    print(login_access_token_json(db=db, login_data=req))
except Exception as e:
    print(getattr(e, 'status_code', 'No status'), getattr(e, 'detail', str(e)))
