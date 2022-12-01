var purchase = [
  {
    qty: 100,
    price: 200,
    amt: 0,
  },
  {
    qty: 275,
    price: 210,
    amt: 0,
  },
  {
    qty: 300,
    price: 225,
    amt: 0,
  },
  {
    qty: 500,
    price: 275,
    amt: 0,
  },
];
var sells = [
  {
    qty: 600,
    amt: 0,
    purAmt: 0,
    price: 300,
  },
  {
    qty: 275,
    amt: 0,
    purAmt: 0,
    price: 350,
  },
  {
    qty: 300,
    amt: 0,
    purAmt: 0,
    price: 400,
  },
];
purchase.forEach((element, key) => {
  purchase[key]["amt"] = element["qty"] * element["price"];
});

sells.forEach((sell, sell_key) => {
  var purAmount = 0;
  var balance = sell["qty"];
  var usedQty = 0;
  var detail = [];
  purchase.forEach((pur, pur_key) => {
    if (balance != 0) {
      if (pur["qty"] <= balance) {
        purAmount += pur["qty"] * pur["price"];
        detail.push(
          pur["qty"] + "*" + pur["price"] + "=" + pur["qty"] * pur["price"]
        );
        balance -= pur.qty;
        purchase[pur_key]["qty"] = 0;
        delete purchase[pur_key];
      } else {
        if (pur["qty"] > balance) {
          balance -= pur["qty"];
          usedQty = pur["qty"] - Math.abs(balance);
          purchase[pur_key]["qty"] = Math.abs(balance);
          if (balance != 0) {
            purAmount += usedQty * pur["price"];
            detail.push(
              usedQty + "*" + pur["price"] + "=" + usedQty * pur["price"]
            );
          }
          balance = Math.max(0, balance);
          return false;
        }
      }
    }
  });
  sells[sell_key]["details"] = [...detail];
  sells[sell_key]["purAmt"] = purAmount;
  sells[sell_key]["amt"] = sells[sell_key]["qty"] * sells[sell_key]["price"];
  sells[sell_key]["gainLoss"] =
    sells[sell_key]["amt"] - sells[sell_key]["purAmt"];
});
console.log(sells);
console.log(purchase);
