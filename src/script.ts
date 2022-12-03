import type { CryptoName, CryptoTaxParams } from "../types/types";
import { getInputFromFile } from "./utils";

const cryptoTaxCalculation = (params: CryptoTaxParams[]): number => {
  // console.log("params", params);
  let sumProfit = 0;
  let sumLoss = 0;
  const buyTxnMap = new Map<CryptoName, CryptoTaxParams[]>();
  const sumProfitMap = new Map<CryptoName, number>();
  const sumLossMap = new Map<CryptoName, number>();

  params.forEach((param) => {
    const cryptoName = param.cryptoName;
    switch (param.txn) {
      // เจอ Buy เก็บ list of buy
      case "B": {
        if (buyTxnMap.has(cryptoName)) buyTxnMap.get(cryptoName)?.push(param);
        else buyTxnMap.set(cryptoName, [param]);
        break;
      }
      // เจอ Sell เอาไปตัดใน buy
      case "S": {
        if (buyTxnMap.has(cryptoName)) {
          // console.log("buyTxnMap", buyTxnMap.get(cryptoName));
          const sell = param;

          buyTxnMap.get(cryptoName)?.forEach((buy) => {
            if (buy.amount === 0 || sell.amount === 0) return; // break the loop.

            // เหรียญที่เหลือที่จะขาย
            const coinsToSellLeft = sell.amount - buy.amount;
            // เหรียญที่เหลืออยู่ในมือ
            const coinsOnHand = buy.amount - sell.amount;
            // เหรียญที่ขายได้ในรอบนี้
            let coinsAmount = 0;

            if (coinsToSellLeft >= 0) {
              coinsAmount = buy.amount;
              sell.amount = coinsToSellLeft;
            } else {
              coinsAmount = sell.amount;
              sell.amount = 0; // ขายหมดแล้ว
            }

            const profitOrLoss = Math.abs(sell.price - buy.price) * coinsAmount;

            if (sell.price >= buy.price) {
              sumProfitMap.set(
                cryptoName,
                (sumProfitMap.get(cryptoName) || 0) + profitOrLoss
              );
            } else {
              sumLossMap.set(
                cryptoName,
                (sumLossMap.get(cryptoName) || 0) + profitOrLoss
              );
            }

            if (coinsOnHand <= 0) {
              buy.amount = 0; // เหรียญในมือหมดแล้ว
            } else {
              buy.amount = coinsOnHand;
            }
          });

          // remove buy แถวที่ขายหมดแล้ว
          buyTxnMap.set(
            cryptoName,
            buyTxnMap.get(cryptoName)!!.filter((b) => b.amount > 0)
          );

          // if (cryptoName === "BTC")
          //   console.log("buy", buyTxnMap.get(cryptoName));
        }
        break;
      }
    }
  });

  sumProfitMap.forEach((value) => (sumProfit += value));
  sumLossMap.forEach((value) => (sumLoss += value));

  return sumProfit - sumLoss;
};

const init = async () => {
  const input = await getInputFromFile();
  console.log("input", input);
  const calcResult = cryptoTaxCalculation(input);
  console.log("calcResult", calcResult);
};

init();
