"""
MEP Group ERP - Secure Credentials Manager
Protects credentials by reading from environment variables or a local secret file (.erp_secret.json).
Never commit credentials to version control.
"""

import os
import json

SECRET_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".erp_secret.json")

def get_erp_credentials():
    """
    Returns ERP credentials dictionary.
    Priority:
      1. Environment variables (ERP_DB, ERP_CID, ERP_UID, ERP_PASS)
      2. Local secret file (.erp_secret.json)
      3. Fallback defaults
    """
    db = os.environ.get("ERP_DB")
    cid = os.environ.get("ERP_CID")
    uid = os.environ.get("ERP_UID")
    pwd = os.environ.get("ERP_PASS")

    if db and cid and uid and pwd:
        return {
            "db": db,
            "cid": cid,
            "uid": uid,
            "ibssignin": "",
            "pass": pwd,
            "submit": ""
        }

    if os.path.exists(SECRET_FILE):
        try:
            with open(SECRET_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                pwd_val = data.get("pass", "")
                if pwd_val:
                    return {
                        "db": data.get("db", "erpcombd"),
                        "cid": data.get("cid", "MEP"),
                        "uid": data.get("uid", "10676"),
                        "ibssignin": "",
                        "pass": pwd_val,
                        "submit": ""
                    }
        except Exception as e:
            print(f"[!] Warning loading secret config: {e}")

    # If neither env var nor valid secret file has password, raise clear error
    raise RuntimeError(
        "ERP Password is not configured! Please provide ERP_PASS environment variable "
        "or create 'NEW BOT 02/.erp_secret.json' with {\"db\":\"erpcombd\",\"cid\":\"MEP\",\"uid\":\"10676\",\"pass\":\"<password>\"}."
    )

def save_erp_secret(db="erpcombd", cid="MEP", uid="10676", password=""):
    """Saves credentials into the local secret configuration file."""
    data = {
        "db": db,
        "cid": cid,
        "uid": uid,
        "pass": password
    }
    with open(SECRET_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    return True


import time
import requests

_shared_erp_session = None
_shared_erp_login_time = 0
ERP_LOGIN_URL = "https://www.mepgrouperp.com/1027/login/pages/main/index.php"

def get_shared_erp_session(force_refresh=False):
    """
    Returns an active, authenticated ERP requests.Session.
    Reuses existing session if authenticated within the last 20 minutes (1200 seconds).
    Eliminates redundant logins across all 9 bots for maximum collection speed.
    """
    global _shared_erp_session, _shared_erp_login_time
    now = time.time()

    if not force_refresh and _shared_erp_session is not None and (now - _shared_erp_login_time) < 1200:
        return _shared_erp_session

    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    })

    creds = get_erp_credentials()
    res = session.post(ERP_LOGIN_URL, data=creds, timeout=30, allow_redirects=True)
    if "login" in res.url.lower() and "home.php" not in res.url.lower():
        raise Exception("MEP ERP Authentication failed! Please verify credentials in .erp_secret.json.")

    _shared_erp_session = session
    _shared_erp_login_time = now
    return _shared_erp_session
