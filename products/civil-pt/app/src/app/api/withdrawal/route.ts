import { handleWithdrawal } from "@/lib/withdrawal/handler";

export function POST(request: Request) {
  return handleWithdrawal(request);
}
