import styled from "styled-components";


interface ObjectOptionsProps {
    data: Record<string, string>
}


const CustomSelect = styled.select`
  width: 100%;
  padding: 14px 16px;
  border-radius: 14px;
  border: none;
  background-color: #f5f5f5;
  font-size: 15px;
  color: #111827;
  outline: none;
  appearance: none; /* remove default arrow */

  background-image: url("data:image/svg+xml;utf8,<svg fill='%239ca3af' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 16px center;

  &:focus {
    outline: 2px solid #1118271a;
  }

  option {
    background: white;
    color: #111827;
  }
`;



export const ObjectSelectOptions = ({ data }: ObjectOptionsProps) => {
    return (
        <>
            {Object.entries(data).map(([key, value]) => (
                <option key={key} value={key}>
                    {value}
                </option>
            ))}
        </>
    );
};


interface ValueOptionsProps {
    data: string[]
}

export const ValueSelectOptions = ({ data }: ValueOptionsProps) => {
    return (
        <>
            {data.map((value) => (
                <option key={value} value={value}>
                    {value}
                </option>
            ))}
        </>
    );
};

export default CustomSelect;
