/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/alt-text */
import {
  Box,
  useMediaQuery,
  Select,
  MenuItem,
  InputLabel,
  Checkbox,
} from "@mui/material";
import styled from "styled-components";
import { useState, useRef, useEffect } from "react";
import PivotTableUI from "react-pivottable/PivotTableUI";
import "react-pivottable/pivottable.css";
import TableRenderers from "react-pivottable/TableRenderers";
import Plot from "react-plotly.js";
import createPlotlyRenderers from "react-pivottable/PlotlyRenderers";
import {
  tokenTxQuery,
  txCountQuery,
  txSumCountQuery,
  txSumCountQueryBy,
} from "./quries";
import { ThreeDots } from "react-loader-spinner";
import DateDialog from "./DateDialog";
import { AiFillCaretUp, AiFillCaretDown } from "react-icons/ai";
import ReactPaginate from "react-paginate";
import { ethers } from "ethers";
import { getRouterContract } from "../../utils/contracts";
import axios from "axios";

const PlotlyRenderers = createPlotlyRenderers(Plot);

const url = "https://graphql.bitquery.io/";

const chains = {
  1: {
    url: "/icons/eth.png",
    text: "ETH Mainnet",
    query: "ethereum",
    id: 1,
    currency: "ETH",
  },
  56: {
    url: "/icons/binance.png",
    text: "BNB Mainnet",
    query: "bsc",
    id: 56,
    currency: "BNB",
  },
  106: {
    url: "/icons/velas.png",
    text: "Velas Mainnet",
    query: "velas",
    id: 106,
    currency: "VLX",
  },
  43114: {
    url: "/icons/avalanche.png",
    text: "Avalanche Mainnet",
    query: "avalanche",
    id: 43114,
    currency: "AVAX",
  },
  137: {
    url: "/icons/polygon.svg",
    text: "Polygon Mainnet",
    query: "matic",
    id: 137,
    currency: "MATIC",
  },
};

