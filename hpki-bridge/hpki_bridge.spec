# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec file for HPKI Bridge Server

Build commands:
  macOS:   pyinstaller hpki_bridge.spec
  Windows: pyinstaller hpki_bridge.spec
"""

import sys
import platform

block_cipher = None

# Determine platform-specific settings
is_macos = sys.platform == 'darwin'
is_windows = sys.platform == 'win32'

# App name
app_name = 'HPKI Bridge'

a = Analysis(
    ['bridge_server.py'],
    pathex=[],
    binaries=[],
    datas=[],
    hiddenimports=[
        'uvicorn.logging',
        'uvicorn.loops',
        'uvicorn.loops.auto',
        'uvicorn.protocols',
        'uvicorn.protocols.http',
        'uvicorn.protocols.http.auto',
        'uvicorn.protocols.websockets',
        'uvicorn.protocols.websockets.auto',
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
        'uvicorn.lifespan.off',
        'fastapi',
        'pydantic',
        'PyKCS11',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

if is_macos:
    exe = EXE(
        pyz,
        a.scripts,
        a.binaries,
        a.zipfiles,
        a.datas,
        [],
        name='HPKI Bridge',
        debug=False,
        bootloader_ignore_signals=False,
        strip=False,
        upx=True,
        upx_exclude=[],
        runtime_tmpdir=None,
        console=False,
        disable_windowed_traceback=False,
        target_arch=None,
        codesign_identity=None,
        entitlements_file=None,
        icon='icon.icns' if is_macos else None,
    )
    app = BUNDLE(
        exe,
        name='HPKI Bridge.app',
        icon='icon.icns',
        bundle_identifier='jp.totonos.hpki-bridge',
        info_plist={
            'NSHighResolutionCapable': True,
            'LSUIElement': False,
            'CFBundleShortVersionString': '1.0.0',
            'CFBundleVersion': '1.0.0',
        },
    )
else:
    exe = EXE(
        pyz,
        a.scripts,
        a.binaries,
        a.zipfiles,
        a.datas,
        [],
        name='HPKI Bridge',
        debug=False,
        bootloader_ignore_signals=False,
        strip=False,
        upx=True,
        upx_exclude=[],
        runtime_tmpdir=None,
        console=True,  # Show console on Windows for debugging
        disable_windowed_traceback=False,
        target_arch=None,
        codesign_identity=None,
        entitlements_file=None,
        icon='icon.ico' if is_windows else None,
    )
