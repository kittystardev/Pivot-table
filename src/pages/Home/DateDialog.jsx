/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/alt-text */
import { Box, Dialog } from "@mui/material";
import styled from "styled-components";

import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css";

function DateDialog({ state, setState, open, setOpen }) {
  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <StyledContainer>
        <DateRangePicker
          onChange={(item) => setState([item.selection])}
          showSelectionPreview={true}
          moveRangeOnFirstSelection={false}
          ranges={state}
          direction="horizontal"
          maxDate={new Date()}
        />
      </StyledContainer>
    </Dialog>
  );
}

const StyledContainer = styled(Box)``;

export default DateDialog;
