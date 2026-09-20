import argparse
import sys
import os
import cv2

# Asegurar importación del paquete
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from camara_qr.detector import DetectorVisionQR
from camara_qr.parser import ParserTransacciones
from camara_qr.generador import generar_qr_nativo

def callback_transaccion(evento):
    d = evento["datos"]
    print(f"\n🔔 [TRANSACCION CONFIRMADA]")
    print(f"   Tipo: {d.get('tipo')}")
    if d.get("monto"):
        print(f"   Monto: ${d.get('monto')}")
    if d.get("id_usuario"):
        print(f"   Usuario: {d.get('id_usuario')}")
    if d.get("id_ticket"):
        print(f"   Ticket: {d.get('id_ticket')}")
    print("-" * 35)

def main():
    parser = argparse.ArgumentParser(description="Camara & QR - Vision Artificial para Pagos y Compras")
    parser.add_argument("--camara", type=int, default=0, help="Indice de la camara (por defecto 0)")
    parser.add_argument("--imagen", type=str, default=None, help="Ruta de una imagen a escanear")
    parser.add_argument("--generar", action="store_true", help="Genera los QRs de prueba de pago y compra")

    args = parser.parse_args()
    base = os.path.dirname(os.path.abspath(__file__))

    if args.generar:
        p1 = generar_qr_nativo("PAGO|USR_481|TX_9921|1500", os.path.join(base, "qr_pago.png"))
        p2 = generar_qr_nativo("COMPRA|USR_102|TICKET_884|ENTRADA_PEÑA", os.path.join(base, "qr_compra.png"))
        print(f"[OK] Archivos de prueba creados en:\n  - {p1}\n  - {p2}")
        return

    detector = DetectorVisionQR()

    if args.imagen:
        if not os.path.exists(args.imagen):
            print(f"[ERROR] Archivo no encontrado: {args.imagen}")
            return
        frame = cv2.imread(args.imagen)
        frame_proc, eventos = detector.procesar_frame(frame)
        print(f"[INFO] Imagen analizada. Detecciones: {len(eventos)}")
        for e in eventos:
            callback_transaccion(e)
        cv2.imshow("Resultado", frame_proc)
        print("Presiona cualquier tecla para cerrar la ventana.")
        cv2.waitKey(0)
        cv2.destroyAllWindows()
    else:
        # Modo en vivo por cámara web
        detector.iniciar_camara(cam_index=args.camara, on_detection=callback_transaccion)

if __name__ == "__main__":
    main()
