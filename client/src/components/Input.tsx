import React from "react";
import styled from "styled-components";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode; // SVG or any React element
}

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  width: 100%;

  border: 1.8px solid #d1d5db; 
  background: white;
  border-radius: 12px;

  transition: 0.2s ease;

  &:focus-within {
    border-color: #0ea5e9; 
    box-shadow: 0px 0px 0px 3px rgba(14, 165, 233, 0.1);
  }
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 20px;
    height: 20px;
    color: #e67e22; /* the exact orange from screenshot */
  }
`;

const StyledInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;

  font-size: 1rem;
  color: #4b5563;

  &::placeholder {
    color: #9ca3af;
  }
`;

export const Input: React.FC<InputProps> = ({ icon, ...rest }) => {
    return (
        <InputWrapper>
            {icon && <IconContainer>{icon}</IconContainer>}
            <StyledInput {...rest} />
        </InputWrapper>
    );
};

