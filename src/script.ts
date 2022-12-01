import { promises as fsPromises, createReadStream } from 'fs';
import * as path from 'path';
import readline from 'readline';
const _pathToFile = 'data/crypto_tax1.txt'

type CryptoTaxParams = {
  txn: "B" | "S"  // ซื้อ หรือ ขาย
  cryptoName: string // ชื่อเหรียญ
  price: number // ราคาเหรียญ
  amount: number // จำนวนเหรียญที่ซื้อ/ขาย
}

type GroupMap = { [key: string]: CryptoTaxParams[] }

async function readFile() {
  try {
    const dirContents = await fsPromises.readdir(__dirname);
    // console.log(dirContents);

    const fileContents = await fsPromises.readFile(
      path.join(__dirname, `../${_pathToFile}`),
      { encoding: 'utf-8' },
    );
    console.log(fileContents);
  } catch (err) {
    console.log('error is: ', err);
  }
}

async function getInputFromFile(path = _pathToFile): Promise<CryptoTaxParams[]> {
  const result: CryptoTaxParams[] = []
  const fileStream = createReadStream(path);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  for await (const line of rl) {
    const splitBySpace = line.split(" ")
    // console.log(`splitBySpace: ${splitBySpace}`);

    result.push({
      txn: splitBySpace[0] as CryptoTaxParams["txn"],
      cryptoName: splitBySpace[1],
      price: parseFloat(splitBySpace[2]),
      amount: parseFloat(splitBySpace[3]),
    })
  }

  return result
}

const cryptoTaxCalculation = (params: CryptoTaxParams[]): number => {
  const totalProfitAndLoss: { [key: string]: { profit: number, loss: number } } = {};

  const groupMap = params.reduce((r: GroupMap, a) => {
    r[a.cryptoName] = r[a.cryptoName] || [];
    r[a.cryptoName].push(a);
    return r;
  }, Object.create({}));

  Object.keys(groupMap).forEach(name => {
    const buyItems = groupMap[name].filter(i => i.txn === "B")
    const sellItems = groupMap[name].filter(i => i.txn === "S")
    // console.log("[1] buyItems", buyItems)
    // console.log("[1] sellItems", sellItems)

    totalProfitAndLoss[name] = totalProfitAndLoss[name] || {
      profit: 0,
      loss: 0
    }

    sellItems.forEach(s => {
      buyItems.forEach(b => {
        const sellBalanceAmount = s.amount - b.amount
        const buyBalanceAmount = b.amount - s.amount
        let multAmount = 0

        // ยังเหลือ
        if(sellBalanceAmount >= 0) {
          multAmount = b.amount
          s.amount = sellBalanceAmount
        } else {
          multAmount = s.amount
          s.amount = 0
        }

        const profitOrLoss = Math.abs(s.price - b.price) * multAmount
        if(s.price >= b.price) {
          totalProfitAndLoss[name].profit += profitOrLoss
        } else {
          totalProfitAndLoss[name].loss += profitOrLoss
        }

        b.amount = buyBalanceAmount <= 0 ? 0 : buyBalanceAmount
      })
    })

    // console.log("========================================")
    // console.log("[2] buyItems", buyItems)
    // console.log("[2] sellItems", sellItems)
  })

  let sumProfit = 0
  let sumLoss = 0

  Object.keys(totalProfitAndLoss).forEach(name => {
    sumProfit += totalProfitAndLoss[name].profit
    sumLoss += totalProfitAndLoss[name].loss
  })

  return sumProfit - sumLoss
}

const param1: CryptoTaxParams[] = [
  {
    txn: "B",
    cryptoName: "BTC",
    price: 100000,
    amount: 2
  },
  {
    txn: "B",
    cryptoName: "BTC",
    price: 200000,
    amount: 3
  },
  {
    txn: "S",
    cryptoName: "BTC",
    price: 180000,
    amount: 3
  },
]

const param2: CryptoTaxParams[] = [
  {
    txn: "B",
    cryptoName: "BTC",
    price: 680000.0,
    amount: 2.5
  },
  {
    txn: "B",
    cryptoName: "ETH",
    price: 43000.0,
    amount: 12.0
  },
  {
    txn: "B",
    cryptoName: "BTC",
    price: 690000.0,
    amount: 2.5
  },
  {
    txn: "S",
    cryptoName: "BTC",
    price: 695000.0,
    amount: 3.0
  },
  {
    txn: "B",
    cryptoName: "ETH",
    price: 43500.0,
    amount: 13.5
  },
  {
    txn: "S",
    cryptoName: "BTC",
    price: 695000.0,
    amount: 1.0
  },
  {
    txn: "S",
    cryptoName: "ETH",
    price: 45000.0,
    amount: 30.0
  },
]

const init = async () => {
  const input = await getInputFromFile()
  console.log("input", input)

  const calcResult = cryptoTaxCalculation(input)
  console.log("calcResult", calcResult)
}

init()


// export {
//   cryptoTaxCalculation
// }