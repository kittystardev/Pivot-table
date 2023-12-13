import React from "react";
import styled from "styled-components";
import { Box } from "@mui/material";
import { FiChevronRight } from "react-icons/fi";

const Button = ({
  width,
  height,
  type,
  fontSize = "16px",
  children,
  disabled,
  onClick,
  style,
}) => {
  return (
    <>
      {type === "plus" ? (
        <PlusButton
          width={width}
          height={height}
          type={type}
          fontSize={fontSize}
          disabled={disabled}
          onClick={onClick}
          style={style}
        >
          <Box>{children}</Box>
        </PlusButton>
      ) : (
        ""
      )}
      {type === "minus" ? (
        <MinusButton
          width={width}
          height={height}
          type={type}
          fontSize={fontSize}
          disabled={disabled}
          onClick={onClick}
          style={style}
        >
          <Box>{children}</Box>
        </MinusButton>
      ) : (
        ""
      )}
      {type === "primary" ? (
        <PrimaryButton
          width={width}
          height={height}
          type={type}
          fontSize={fontSize}
          disabled={disabled}
          onClick={onClick}
          style={style}
        >
          <Box>{children}</Box>
        </PrimaryButton>
      ) : (
        ""
      )}
      {type === "secondary" ? (
        <SecondaryButton
          width={width}
          height={height}
          type={type}
          fontSize={fontSize}
          disabled={disabled}
          onClick={onClick}
          style={style}
        >
          <Box>{children}</Box>
        </SecondaryButton>
      ) : (
        ""
      )}
      {type === "arrow1" ? (
        <Arrow1Button
          width={width}
          height={height}
          type={type}
          fontSize={fontSize}
          disabled={disabled}
          onClick={onClick}
          style={style}
        >
          <Box
            display={"flex"}
            alignItems={"center"}
            justifyContent={"space-between"}
            width={"100%"}
          >
            <Box>{children}</Box>
            <Circle>
              <FiChevronRight />
            </Circle>
          </Box>
        </Arrow1Button>
      ) : (
        ""
      )}
      {type === "arrow2" ? (
        <Arrow2Button
          width={width}
          height={height}
          type={type}
          fontSize={fontSize}
          disabled={disabled}
          onClick={onClick}
          style={style}
        >
          <Box
            display={"flex"}
            alignItems={"center"}
            justifyContent={"space-between"}
            width={"100%"}
          >
            <Box>{children}</Box>
            <Circle>
              <FiChevronRight />
            </Circle>
          </Box>
        </Arrow2Button>
      ) : (
        ""
      )}
      {type === "connect" ? (
        <ConnectButton
          width={width}
          height={height}
          type={type}
          fontSize={fontSize}
          disabled={disabled}
          onClick={onClick}
          style={style}
        >
          <Box>{children}</Box>
        </ConnectButton>
      ) : (
        ""
      )}
    </>
  );
};

const BaseButton = styled.button`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: ${({ fontSize }) => fontSize};
  font-weight: bold;
  min-width: ${({ width }) => width};
  min-height: ${({ height }) => height};
  max-width: ${({ width }) => width};
  max-height: ${({ height }) => height};
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.16);
  cursor: pointer;
  transition: all 0.3s;
  :disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PlusButton = styled(BaseButton)`
  background: #76c893;
  color: #000c27;
  border: 1px solid #89c697;
  border-radius: 50%;
  line-height: 0px;
  :hover:not([disabled]) {
    background: #ff626e;
    color: white;
    border: #ff626e;
  }
`;

const MinusButton = styled(BaseButton)`
  background: transparent;
  color: white;
  border: 1px solid white;
  border-radius: 50%;
  :hover:not([disabled]) {
    background: #ff626e;
    color: white;
    border: #ff626e;
  }
`;
const PrimaryButton = styled(BaseButton)`
  background: linear-gradient(
    to right,
    #43bad1,
    #43bad1,
    #43bad1,
    #043cb4,
    #0251b3
  );
  background-size: 300% 100%;
  color: white;
  border-radius: 31px;
  border: none;
  :hover:not([disabled]) {
    background-position: 100% 0;
    color: white;
    border: none;
  }
  @media screen and (max-width: 550px) {
    font-weight: 500;
  }
`;
const SecondaryButton = styled(BaseButton)`
  background: #3671e9;
  background: linear-gradient(
    to right,
    white,
    white,
    white,
    rgb(45, 221, 77),
    rgb(45, 221, 77)
  );
  background-size: 300% 100%;
  border-radius: calc(100vw / 1440 * 32);
  color: #3671e9;
  font-weight: 500;
  transition: all 0.5s ease-in-out;
  :hover {
    color: white;
    background-position: 100% 0;
  }
  @media screen and (max-width : 550px){
    border-radius : 32px;
  }
`;

const Arrow1Button = styled(BaseButton)`
  background: linear-gradient(
    to right,
    #3671e9,
    #3671e9,
    #3671e9,
    white,
    white
  );
  background-size: 300% 100%;
  border-radius: calc(100vw / 1440 * 32);
  color: white;
  font-weight: 500;
  transition: all 0.5s ease-in-out;
  padding: 0 calc(100vw / 1440 * 16) 0 calc(100vw / 1440 * 24);
  :hover {
    // color: rgb(45, 221, 77);
    color: #3671e9;
    background-position: 100% 0;
    > div > div:nth-child(2) {
      background-color: #3671e9;
      color: white;
    }
  }
  @media screen and (max-width: 960px) {
    border-radius: 32px;
    padding: 0 16px 0 24px;
  }
`;

const Arrow2Button = styled(BaseButton)`
  background: linear-gradient(to right, black, black, black, white, white);
  background-size: 300% 100%;
  border-radius: calc(100vw / 1440 * 32);
  color: white;
  font-weight: 500;
  transition: all 0.5s ease-in-out;
  padding: 0 calc(100vw / 1440 * 16) 0 calc(100vw / 1440 * 24);
  > div > div:nth-child(2) {
    color: black;
  }
  :hover {
    // color: rgb(45, 221, 77);
    color: black;
    background-position: 100% 0;
    > div > div:nth-child(2) {
      background-color: black;
      color: white;
    }
  }
  @media screen and (max-width: 1440px) {
    border-radius: 32px;
    padding: 0 16px 0 24px;
  }
`;

const ConnectButton = styled(BaseButton)`
  background: #3671e9;
  background: linear-gradient(
    to right,
    #3671e9,
    #3671e9,
    #3671e9,
    rgb(45, 221, 77),
    rgb(45, 221, 77)
  );
  background-size: 300% 100%;
  border-radius: calc(100vw / 1440 * 32);
  color: white;
  font-weight: 500;
  transition: all 0.5s ease-in-out;
  :hover {
    // color: rgb(45, 221, 77);
    background-position: 100% 0;
  }
  @media screen and (max-width: 1440px) {
    border-radius: 32px;
  }
`;

const Circle = styled(Box)`
  width: calc(100vw / 1440 * 32);
  height: calc(100vw / 1440 * 32);
  border-radius: 50%;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #3671e9;
  transition: all 0.5s ease-in-out;
  @media screen and (max-width: 1440px) {
    width: 32px;
    height: 32px;
  }
  @media screen and (max-width : 500px){
    width : 26px;
    height : 26px;
    font-size : 14px;
  }
`;

export default Button;
