import propTypes from "prop-types";
import { StyledInput, InputWrapper, StyledText, StyledLabel } from "./styles";

const RangeInput = ({ handleChange, tempo }) => {
  return (
    <InputWrapper>
      <StyledLabel htmlFor="tempo">choose BPM</StyledLabel>
      <StyledInput
        defaultValue={tempo}
        type="range"
        id="tempo"
        name="tempo"
        min="30"
        max="200"
        onChange={handleChange}
      />
      <StyledText>{tempo}</StyledText>
    </InputWrapper>
  );
};

RangeInput.propTypes = {
  handleChange: propTypes.func,
  tempo: propTypes.oneOfType([propTypes.string, propTypes.number]),
};

export default RangeInput;
