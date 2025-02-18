import { createContext } from "react";

interface VisibilityContextProps {
  hideCompleted: boolean;
  setHideCompleted: (value: boolean) => void;
}

const VisibilityContext = createContext<VisibilityContextProps>({
  hideCompleted: false,
  setHideCompleted: () => {},
});

export default VisibilityContext;
