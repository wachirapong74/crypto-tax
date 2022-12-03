import type {
  CryptoTaxParams,
  GroupMap,
  TotalProfitAndLossMap,
} from "../types/types";
import { getInputFromFile } from "./utils";

const cryptoTaxCalculation = (params: CryptoTaxParams[]): number => {
  const totalProfitAndLoss: TotalProfitAndLossMap = {};

  // Grouping by crypto name
  const groupMap = params.reduce((r: GroupMap, a) => {
    r[a.cryptoName] = r[a.cryptoName] || [];
    r[a.cryptoName].push(a);
    return r;
  }, Object.create({}));

  Object.keys(groupMap).forEach((name) => {
    const buyItems = groupMap[name].filter((i) => i.txn === "B");
    const sellItems = groupMap[name].filter((i) => i.txn === "S");

    // console.log("[1] buyItems", buyItems)
    // console.log("[1] sellItems", sellItems)

    totalProfitAndLoss[name] = totalProfitAndLoss[name] || {
      profit: 0,
      loss: 0,
    };

    // O (n^2)
    // Improve: Hash Map
    // key ชื่อเหรียญ, value list

    // const sellMap = new Map();
    // sellMap.set(name, buyItems)
    // console.log("sellMap", sellMap.entries())
    // ใช้ Map เก็บเจอ buy เก็บ buy เจอ sell เอามาตัด
    sellItems.forEach((s) => {
      buyItems.forEach((b) => {
        const sellBalanceAmount = s.amount - b.amount;
        const buyBalanceAmount = b.amount - s.amount;
        let multAmount = 0;

        // ยังเหลือ
        if (sellBalanceAmount >= 0) {
          multAmount = b.amount;
          s.amount = sellBalanceAmount;
        } else {
          multAmount = s.amount;
          s.amount = 0;
        }

        const profitOrLoss = Math.abs(s.price - b.price) * multAmount;

        if (s.price >= b.price) {
          totalProfitAndLoss[name].profit += profitOrLoss;
          // console.log("profit", profitOrLoss)
        } else {
          totalProfitAndLoss[name].loss += profitOrLoss;
          // console.log("loss", profitOrLoss)
        }

        b.amount = buyBalanceAmount <= 0 ? 0 : buyBalanceAmount;
      });
    });

    // console.log("========================================")
    // console.log("[2] buyItems", buyItems)
    // console.log("[2] sellItems", sellItems)
  });

  let sumProfit = 0;
  let sumLoss = 0;

  Object.keys(totalProfitAndLoss).forEach((name) => {
    sumProfit += totalProfitAndLoss[name].profit;
    sumLoss += totalProfitAndLoss[name].loss;
  });

  return sumProfit - sumLoss;
};

const param1: CryptoTaxParams[] = [
  {
    txn: "B",
    cryptoName: "BTC",
    price: 100000,
    amount: 2,
  },
  {
    txn: "B",
    cryptoName: "BTC",
    price: 200000,
    amount: 3,
  },
  {
    txn: "S",
    cryptoName: "BTC",
    price: 180000,
    amount: 3,
  },
];

const param2: CryptoTaxParams[] = [
  {
    txn: "B",
    cryptoName: "BTC",
    price: 680000.0,
    amount: 2.5,
  },
  {
    txn: "B",
    cryptoName: "ETH",
    price: 43000.0,
    amount: 12.0,
  },
  {
    txn: "B",
    cryptoName: "BTC",
    price: 690000.0,
    amount: 2.5,
  },
  {
    txn: "S",
    cryptoName: "BTC",
    price: 695000.0,
    amount: 3.0,
  },
  {
    txn: "B",
    cryptoName: "ETH",
    price: 43500.0,
    amount: 13.5,
  },
  {
    txn: "S",
    cryptoName: "BTC",
    price: 695000.0,
    amount: 1.0,
  },
  {
    txn: "S",
    cryptoName: "ETH",
    price: 45000.0,
    amount: 30.0,
  },
];

const init = async () => {
  const input = await getInputFromFile();
  // console.log("input", input)

  const calcResult = cryptoTaxCalculation(input);
  console.log("calcResult", calcResult);
};

init();

// export {
//   cryptoTaxCalculation
// }
