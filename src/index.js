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
import { MantineProvider } from '@mantine/core';
import { authenticate, getRepos } from './services/github-service';
import { ACCESS_TOKEN_SESSION_STORAGE_KEY_NAME, NUM_REPOS_PER_PAGE } from './const';
import LineageDiagram from './pages/lineage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/repos',
    element: <Repos />,
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
    path: '/lineage',
    element: <LineageDiagram />,
    loader: async () => {

    }
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <MantineProvider defaultColorScheme='dark'>
    <RouterProvider router={router} />
  </MantineProvider>  
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();