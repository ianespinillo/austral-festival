import QRCode from "qrcode";

export async function generateTicketQr(ticketId: string): Promise<Buffer> {
  const qrData = JSON.stringify({ ticketId, type: "folk_festival_ticket" });

  const buffer = await QRCode.toBuffer(qrData, {
    type: "png",
    width: 400,
    margin: 2,
    color: {
      dark: "#1a1a2e",
      light: "#ffffff",
    },
  });

  return buffer;
}

export function generateTicketCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
    if (i === 3) code += "-";
  }
  return code;
}
