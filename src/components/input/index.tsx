import cn from "classnames";
import { FC, InputHTMLAttributes } from "react";
import { Icon } from "../icon";

export interface IInput extends InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Input: FC<IInput> = ({ className, value, onChange, ...rest }) => {
  const handleClear = () => {
    onChange({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="relative">
      <div
        className={cn(
          "px-4 py-2 border border-gray-300 rounded-xl w-full text-gray-500 bg-white focus-within:bg-gray-100",
          value && "pl-8"
        )}
      >
        <input
          type="text"
          value={value}
          onChange={onChange}
          className={cn(
            "focus:outline-none w-full focus:bg-gray-100",
            className
          )}
          {...rest}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute left-2 top-2"
          >
            <Icon name="Close" size="24" className="text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
};
