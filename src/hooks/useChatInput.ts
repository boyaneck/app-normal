import { useCallback, useEffect, useState } from "react";

const useChatInput = () => {
  const [input, set_input] = useState<string>("");

  const [debounced, set_debounced] = useState<string>("");

  const inputChange = useCallback((e: any) => {
    set_input(e.target.value);
  }, []);

  const sendMsg = useCallback(() => {
    if (input.trim().length === 0) return;
    set_input("");
    set_debounced("");
  }, [set_input]);

  useEffect(() => {
    const time_out = setTimeout(() => {
      set_debounced(input);
    }, 5000);

    return () => {
      clearTimeout(time_out);
    };
  }, [input]);

  return {
    input,
    debounced,
    inputChange,
    sendMsg,
    blankChk: input.trim().length > 0,
  };
};

export default useChatInput;
