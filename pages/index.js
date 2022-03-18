import { useEffect, useState } from "react";

//socket.emit({ name: "v2/ticker", symbols: ["P-SOL-75-190322"] });
function Home() {
  const [list, setList] = useState([]);
  const [symbolList, setSymbolList] = useState([]);
  const [marketPrice, setMarketPrice] = useState({ test: "test" });
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    async function getDeltaExhange() {
      setLoading(true);
      const res = await fetch("https://api.delta.exchange/v2/products");
      const finalRes = await res.json();
      setList(finalRes.result);
      let symList = [];
      finalRes.result.forEach((element) => {
        symList.push(element.symbol);
        marketPrice[element.id] = "N/A";
      });
      setSymbolList(symList);
      setLoading(false);
    }
    getDeltaExhange();
    // eslint-disable-next-line
  }, []);
  useEffect(() => {
    const getmarketPrice = () => {
      const socket = new WebSocket("wss://production-esocket.delta.exchange");
      socket.onopen = () => {
        const msg = {
          type: "subscribe",
          channel: "v2/ticker",
          payload: {
            channels: [
              {
                name: "v2/ticker",
                symbols: symbolList,
              },
            ],
          },
        };
        socket.send(JSON.stringify(msg));
      };
      // receive a message from the server
      socket.onmessage = (event) => {
        const marketPriceDataObj = JSON.parse(event.data);
        if (!!marketPriceDataObj.product_id) {
          let tempObj = { ...marketPrice };
          // tempObj[marketPriceDataObj.product_id] =
          //   "testkjsdfhkjshdfkjsdhfkjdshfkjdshmarfkjh";
          // setMarketPrice(temObj)
          setMarketPrice((prevState) => ({
            ...prevState,
            [marketPriceDataObj.product_id]: marketPriceDataObj.mark_price,
          }));
        }
      };
    };
    symbolList && getmarketPrice();
    // eslint-disable-next-line
  }, [symbolList]);
  return (
    <div className="container">
      <table className="table">
        <thead>
          <tr>
            <th className="col table-info">Symbol</th>
            <th className="col table-info">Description</th>
            <th className="col table-info">Underlying Asset</th>
            <th className="col table-info">market</th>
          </tr>
        </thead>
        <tbody>
          {list.length == 0 ? (
            <div className="text-center loading-indicator">
              <div className="spinner-border" role="status"></div>
            </div>
          ) : (
            list.map((elem, index) => {
              return (
                <tr key={index} className="data-row">
                  <td className="col">{elem.symbol}</td>
                  <td className="col">{elem.description}</td>
                  <td className="col">{elem.underlying_asset.symbol}</td>
                  <td style={{ width: "200px" }}>
                    {marketPrice[elem.id] && marketPrice[elem.id]}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
export default Home;
