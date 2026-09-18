import MercadoPagoConfig, { Preference, Payment, MerchantOrder } from "mercadopago";
import { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";
import { PaymentSearchResult } from "mercadopago/dist/clients/payment/search/types";
import { MerchantOrderResponse } from "mercadopago/dist/clients/merchantOrder/commonTypes";

const accessToken = process.env.MP_ACCESS_TOKEN!;

export const mpClient = new MercadoPagoConfig({
  accessToken,
  options: { timeout: 8000, idempotencyKey: crypto.randomUUID() },
});

export interface CreatePreferenceInput {
  items: { title: string; quantity: number; unitPrice: number }[];
  externalReference: string;
  buyer: { email: string; name: string };
  backUrls: { success: string; failure: string; pending: string };
  notificationUrl: string;
}

export async function createPreference(input: CreatePreferenceInput) {
  const preference = new Preference(mpClient);
  const result = await preference.create({
    body: {
      items: input.items.map((item, index) => ({
        id: `item-${index + 1}`,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        currency_id: "ARS",
      })),
      external_reference: input.externalReference,
      payer: {
        email: input.buyer.email,
        name: input.buyer.name,
        identification: undefined,
      },
      back_urls: input.backUrls,
      notification_url: input.notificationUrl,
      auto_return: "approved",
      statement_descriptor: "PEÑA FOLK AUSTRAL",
    },
  });
  return result;
}

export async function getPaymentById(paymentId: string): Promise<PaymentResponse> {
  const payment = new Payment(mpClient);
  return payment.get({ id: paymentId });
}

export async function getMerchantOrderById(merchantOrderId: string): Promise<MerchantOrderResponse> {
  const order = new MerchantOrder(mpClient);
  return order.get({ merchantOrderId });
}

export async function searchPaymentsByExternalReference(
  externalRef: string
): Promise<PaymentSearchResult[]> {
  const payment = new Payment(mpClient);
  const result = await payment.search({
    options: {
      external_reference: externalRef,
      sort: "date_created",
      criteria: "desc",
    },
  });
  return result.results ?? [];
}