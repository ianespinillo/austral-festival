import cv2
import os

def generar_qr_nativo(data: str, filepath: str, scale: int = 10, margin: int = 4):
    """
    Genera un QR con OpenCV nativo (sin dependencias adicionales).
    """
    encoder = cv2.QRCodeEncoder.create()
    qr_mat = encoder.encode(data)
    
    qr_con_margen = cv2.copyMakeBorder(
        qr_mat,
        top=margin,
        bottom=margin,
        left=margin,
        right=margin,
        borderType=cv2.BORDER_CONSTANT,
        value=255
    )
    
    h, w = qr_con_margen.shape
    qr_escalado = cv2.resize(
        qr_con_margen,
        (w * scale, h * scale),
        interpolation=cv2.INTER_NEAREST
    )
    
    os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
    cv2.imwrite(filepath, qr_escalado)
    return filepath

if __name__ == "__main__":
    base = os.path.dirname(os.path.abspath(__file__))
    f1 = generar_qr_nativo("PAGO|USR_481|TX_9921|1500", os.path.join(base, "qr_pago.png"))
    f2 = generar_qr_nativo("COMPRA|USR_102|TICKET_884|ENTRADA_PEÑA", os.path.join(base, "qr_compra.png"))
    print(f"[OK] QRs generados:\n - {f1}\n - {f2}")
