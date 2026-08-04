export interface PaymentVerifyRequest {
  paymentId: string;
  amount: number;
}

export interface DonationInfo {
  paymentId: string;
  amount: number;
  buyerName: string | null;
  paidAt: string;
  timestamp: number;
}

export interface PaymentVerifyResponse {
  success: boolean;
  msg: string;
  reason?: string;
  duplicate?: boolean;
  donation?: DonationInfo;
}