function Home() {
  const [pivotTableUIConfig, setPivotTableUIConfig] = useState({
    cols: ["currency"],
    rows: ["type", "date", "txHash"],
    rendererName: "Table Heatmap",
    aggregatorName: "Sum",
    vals: ["amount_usd"],
    data: [],
  });
  const [address, setAddress] = useState(null);
  const [tabledata, setTableData] = useState([]);
  const [chain, setChain] = useState(56);
  const [dropdownopen, setDropDownOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [state, setState] = useState([
    {
      startDate: new Date(Date.now() - 3600 * 24 * 30 * 1000),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);

  const [isSender, setIsSender] = useState(false);
  const [isReceiver, setIsReceiver] = useState(false);
  const [isCurrency, setIsCurrency] = useState(false);
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [currency, setCurrency] = useState("");
  const [velasPrice, setVelasPrice] = useState(0);

  const [replaceQuery, setReplaceQuery] = useState("");

  const dialog = useRef();

  useEffect(() => {
    document.addEventListener("mouseup", function (event) {
      if (dialog && dialog.current && !dialog.current.contains(event.target)) {
        setDropDownOpen(false);
      }
    });
  }, []);

  const validateFunction = () => {
    if (isSender && !ethers.utils.isAddress(sender)) return false;
    if (isReceiver && !ethers.utils.isAddress(receiver)) return false;
    if (
      isCurrency &&
      !ethers.utils.isAddress(currency) &&
      currency !== chains[chain].currency
    )
      return false;
    if (!isSender && !isReceiver && !ethers.utils.isAddress(address))
      return false;
    return true;
  };

  async function fetchQuery() {
    const opts = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": "BQYSfc2qeS1cjHykKpin2IR6GHPAdx0B",
      },
      body: JSON.stringify({
        query: tokenTxQuery.replace(
          "any: [{receiver: {is: $address}}, {sender: {is: $address}}]",
          replaceQuery
        ),
        variables: {
          limit: itemsPerPage,
          offset: itemOffset,
          network: chains[chain].query,
          address,
          currency: "",
          dateFormat: "%Y-%m",
          from: state[0].startDate,
          till: state[0].endDate,
        },
      }),
    };
    let data = await fetch(url, opts);
    data = await data.json();
    console.log(data);
    if (data.data.ethereum.transfers) return data.data.ethereum.transfers;
    return [];
  }
  async function fetchData() {
    if (!validateFunction()) {
      setTableData([]);
      return;
    }
    setPending(true);
    try {
      const data = await fetchQuery();
      let temp = [...tabledata];
      temp = [];
      let prices = [];
      for (let i = 0; i < data.length; i++) {
        let type,
          _address,
          amount_usd = data[i].amount_usd;
        if (!isSender && !isReceiver) {
          if (data[i].address.address.toLowerCase() === address.toLowerCase()) {
            type = "Sent";
            _address = data[i].receiver.address;
          }
          if (
            data[i].receiver.address.toLowerCase() === address.toLowerCase()
          ) {
            type = "Received";
            _address = data[i].address.address;
          }
        }
        if (
          isSender &&
          data[i].address.address.toLowerCase() === sender.toLowerCase()
        ) {
          type = "Sent";
          _address = data[i].receiver.address;
        }
        if (
          isReceiver &&
          data[i].receiver.address.toLowerCase() === receiver.toLowerCase()
        ) {
          type = "Received";
          _address = data[i].address.address;
        }
        if (chain === 106 && data[i].currency.symbol !== "VLX") {
          try {
            const filters = prices.filter(
              (d) => d.address === data[i].currency.address
            );
            if (filters.length) {
              amount_usd = data[i].amount * filters[0].price;
            } else {
              const contract = getRouterContract();
              const weth = await contract.getAmountsOut("1000000000000000000", [
                "0xc579D1f3CF86749E05CD06f7ADe17856c2CE3126",
                data[i].currency.address,
              ]);
              console.log(velasPrice / (weth[1] / Math.pow(10, 18)));
              amount_usd =
                (data[i].amount * velasPrice) / (weth[1] / Math.pow(10, 18));
              prices.push({
                address: data[i].currency.address,
                price: velasPrice / (weth[1] / Math.pow(10, 18)),
              });
              console.log(prices);
            }
          } catch (error) {
            amount_usd = 0;
            console.log(error);
            prices.push({
              address: data[i].currency.address,
              price: 0,
            });
          }
        }
        temp.push({
          type,
          address: _address,
          amount: data[i].amount,
          amount_usd,
          date:
            new Date(data[i].block.timestamp.time).toLocaleDateString() +
            " " +
            new Date(data[i].block.timestamp.time).toLocaleTimeString(),
          currency: data[i].currency.symbol,
          txHash: data[i].transaction.hash,
        });
      }

      console.log(temp);
      setTableData(temp);
      let config = pivotTableUIConfig;
      config.data = temp;

      if (config.vals[0].includes("sum")) config.vals = ["amount_usd"];
      console.log(config);
      setPivotTableUIConfig(config);
    } catch (error) {
      console.log(error);
    }
    setPending(false);
  }

  async function fetchCountQuery() {
    console.log(
      txCountQuery.replace(
        "any: [{receiver: {is: $address}}, {sender: {is: $address}}]",
        replaceQuery
      )
    );
    try {
      const opts = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": "BQYSfc2qeS1cjHykKpin2IR6GHPAdx0B",
        },
        body: JSON.stringify({
          query: txCountQuery.replace(
            "any: [{receiver: {is: $address}}, {sender: {is: $address}}]",
            replaceQuery
          ),
          variables: {
            network: chains[chain].query,
            address,
            from: state[0].startDate,
            till: state[0].endDate,
          },
        }),
      };
      let data = await fetch(url, opts);
      data = await data.json();
      console.log(data);
      if (data.data.ethereum.transfers)
        return data.data.ethereum.transfers[0].count;
      return 0;
    } catch (error) {
      console.log(error);
    }
  }
  async function fetchDataCount() {
    if (!validateFunction()) {
      setCount(0);
      return;
    }
    setPending(true);
    try {
      const _count = await fetchCountQuery();
      setCount(_count);
    } catch (error) {
      console.log(error);
    }
    setPending(false);
  }

  async function fetchAll() {
    if (!validateFunction()) {
      setTableData([]);
      return;
    }
    console.log(
      txSumCountQueryBy.replace(
        "any: [{receiver: {is: $address}}, {sender: {is: $address}}]",
        replaceQuery
      )
    );
    setPending(true);
    try {
      const opts = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": "BQYSfc2qeS1cjHykKpin2IR6GHPAdx0B",
        },
        body: JSON.stringify({
          query:
            isSender || isReceiver
              ? txSumCountQueryBy.replace(
                  "any: [{receiver: {is: $address}}, {sender: {is: $address}}]",
                  replaceQuery
                )
              : isCurrency
              ? txSumCountQuery.replace(
                  "any: [{receiver: {is: $address}}, {sender: {is: $address}}]",
                  ` currency : {is : "${currency}"}`
                )
              : txSumCountQuery,
          variables: {
            limit: 10000,
            offset: 0,
            network: chains[chain].query,
            address,
            currency: "",
            dateFormat: "%Y-%m",
            from: state[0].startDate,
            till: state[0].endDate,
          },
        }),
      };
      let data = await fetch(url, opts);
      data = await data.json();
      console.log(data);
      if (!data.data.ethereum.transfers || !data.data.ethereum.transfers.length)
        return;
      data = data.data.ethereum.transfers;
      console.log(data);
      let prices = [];
      let temp = [...tabledata];
      temp = [];
      for (let i = 0; i < data.length; i++) {
        if (chain === 106 && data[i].currency.symbol !== "VLX") {
          let filters;
          try {
            filters = prices.filter(
              (d) => d.address === data[i].currency.address
            );
            if (!filters.length) {
              const contract = getRouterContract();
              const weth = await contract.getAmountsOut("1000000000000000000", [
                "0xc579D1f3CF86749E05CD06f7ADe17856c2CE3126",
                data[i].currency.address,
              ]);
              console.log(velasPrice / (weth[1] / Math.pow(10, 18)));
              prices.push({
                address: data[i].currency.address,
                price: velasPrice / (weth[1] / Math.pow(10, 18)),
              });
              console.log(prices);
            }
          } catch (error) {
            console.log(error);
            prices.push({
              address: data[i].currency.address,
              price: 0,
            });
          }
          if (isSender || isReceiver)
            temp.push({
              count: data[i].count,
              sum: data[i].sum,
              sum_usd: data[i].sum * filters[0].price,
              currency: data[i].currency.symbol,
            });
          else
            temp.push({
              count_in: data[i].count_in,
              count_out: data[i].count_out,
              sum_in: data[i].sum_in,
              sum_in_usd: data[i].sum_in * filters[0].price,
              sum_out: data[i].sum_out,
              sum_out_usd: data[i].sum_out * filters[0].price,
              currency: data[i].currency.symbol,
            });
        } else {
          if (isSender || isReceiver)
            temp.push({
              count: data[i].count,
              sum: data[i].sum,
              sum_usd: data[i].sum_usd,
              currency: data[i].currency.symbol,
            });
          else
            temp.push({
              count_in: data[i].count_in,
              count_out: data[i].count_out,
              sum_in: data[i].sum_in,
              sum_in_usd: data[i].sum_in_usd,
              sum_out: data[i].sum_out,
              sum_out_usd: data[i].sum_out_usd,
              currency: data[i].currency.symbol,
            });
        }
      }

      console.log(temp);
      setTableData(temp);
      setCount(temp.length);
      let config = pivotTableUIConfig;
      config.data = temp;
      if (!config.vals[0].includes("sum"))
        config.vals = isSender || isReceiver ? ["sum_usd"] : ["sum_in_usd"];
      setPivotTableUIConfig(config);
    } catch (error) {
      console.log(error);
    }
    setPending(false);
  }
  const onDrawChart = async () => {
    if (chain === 106) {
      try {
        const to = Date.now() / 1000;
        let data = await axios.get(
          `https://api.coingecko.com/api/v3/coins/velas/market_chart/range?vs_currency=usd&from=${
            to - 3600
          }&to=${to}`
        );
        data = data.data.prices;
        console.log(data[data.length - 1][1]);
        setVelasPrice(data[data.length - 1][1]);
      } catch (error) {
        console.log(error);
      }
    }
    if (itemsPerPage === 10000) fetchAll();
    else {
      await fetchDataCount();
      fetchData();
    }
  };

  const md = useMediaQuery("(max-width : 860px)");
  const sm = useMediaQuery("(max-width : 600px)");
  const xs = useMediaQuery("(max-width : 520px)");

  const [pageCount, setPageCount] = useState(0);
  // Here we use item offsets; we could also use page offsets
  // following the API or data you're working with.
  const [itemOffset, setItemOffset] = useState(0);

  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    // Fetch items from another resources.
    const endOffset = itemOffset + itemsPerPage;
    console.log(`Loading items from ${itemOffset} to ${endOffset}`);
    setPageCount(Math.ceil(count / itemsPerPage));
    onDrawChart();
  }, [itemOffset, itemsPerPage, count]);

  useEffect(() => {
    let text = "";
    if (!isSender && !isReceiver) {
      text += `any: [{receiver: {is: "${address}"}}, {sender: {is: "${address}"}}]`;
    } else {
      if (isSender) text += ` sender: {is: "${sender}"}`;
      if (isReceiver) text += ` receiver : {is : "${receiver}"}`;
    }
    if (isCurrency) text += ` currency : {is : "${currency}"}`;
    setReplaceQuery(text);
  }, [sender, receiver, currency, isSender, isReceiver, isCurrency, address]);

  const handlePageClick = (event) => {
    const newOffset = count ? (event.selected * itemsPerPage) % count : 0;
    console.log(
      `User requested page number ${event.selected}, which is offset ${newOffset}`
    );
    setItemOffset(newOffset);
  };

  return (
    <StyledContainer>
      <DateDialog
        state={state}
        setState={setState}
        open={open}
        setOpen={setOpen}
      />
      <Box width={xs ? "100%" : "fit-content"} mx={"auto"}>
        <Box
          display={"flex"}
          alignItems={md ? "unset" : "center"}
          mt={"70px"}
          flexDirection={md ? "column" : "row"}
        >
          <Box width={xs ? "100%" : "unset"}>
            <CheckPanel>
              <Box>
                <Box>Sender: </Box>
                <Checkbox
                  value={isSender}
                  onChange={(e) => setIsSender(e.target.checked)}
                />
              </Box>
              <Box>
                <Box>Receiver:</Box>
                <Checkbox
                  value={isReceiver}
                  onChange={(e) => setIsReceiver(e.target.checked)}
                />
              </Box>
              <Box>
                <Box>Currency:</Box>
                <Checkbox
                  value={isCurrency}
                  onChange={(e) => setIsCurrency(e.target.checked)}
                />
              </Box>
            </CheckPanel>
            {!isSender && !isReceiver ? (
              <InputPanel>
                {!sm ? (
                  <Box minWidth={"140px"}>
                    Wallet Address:&nbsp;&nbsp;&nbsp;&nbsp;
                  </Box>
                ) : (
                  ""
                )}
                <StyledInput
                  type={"text"}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={"Wallet Address..."}
                />
              </InputPanel>
            ) : (
              ""
            )}
            {isSender ? (
              <InputPanel>
                {!sm ? (
                  <Box minWidth={"140px"}>Sender:&nbsp;&nbsp;&nbsp;&nbsp;</Box>
                ) : (
                  ""
                )}
                <StyledInput
                  type={"text"}
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  placeholder={"Sender..."}
                />
              </InputPanel>
            ) : (
              ""
            )}
            {isReceiver ? (
              <InputPanel>
                {!sm ? (
                  <Box minWidth={"140px"}>
                    Receiver:&nbsp;&nbsp;&nbsp;&nbsp;
                  </Box>
                ) : (
                  ""
                )}
                <StyledInput
                  type={"text"}
                  value={receiver}
                  onChange={(e) => setReceiver(e.target.value)}
                  placeholder={"Receiver..."}
                />
              </InputPanel>
            ) : (
              ""
            )}
            {isCurrency ? (
              <>
                <InputPanel>
                  {!sm ? (
                    <Box minWidth={"140px"}>
                      Currency:&nbsp;&nbsp;&nbsp;&nbsp;
                    </Box>
                  ) : (
                    ""
                  )}
                  <StyledInput
                    type={"text"}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder={"Currency..."}
                  />
                </InputPanel>
                <Box
                  fontSize={"12px"}
                  color={"tomato"}
                  ml={!sm ? "140px" : 0}
                  mt={"5px"}
                >
                  For native currency, you should input symbol and for others
                  should input coin address
                </Box>
              </>
            ) : (
              ""
            )}
            <OperationPanel mt={"30px"}>
              <Box display={"flex"} alignItems={"center"}>
                {!sm ? <Box>Date:&nbsp;&nbsp;&nbsp;&nbsp;</Box> : ""}
                <StyledInput
                  tyep={"text"}
                  value={
                    state[0].startDate.toLocaleDateString() +
                    " - " +
                    state[0].endDate.toLocaleDateString()
                  }
                  onClick={() => setOpen(true)}
                />
              </Box>
              <Box ml={"20px"}>
                <DropDown
                  onClick={() => setDropDownOpen(!dropdownopen)}
                  active={dropdownopen}
                  ref={dialog}
                  mx={md ? 0 : "40px"}
                >
                  <Box display={"flex"} alignItems={"center"}>
                    <img
                      src={chains[chain].url}
                      style={{
                        borderRadius: "50%",
                        minWidth: "27px",
                        maxWidth: "27px",
                        minHeight: "27px",
                        maxHeight: "27px",
                      }}
                    />
                    <Box>{chains[chain].text}</Box>
                  </Box>
                  {dropdownopen ? <AiFillCaretUp /> : <AiFillCaretDown />}
                  <DropDownBody active={dropdownopen}>
                    {Object.values(chains).map((data, i) => {
                      return (
                        <Box key={i} onClick={() => setChain(data.id)}>
                          <img
                            src={data.url}
                            style={{
                              borderRadius: "50%",
                              minWidth: "27px",
                              maxWidth: "27px",
                              minHeight: "27px",
                              maxHeight: "27px",
                            }}
                          />
                          <Box>{data.text}</Box>
                        </Box>
                      );
                    })}
                  </DropDownBody>
                </DropDown>
              </Box>
            </OperationPanel>
          </Box>
          <Box
            ml={md ? 0 : "50px"}
            mt={md ? "30px" : 0}
            display={"flex"}
            justifyContent={md ? "flex-end" : "unset"}
            width={"100%"}
          >
            <StyledButton onClick={() => onDrawChart()}>
              Draw Chart
            </StyledButton>
          </Box>
        </Box>
        <PaginationPanel>
          <Box mr={"50px"}>
            <ReactPaginate
              previousLabel="<"
              nextLabel=">"
              pageClassName="page-item"
              pageLinkClassName="page-link"
              previousClassName="page-item"
              previousLinkClassName="page-link"
              nextClassName="page-item"
              nextLinkClassName="page-link"
              breakLabel="..."
              breakClassName="page-item"
              breakLinkClassName="page-link"
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={3}
              onPageChange={handlePageClick}
              containerClassName="pagination"
              activeClassName="active"
            />
          </Box>
          <Box mt={"-24px"}>
            <InputLabel id="demo-simple-select-label">Rows Per Page</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={itemsPerPage}
              label="Rows"
              onChange={(e) => setItemsPerPage(e.target.value)}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
              <MenuItem value={200}>200</MenuItem>
              <MenuItem value={9999}>ALL</MenuItem>
              <MenuItem value={10000}>Total</MenuItem>
            </Select>
          </Box>
        </PaginationPanel>
      </Box>
      <TablePanel>
        {pending ? (
          <Box mt={"100px"}>
            <ThreeDots
              height="200"
              width="200"
              radius="9"
              color="grey"
              ariaLabel="three-dots-loading"
              wrapperStyle={{}}
              wrapperClassName=""
              visible={true}
            />
          </Box>
        ) : (
          <PivotTableUI
            data={tabledata}
            onChange={(s) => {
              console.log("State passed on PivotTable onChange:");
              console.log(s);
              setPivotTableUIConfig(s);
            }}
            renderers={Object.assign({}, TableRenderers, PlotlyRenderers)} //,PlotlyRenderers)}
            {...pivotTableUIConfig}
          />
        )}
      </TablePanel>
    </StyledContainer>
  );
}

