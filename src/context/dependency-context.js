import { createContext, useContext, useReducer } from "react";
import { DEPENDENCY_CONTEXT_REFRESH_ACTION_NAME } from "../const";

const DependencyContext = createContext(null);
const DependencyDispatchContext = createContext(null);

const reducer = (_dependencies, action) => {
    switch(action.type) {
        case DEPENDENCY_CONTEXT_REFRESH_ACTION_NAME: {
            return action.dependencies;
        }
        default: {
            throw Error('Unknown action: ' + action.type);
          }
    }
};

export const DependencyContextProvider = ({children}) => {
    const [dependencies, dispatch] = useReducer(reducer, {});

    return (
        <DependencyContext.Provider value={dependencies}>
            <DependencyDispatchContext.Provider value={dispatch}>
                {children}
            </DependencyDispatchContext.Provider>
        </DependencyContext.Provider>
    );
};

export const useDependencyState = () => useContext(DependencyContext);
export const useDependencyDispatch = () => useContext(DependencyDispatchContext);