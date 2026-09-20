import cv2
import numpy as np
import time
from typing import List, Tuple, Dict, Any, Callable, Optional
from .parser import ParserTransacciones

class DetectorVisionQR:
    """
    Detector de visión artificial para códigos QR con escaneo omnidireccional
    (sin cuadro central fijo, detecta en cualquier rincón del encuadre).
    """

    def __init__(self, parser: Optional[ParserTransacciones] = None):
        self.parser = parser or ParserTransacciones()
        self._inicializar_detector_opencv()

    def _inicializar_detector_opencv(self):
        if hasattr(cv2, "QRCodeDetectorAruco"):
            self.detector = cv2.QRCodeDetectorAruco()
            self.tipo_detector = "QRCodeDetectorAruco (Acelerado)"
        else:
            self.detector = cv2.QRCodeDetector()
            self.tipo_detector = "QRCodeDetector (Estandar)"

    def procesar_frame(self, frame: np.ndarray) -> Tuple[np.ndarray, List[Dict[str, Any]]]:
        """
        Escanea el frame completo buscando QRs, dibuja la visualización
        y retorna el frame procesado junto a las transacciones detectadas.
        """
        resultados = []

        if hasattr(self.detector, "detectAndDecodeMulti"):
            encontrado, lista_textos, puntos_multi, _ = self.detector.detectAndDecodeMulti(frame)
        else:
            texto_ind, puntos_ind, _ = self.detector.detectAndDecode(frame)
            if texto_ind:
                encontrado = True
                lista_textos = [texto_ind]
                puntos_multi = np.array([puntos_ind]) if puntos_ind is not None else None
            else:
                encontrado = False
                lista_textos = []
                puntos_multi = None

        if encontrado and puntos_multi is not None and len(puntos_multi) > 0:
            for idx, texto in enumerate(lista_textos):
                if not texto or idx >= len(puntos_multi):
                    continue

                puntos_qr = puntos_multi[idx]
                res_transaccion = self.parser.procesar(texto)
                resultados.append(res_transaccion)

                # Colores según el estado
                if res_transaccion["estado"] == "APROBADO":
                    color = (0, 220, 0) # Verde
                    tipo = res_transaccion["datos"]["tipo"]
                    if res_transaccion["datos"].get("monto"):
                        etiqueta = f"APROBADO: {tipo} ${res_transaccion['datos']['monto']}"
                    else:
                        etiqueta = f"APROBADO: {tipo}"
                elif res_transaccion["estado"] == "EN_COOLDOWN":
                    color = (0, 200, 255) # Amarillo
                    etiqueta = f"EN ESPERA (YA REGISTRADO)"
                else:
                    color = (0, 0, 255) # Rojo
                    etiqueta = "CODIGO NO VALIDO"

                # 1. Dibujar contorno dinámico que sigue al QR
                self._dibujar_contorno_qr(frame, puntos_qr, color)

                # 2. Dibujar etiqueta flotante sobre las coordenadas del QR
                self._dibujar_etiqueta_flotante(frame, puntos_qr, etiqueta, color)

        return frame, resultados

    def _dibujar_contorno_qr(self, frame: np.ndarray, puntos: np.ndarray, color: Tuple[int, int, int], longitud: int = 18):
        pts = puntos.astype(int)
        cv2.polylines(frame, [pts], isClosed=True, color=color, thickness=2)

        for i in range(4):
            p_actual = pts[i]
            p_siguiente = pts[(i + 1) % 4]
            p_anterior = pts[(i - 1) % 4]

            v_sig = (p_siguiente - p_actual).astype(float)
            norm_sig = np.linalg.norm(v_sig)
            if norm_sig > 0:
                dir_sig = (v_sig / norm_sig * min(longitud, norm_sig * 0.4)).astype(int)
                cv2.line(frame, tuple(p_actual), tuple(p_actual + dir_sig), color, 3)

            v_ant = (p_anterior - p_actual).astype(float)
            norm_ant = np.linalg.norm(v_ant)
            if norm_ant > 0:
                dir_ant = (v_ant / norm_ant * min(longitud, norm_ant * 0.4)).astype(int)
                cv2.line(frame, tuple(p_actual), tuple(p_actual + dir_ant), color, 3)

    def _dibujar_etiqueta_flotante(self, frame: np.ndarray, puntos: np.ndarray, texto: str, color_fondo: Tuple[int, int, int]):
        min_x = int(np.min(puntos[:, 0]))
        min_y = int(np.min(puntos[:, 1]))
        pos_y = min_y - 12 if min_y > 40 else int(np.max(puntos[:, 1])) + 28
        pos_x = max(10, min_x)

        (ancho_txt, alto_txt), baseline = cv2.getTextSize(texto, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 2)

        # Fondo
        cv2.rectangle(frame, (pos_x - 6, pos_y - alto_txt - 8), (pos_x + ancho_txt + 6, pos_y + baseline), color_fondo, -1)
        cv2.rectangle(frame, (pos_x - 6, pos_y - alto_txt - 8), (pos_x + ancho_txt + 6, pos_y + baseline), (255, 255, 255), 1)
        # Texto
        cv2.putText(frame, texto, (pos_x, pos_y - 2), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2)

    def iniciar_camara(self, cam_index: int = 0, on_detection: Optional[Callable[[Dict[str, Any]], None]] = None):
        """
        Bucle de ejecución interactivo con cámara web.
        """
        cap = cv2.VideoCapture(cam_index)
        if not cap.isOpened():
            raise RuntimeError(f"No se pudo abrir la cámara con índice {cam_index}")

        print(f"\n[camara_qr] Detector iniciado con: {self.tipo_detector}")
        print(" -> Escaneo activo en TODA la pantalla (sin cuadro fijo).")
        print(" -> Presiona 'q' o 'z' para salir.\n")

        fps_tiempo = time.time()
        fps_contador = 0
        fps_actual = 0

        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                frame = cv2.flip(frame, 1)
                h, w, _ = frame.shape

                fps_contador += 1
                if time.time() - fps_tiempo >= 1.0:
                    fps_actual = fps_contador
                    fps_contador = 0
                    fps_tiempo = time.time()

                frame_procesado, eventos = self.procesar_frame(frame)

                # Callback opcional si se detectó algo aprobado
                for ev in eventos:
                    if ev["estado"] == "APROBADO" and on_detection:
                        on_detection(ev)

                # Barra HUD superior
                cv2.rectangle(frame_procesado, (0, 0), (w, 36), (15, 15, 15), -1)
                qrs_count = len(eventos)
                color_hud = (100, 255, 100) if qrs_count > 0 else (200, 200, 200)
                txt_hud = f"CAMARA & QR ACTIVA | Detecciones: {qrs_count} | FPS: {fps_actual}"
                cv2.putText(frame_procesado, txt_hud, (16, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color_hud, 1)

                cv2.imshow("Camara & QR - Vision Artificial", frame_procesado)

                tecla = cv2.waitKey(1) & 0xFF
                if tecla in [ord('q'), ord('z'), 27]:
                    break
        finally:
            cap.release()
            cv2.destroyAllWindows()
            print("[camara_qr] Cámara finalizada.")