const CheckPanel = styled(Box)`
  display: flex;
  align-items: center;
  > div {
    display: flex;
    align-items: center;
    margin-right: 20px;
  }
  margin-bottom: 10px;
  @media screen and (max-width: 520px) {
    > div {
      margin-right: 10px;
      font-size: 12px;
    }
  }
`;

const PaginationPanel = styled(Box)`
  margin-top: 50px;
  display: flex;
  justify-content: flex-end;
  .MuiSelect-select {
    padding-top: 8.5px !important;
    padding-bottom: 8.5px !important;
  }
`;

const DropDownBody = styled.div`
  position: absolute;
  left: -1px;
  top: 48px;
  width: 240px;
  > div {
    display: flex;
    align-items: center;
    padding: 12px 19px 11px 18px;
    > div {
      margin-left: 9px;
      margin-right: 6px;
    }
    :hover {
      background: #595e6833;
    }
  }
  background: white;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  overflow: hidden;
  height: ${({ active }) => (active ? "255px" : "0")};
  z-index: 100;
  border: ${({ active }) => (active ? "1px solid grey" : "none")};
`;

const DropDown = styled(Box)`
  z-index: 100;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  border-bottom-left-radius: ${({ active }) => (active ? "0" : "5px")};
  border-bottom-right-radius: ${({ active }) => (active ? "0" : "5px")};
  width: 240px;
  height: 50px;
  padding: 12px 10px 11px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 600;
  color: black;
  > div:nth-child(1) > div:nth-child(2) {
    margin-left: 9px;
    margin-right: 6px;
  }
  cursor: pointer;
  position: relative;
  border: 1px solid grey;
`;

