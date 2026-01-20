"""
HPKI Bridge Server
===================
A FastAPI server that bridges web applications to HPKI (Healthcare PKI) smart cards
via PKCS#11 interface.

This server provides:
- Health check endpoint
- Reader list endpoint
- Electronic signature endpoint using HPKI smart card

Requirements:
- Python 3.8+
- FastAPI
- uvicorn
- PyKCS11
- OpenSC or compatible PKCS#11 driver
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import hashlib
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="HPKI Bridge Server",
    description="Bridge server for HPKI electronic signatures",
    version="1.0.0"
)

# CORS configuration - allow localhost access from React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # Create React App
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# PKCS#11 Library Path Configuration
# Uncomment the appropriate line for your OS and driver

# Windows (OpenSC)
PKCS11_LIB_PATH = r"C:\Program Files\OpenSC Project\OpenSC\pkcs11\opensc-pkcs11.dll"

# macOS (OpenSC)
# PKCS11_LIB_PATH = "/usr/local/lib/opensc-pkcs11.so"

# Linux (OpenSC)
# PKCS11_LIB_PATH = "/usr/lib/x86_64-linux-gnu/opensc-pkcs11.so"

# macOS (Homebrew OpenSC)
# PKCS11_LIB_PATH = "/opt/homebrew/lib/opensc-pkcs11.so"


class SignRequest(BaseModel):
    """Request model for signing operation"""
    text_data: str
    pin: str


class SignResponse(BaseModel):
    """Response model for signing operation"""
    signature_hex: str


class ReaderInfo(BaseModel):
    """Reader information model"""
    name: str
    hasCard: bool
    atr: str | None = None


class ReadersResponse(BaseModel):
    """Response model for readers list"""
    readers: list[ReaderInfo]


# Global PKCS#11 session state
pkcs11_lib = None


def get_pkcs11_lib():
    """Lazy load PKCS#11 library"""
    global pkcs11_lib
    if pkcs11_lib is None:
        try:
            from PyKCS11 import PyKCS11Lib
            pkcs11_lib = PyKCS11Lib()
            pkcs11_lib.load(PKCS11_LIB_PATH)
            logger.info(f"PKCS#11 library loaded: {PKCS11_LIB_PATH}")
        except Exception as e:
            logger.error(f"Failed to load PKCS#11 library: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"PKCS#11 driver not found: {str(e)}"
            )
    return pkcs11_lib


@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    Returns server status.
    """
    return {"status": "ok"}


@app.get("/readers", response_model=ReadersResponse)
async def list_readers():
    """
    List available smart card readers.
    Returns reader names and card insertion status.
    """
    try:
        lib = get_pkcs11_lib()
        slots = lib.getSlotList()

        readers = []
        for slot in slots:
            slot_info = lib.getSlotInfo(slot)
            token_info = None
            has_card = False
            atr = None

            try:
                token_info = lib.getTokenInfo(slot)
                has_card = True
            except:
                pass

            readers.append(ReaderInfo(
                name=slot_info.slotDescription.strip(),
                hasCard=has_card,
                atr=None  # ATR would require lower-level access
            ))

        return ReadersResponse(readers=readers)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing readers: {e}")
        return ReadersResponse(readers=[])


@app.post("/sign", response_model=SignResponse)
async def sign_data(request: SignRequest):
    """
    Sign data using the HPKI smart card.

    Args:
        request: SignRequest containing text_data and PIN

    Returns:
        SignResponse with signature_hex

    Raises:
        400: Invalid PIN
        404: No card inserted
        500: Driver error
    """
    from PyKCS11 import PyKCS11Error, CKA_CLASS, CKO_PRIVATE_KEY, CKA_SIGN, CKM_SHA256_RSA_PKCS

    try:
        lib = get_pkcs11_lib()
        slots = lib.getSlotList()

        if not slots:
            raise HTTPException(
                status_code=404,
                detail="No smart card reader found"
            )

        # Find a slot with a card
        session = None
        for slot in slots:
            try:
                lib.getTokenInfo(slot)  # Check if card is present
                session = lib.openSession(slot)
                break
            except:
                continue

        if session is None:
            raise HTTPException(
                status_code=404,
                detail="No smart card inserted"
            )

        try:
            # Login with PIN
            try:
                session.login(request.pin)
            except PyKCS11Error as e:
                if "PIN" in str(e).upper():
                    raise HTTPException(
                        status_code=400,
                        detail="PIN incorrect"
                    )
                raise

            # Find private key for signing
            private_keys = session.findObjects([
                (CKA_CLASS, CKO_PRIVATE_KEY),
                (CKA_SIGN, True)
            ])

            if not private_keys:
                raise HTTPException(
                    status_code=500,
                    detail="No signing key found on card"
                )

            private_key = private_keys[0]

            # Hash the data (SHA-256)
            data_bytes = request.text_data.encode('utf-8')
            data_hash = hashlib.sha256(data_bytes).digest()

            # Sign with RSA PKCS#1 v1.5
            mechanism = CKM_SHA256_RSA_PKCS
            signature = session.sign(private_key, data_hash, mechanism)

            # Convert signature to hex string
            signature_hex = bytes(signature).hex()

            return SignResponse(signature_hex=signature_hex)

        finally:
            try:
                session.logout()
            except:
                pass
            session.closeSession()

    except HTTPException:
        raise
    except PyKCS11Error as e:
        logger.error(f"PKCS#11 error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Smart card error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error during signing: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Signing failed: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    print("Starting HPKI Bridge Server...")
    print(f"PKCS#11 Library: {PKCS11_LIB_PATH}")
    print("Server will be available at http://localhost:8000")
    print("API docs available at http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
