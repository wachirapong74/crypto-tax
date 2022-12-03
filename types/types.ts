type CryptoName = string;

type CryptoTaxParams = {
  txn: "B" | "S"; // ซื้อ หรือ ขาย
  cryptoName: CryptoName; // ชื่อเหรียญ
  price: number; // ราคาเหรียญ
  amount: number; // จำนวนเหรียญที่ซื้อ/ขาย
};

type GroupMap = { [key: string]: CryptoTaxParams[] };
type TotalProfitAndLossMap = {
  [key: string]: { profit: number; loss: number };
};

export type { CryptoName, CryptoTaxParams, GroupMap, TotalProfitAndLossMap };