const StyledInput = styled.input`
  border: 1px solid grey;
  padding: 10px;
  border-radius: 5px;
  width: 210px;
`;

const StyledButton = styled.button`
  margin-left: 20px;
  color: white;
  background: tomato;
  padding: 10px 20px;
  border-radius: 5px;
  transition: all 0.3s;
  :hover {
    background: sandybrown;
  }
`;

const InputPanel = styled(Box)`
  margin-top: 20px;
  display: flex;
  align-items: center;
  > input {
    width: 450px;
    @media screen and (max-width: 860px) {
      width: 100%;
    }
  }
`;

const OperationPanel = styled(Box)`
  display: flex;
  align-items: center;
  @media screen and (max-width: 520px) {
    flex-direction: column;
    > div:nth-child(2) {
      margin-left: 0;
      margin-top: 30px;
    }
    > div {
      width: 100%;
      > input {
        width: 100%;
      }
    }
    width: 100%;
  }
`;

const TablePanel = styled(Box)`
  margin: 0 auto;
  margin-top: 50px;
  width: fit-content;
  @media screen and (max-width: 520px) {
    width: 100%;
    overflow: scroll;
  }
`;

const StyledContainer = styled(Box)`
  width: 100%;
  min-height: 100vh;
  position: relative;
  padding: 0 40px;
  padding-bottom: 50px;
  @media screen and (max-width: 900px) {
    padding-left: 10px;
    padding-right: 10px;
  }
`;

export default Home;
