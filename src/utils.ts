import { promises as fsPromises, createReadStream } from "fs";
import * as path from "path";
import readline from "readline";
import type { CryptoTaxParams } from "../types/types";
const _pathToFile = "data/crypto_tax1.txt";

async function readFile() {
  try {
    const dirContents = await fsPromises.readdir(__dirname);
    // console.log(dirContents);

    const fileContents = await fsPromises.readFile(
      path.join(__dirname, `../${_pathToFile}`),
      { encoding: "utf-8" }
    );
    console.log(fileContents);
  } catch (err) {
    console.log("error is: ", err);
  }
}

async function getInputFromFile(
  path = _pathToFile
): Promise<CryptoTaxParams[]> {
  const result: CryptoTaxParams[] = [];
  const fileStream = createReadStream(path);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  for await (const line of rl) {
    const splitBySpace = line.split(" ");
    // console.log(`splitBySpace: ${splitBySpace}`);

    result.push({
      txn: splitBySpace[0] as CryptoTaxParams["txn"],
      cryptoName: splitBySpace[1],
      price: parseFloat(splitBySpace[2]),
      amount: parseFloat(splitBySpace[3]),
    });
  }

  return result;
}

export { getInputFromFile };
