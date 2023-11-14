import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/index.css';
import App from './pages/App';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom';
import Repos from './pages/repos';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { authenticate, getRepos } from './services/github-service';
import { ACCESS_TOKEN_SESSION_STORAGE_KEY_NAME, NUM_REPOS_PER_PAGE } from './const';
import Lineage from './pages/lineage';
import { GitHubContextProvider } from './context/github-context';
import Error from './components/error';
import SplashPage from './pages/splash';

const router = createBrowserRouter([
  {
    path: '/',
    element: <SplashPage />,
    //element: <App />,
    errorElement: <Error />
  },
  {
    path: '/repos',
    element: <Repos />,
    errorElement: <Error />,
    loader: async ({request}) => {
      const url = new URL(request.url);
      const code = url.searchParams.get("code");
      const accessToken = sessionStorage.getItem(ACCESS_TOKEN_SESSION_STORAGE_KEY_NAME);
      if (code && !accessToken) {
        await authenticate(code);
      }
      const repos = await getRepos(1, NUM_REPOS_PER_PAGE);
      return repos;
    }
  },
  {
    path: '/lineage/:owner/:repoName',
    element: <Lineage />,
    errorElement: <Error />
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GitHubContextProvider>
    <MantineProvider defaultColorScheme='dark'>
      <Notifications />
      <RouterProvider router={router} />
    </MantineProvider>  
  </GitHubContextProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
