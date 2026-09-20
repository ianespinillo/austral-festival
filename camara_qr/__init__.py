"""
Módulo camara_qr: Sistema de visión artificial para lectura omnidireccional
de códigos QR (pagos y compras) sin dependencias JSON.
"""

from .detector import DetectorVisionQR
from .parser import ParserTransacciones
from .generador import generar_qr_nativo

__all__ = ["DetectorVisionQR", "ParserTransacciones", "generar_qr_nativo"]
