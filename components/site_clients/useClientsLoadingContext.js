import { createContext, useContext } from "react";

const LoadingContext = createContext({
  isLoading: false,
  setIsLoading: () => {},
});

export const useLoading = () => useContext(LoadingContext);

/**
 * Context component to provide loading state from page deep into children
 * @example
 * // in page.js class component
 * render(){
 *  ...
 * <MyComponent
 *   isLoading={this.state.is_load}
 *   setIsLoading={(is) => this.setState({ is_load: is })}
 * />
 * }
 * // in direct MyComponent child
 * const { isLoading, setIsLoading } = props;
 * return (
 *   <LoadingProvider isLoading={isLoading} setIsLoading={setIsLoading}>
 *   ...
 *   </LoadingProvider>
 * );
 *
 * // in any deep child
 * const { isLoading, setIsLoading } = useLoading();
 *
 */
export const LoadingProvider = ({ isLoading, setIsLoading, children }) => {
  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};
