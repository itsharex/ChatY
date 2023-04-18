import { FC, useState, useEffect, useRef } from 'react';
import Whether from '../Whether';
import Icon from '../Icon';
import classNames from 'classnames';
import './style/index.scss';
export interface InputProps {
  type?: 'text' | 'password';
  value?: string | number;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  clearable?: boolean;
  showCount?: boolean;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
}

const Input: FC<InputProps> = (props) => {
  const {
    type = 'text',
    value = '',
    placeholder,
    className,
    maxLength,
    clearable,
    showCount,
    onChange,
    onBlur,
  } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputVal, setInputVal] = useState('');
  const [focus, setFocus] = useState(false);
  const [countStr, setCountStr] = useState('');

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (maxLength && e.target.value.length > maxLength) {
      e.target.value = e.target.value.slice(0, maxLength);
    }
    setInputVal(e.target.value);
    onChange?.(e.target.value);
    showCount && calcCountStr();
  };

  const onBlurHandler = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocus(false);
    onBlur?.(e.target.value);
  };

  const clearInput = () => {
    setInputVal('');
    onChange?.('');
    showCount && calcCountStr('0');
  };
  const calcCountStr = (length?: string) => {
    if (maxLength) {
      setCountStr(`${length || String(inputVal).length}/${maxLength}`);
    } else {
      setCountStr(`${length || String(inputVal).length}`);
    }
  };

  useEffect(() => {
    calcCountStr();
  }, [showCount]);

  useEffect(() => {
    setInputVal(String(value));
  }, [value]);

  return (
    <div className={classNames('cy-input', className, { focus })}>
      <input
        ref={inputRef}
        type={type}
        value={inputVal}
        placeholder={placeholder}
        onFocus={() => setFocus(true)}
        onBlur={onBlurHandler}
        onChange={onChangeHandler}
      />
      <div className={classNames('cy-input__trail', { 'cy-input__count': showCount })} data-count={countStr}>
        <Whether condition={!!clearable && !!String(inputVal).length}>
          <Icon name="close-circle-fill" className="cy-input__clear" onClick={clearInput} />
        </Whether>
      </div>
    </div>
  );
};

export default Input;