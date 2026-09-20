# Módulo `camara_qr` (Visión Artificial para Pagos y Compras)

Módulo autónomo y reutilizable para la lectura y procesamiento omnidireccional de códigos QR con **OpenCV**, sin librerías de JSON.

---

## 📁 Estructura del Módulo

```text
camara_qr/
├── __init__.py      # Exporta DetectorVisionQR, ParserTransacciones, generar_qr_nativo
├── detector.py      # Pipeline OpenCV (Aruco, pantalla completa, tracking dinámico y HUD)
├── parser.py        # Parseo de pagos/compras sin JSON y control de cooldown/debounce
├── generador.py     # Generador de QRs usando el encoder nativo de OpenCV
├── main.py          # Script ejecutable por línea de comandos (cámara en vivo o imágenes)
├── qr_pago.png      # QR de prueba para pagos
├── qr_compra.png    # QR de prueba para compras/tickets
└── README.md
```

---

## ⚡ ¿Cómo usarlo en lugar del que ya estaba?

### Comparativa: ¿Qué había antes vs. qué ofrece este módulo?

| Característica | Sistema anterior (`jsQR` web) | Este módulo (`camara_qr`) |
| :--- | :--- | :--- |
| **Zona de lectura** | Cuadro fijo estricto en el centro | **100% de la pantalla**, cualquier esquina o distancia |
| **Formato del QR** | Objeto JSON (`JSON.stringify`) | **Texto plano delimitado** (`PAGO\|USR...`), cero librerías JSON |
| **Doble cobro** | Puede re-escanear en bucle | **Cooldown inteligente**: ignora el QR si sigue en pantalla |
| **Feedback visual** | Borde estático transparente | **Bounding box que sigue al QR** con etiqueta flotante verde |
| **Multi-QR** | 1 por vez | Detecta y trackea múltiples QRs simultáneamente |

---

## 🚀 Modos de Uso

### 1. Ejecutar como estación de cobro / Tótem (CLI)
Para abrir la cámara y dejarla escaneando en tiempo real:
```bash
python3 main.py
```
*(Presioná `q` o `z` para salir).*

Para escanear una imagen estática:
```bash
python3 main.py --imagen qr_pago.png
```

Para regenerar códigos de prueba:
```bash
python3 main.py --generar
```

---

### 2. Importarlo en cualquier script de Python
Podés integrar el detector directamente en tu propio código o API:

```python
from camara_qr import DetectorVisionQR, ParserTransacciones

def cuando_se_detecte(evento):
    datos = evento["datos"]
    print(f"Cobrar ${datos['monto']} al usuario {datos['id_usuario']}")
    # Aquí podés hacer una llamada HTTP a tu backend / base de datos

detector = DetectorVisionQR()
detector.iniciar_camara(cam_index=0, on_detection=cuando_se_detecte)
```

---

### 3. ¿Cómo conectarlo con la app web (ej. `austral-festival`)?
Si tenés un tótem físico o laptop en la entrada:
1. En cada detección aprobada en `cuando_se_detecte()`, podés hacer un `requests.post("http://localhost:3000/api/validar", json=datos)` para que el backend valide el ingreso o registre la consumición.
2. Si preferís mantenerlo dentro del navegador web de la app, podés migrar `components/validar/qr-scanner.tsx` a la API nativa de `BarcodeDetector` y quitar el recuadro blanco del centro.
