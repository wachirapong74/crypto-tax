import type { CryptoName, CryptoTaxParams } from "../types/types";
import { getInputFromFile } from "./utils";

const cryptoTaxCalculation = (params: CryptoTaxParams[]): number => {
  let sumProfit = 0;
  let sumLoss = 0;

  // console.log("params", params)
  const txnMap = new Map<CryptoName, CryptoTaxParams[]>();
  const sumProfitMap = new Map<CryptoName, number>();
  const sumLossMap = new Map<CryptoName, number>();

  params.forEach((p) => {
    if (txnMap.has(p.cryptoName)) txnMap.get(p.cryptoName)?.push(p);
    else txnMap.set(p.cryptoName, [p]);
  });

  txnMap.forEach((txnValues, cryptoName) => {
    // console.log("cryptoName", cryptoName, txnValues);
    const sellTxns = txnValues.filter((i) => i.txn === "S");
    const buyTxns = txnValues.filter((i) => i.txn === "B");
    console.log("sellTxns", sellTxns);
    console.log("buyTxns", buyTxns);
    console.log("======================================================");

    sellTxns.forEach((s, sIdx, sArr) => {
      buyTxns.forEach((b, bIdx, bArr) => {
        // เหรียญที่เหลือที่จะขาย
        const coinsToSellLeft = s.amount - b.amount;
        // เหรียญที่เหลืออยู่ในมือ
        const coinsOnHand = b.amount - s.amount;

        // เหรียญที่ขายได้ในรอบนี้
        let coinsAmount = 0;

        if (coinsToSellLeft >= 0) {
          coinsAmount = b.amount;
          s.amount = coinsToSellLeft;
        } else {
          coinsAmount = s.amount;
          // TODO: remove an array item
          s.amount = 0;
          // sArr.splice(sIdx, 1);
        }

        const profitOrLoss = Math.abs(s.price - b.price) * coinsAmount;

        if (s.price >= b.price) {
          // if (!sumProfitMap.has(cryptoName)) sumProfitMap.set(cryptoName, 0);

          sumProfitMap.set(
            cryptoName,
            // sumProfitMap.get(cryptoName)!! + profitOrLoss
            (sumProfitMap.get(cryptoName) || 0) + profitOrLoss
          );
        } else {
          // if (!sumLossMap.has(cryptoName)) sumLossMap.set(cryptoName, 0);

          sumLossMap.set(
            cryptoName,
            // sumLossMap.get(cryptoName)!! + profitOrLoss
            (sumLossMap.get(cryptoName) || 0) + profitOrLoss
          );
        }

        if (coinsOnHand <= 0) {
          b.amount = 0;
          // bArr.splice(bIdx, 1);
          // console.log("test", buyTxns);
        } else {
          b.amount = coinsOnHand;
        }
      });
    });
  });

  // console.log("txnMap", txnMap);

  sumProfitMap.forEach((value) => (sumProfit += value));
  sumLossMap.forEach((value) => (sumLoss += value));
  return sumProfit - sumLoss;
};

const init = async () => {
  const input = await getInputFromFile();
  // console.log("input", input)
  const calcResult = cryptoTaxCalculation(input);
  console.log("calcResult", calcResult);
};

init();
