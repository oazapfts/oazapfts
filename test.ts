import { operationsGetTransactions } from "api-t";

const init = async () => {
  const r = await operationsGetTransactions({
    anyof: {
      eq: "sender",
      null: false,
    },
  });

  console.log("kek", r);
};

init();
