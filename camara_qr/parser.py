import time
from typing import Dict, Any

class ParserTransacciones:
    """
    Decodifica y valida payloads de QR estructurados mediante delimitadores
    en texto plano, eliminando por completo la necesidad de librerías JSON.
    """

    def __init__(self, cooldown_segundos: float = 3.5):
        # Memoria temporal de IDs procesados para evitar cobros/lecturas duplicadas
        self._historial_procesados: Dict[str, float] = {}
        self.cooldown_segundos = cooldown_segundos

    def parsear(self, raw_text: str) -> Dict[str, Any]:
        """
        Extrae datos usando split() nativo (microsegundos, cero librerías externas).
        Formatos soportados:
        1. Pagos:   PAGO|ID_USUARIO|ID_TRANSACCION|MONTO
        2. Compras: COMPRA|ID_USUARIO|ID_TICKET|DETALLE
        3. Código directo: TICKET-XXXX-XXXX
        """
        texto = raw_text.strip()
        partes = texto.split("|")

        if len(partes) >= 4:
            tipo = partes[0].upper()
            if tipo == "PAGO":
                return {
                    "ok": True,
                    "tipo": "PAGO",
                    "id_usuario": partes[1],
                    "id_transaccion": partes[2],
                    "monto": partes[3],
                    "raw": texto
                }
            elif tipo == "COMPRA":
                return {
                    "ok": True,
                    "tipo": "COMPRA",
                    "id_usuario": partes[1],
                    "id_ticket": partes[2],
                    "detalle": partes[3],
                    "raw": texto
                }

        # Formato de entrada directa (ej. TICKET-ABCD-1234)
        if texto.startswith("TICKET-") or ("-" in texto and len(texto) == 9):
            return {
                "ok": True,
                "tipo": "ENTRADA_DIRECTA",
                "id_ticket": texto,
                "raw": texto
            }

        return {
            "ok": False,
            "error": f"Formato no reconocido: '{texto}'",
            "raw": texto
        }

    def procesar(self, raw_text: str) -> Dict[str, Any]:
        """
        Valida el código y aplica control de repetición (debounce).
        """
        datos = self.parsear(raw_text)
        if not datos["ok"]:
            return {
                "estado": "ERROR_FORMATO",
                "mensaje": datos["error"],
                "datos": None
            }

        id_unico = datos.get("id_transaccion") or datos.get("id_ticket") or datos.get("raw")
        ahora = time.time()

        if id_unico in self._historial_procesados:
            ultimo = self._historial_procesados[id_unico]
            if ahora - ultimo < self.cooldown_segundos:
                return {
                    "estado": "EN_COOLDOWN",
                    "mensaje": f"Ya registrado: {id_unico} (esperando cooldown)",
                    "datos": datos
                }

        self._historial_procesados[id_unico] = ahora
        return {
            "estado": "APROBADO",
            "mensaje": f"{datos['tipo']} procesado con exito!",
            "datos": datos
        }
