import { IMaskMixin } from "react-imask";

export const ONLY_TEXT_REGEX = /^[A-Za-z\s\u00C0-\u00FF]*$/;
export const TextInput = IMaskMixin(({ inputRef, ...props }) => (
  <input
    type="text"
    className="input input-bordered input-sm w-full text-app-primary-color bg-transparent focus:outline-none focus:border-text-app-primary-color"
    ref={inputRef}
    autocapitalize="off"
    autocomplete="off"
    autocorrect="off"
    spellcheck={false}
    {...props}
  />
));
