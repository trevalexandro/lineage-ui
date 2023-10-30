import { createContext, useContext, useReducer } from "react";
import { GITHUB_CONTEXT_REFRESH_ACTION_NAME } from "../const";

const GitHubContext = createContext(null);
const GitHubDispatchContext = createContext(null);

const reducer = (_dependencies, action) => {
    switch(action.type) {
        case GITHUB_CONTEXT_REFRESH_ACTION_NAME: {
            return action.dependencies;
        }
        default: {
            throw Error('Unknown action: ' + action.type);
          }
    }
};

export const GitHubContextProvider = ({children}) => {
    const [dependencies, dispatch] = useReducer(reducer, []);

    return (
        <GitHubContext.Provider value={dependencies}>
            <GitHubDispatchContext.Provider value={dispatch}>
                {children}
            </GitHubDispatchContext.Provider>
        </GitHubContext.Provider>
    );
};

export const useDependencies = () => useContext(GitHubContext);
export const useGitHubDispatch = () => useContext(GitHubDispatchContext);