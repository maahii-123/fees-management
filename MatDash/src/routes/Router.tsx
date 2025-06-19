// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// // @ts-ignore
// import { lazy } from 'react';
// import { Navigate, createBrowserRouter } from 'react-router';
// import Loadable from 'src/layouts/full/shared/loadable/Loadable';


// /* ***Layouts**** */
// const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
// const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

// // Dashboard
// const Dashboard = Loadable(lazy(() => import('../views/dashboards/Dashboard')));

// // utilities
// const Typography = Loadable(lazy(() => import('../views/typography/StudentForms')));
// const Table = Loadable(lazy(() => import('../views/tables/Table')));
// const Form = Loadable(lazy(() => import('../views/forms/FeeForm')));
// const Fees = Loadable(lazy(() => import('../views/fees/FeesTables')));
// const Course = Loadable(lazy(() => import('../views/course/Course')));
// const Batch = Loadable(lazy(() => import('../views/batch/Batch')));
// const Update = Loadable(lazy(() => import('../views/updateform/Updates')));

// // icons
// // const Solar = Loadable(lazy(() => import('../views/icons/Solar')));

// // authentication
// const Login = Loadable(lazy(() => import('../views/auth/login/Login')));
// const Register = Loadable(lazy(() => import('../views/auth/register/Register')));
// // const SamplePage = Loadable(lazy(() => import('../views/sample-page/SamplePage')));
// const Error = Loadable(lazy(() => import('../views/auth/error/Error')));

// const Router = [
//   {
//     path: '/',
//     element: <FullLayout />,
//     children: [
//       { path: '/', exact: true, element: <Dashboard /> },
//       { path: '/ui/studentform', exact: true, element: <Typography /> },
//       { path: '/ui/table', exact: true, element: <Table /> },
//       { path: '/ui/feesform', exact: true, element: <Form /> },
//       { path: '/ui/feestable', exact: true, element: <Fees /> },
//       { path: '/ui/course', exact: true, element: <Course /> },
//       { path: '/ui/batch', exact: true, element: <Batch /> },
//             { path: '/ui/update', exact: true,  element: <Update /> },
//       // { path: '/icons/solar', exact: true, element: <Solar /> },
//       // { path: '/sample-page', exact: true, element: <SamplePage /> },
//       { path: '*', element: <Navigate to="/auth/404" /> },
//     ],
//   },
//   {
//     path: '/',
//     element: <BlankLayout />,
//     children: [
//       { path: '/auth/login', element: <Login /> },
//       { path: '/auth/register', element: <Register /> },
//       { path: '404', element: <Error /> },
//       { path: '/auth/404', element: <Error /> },
//       { path: '*', element: <Navigate to="/auth/404" /> },
//     ],
//   },
// ];

// const router = createBrowserRouter(Router, { basename: '/MatDash' });
// export default router;


// src/routes/Router.tsx

import { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import Loadable from 'src/layouts/full/shared/loadable/Loadable';

import AuthProtectedRoute from '../components/AuthProtected/AuthProtectedRoute'; // <- Import kiya

// Layouts
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

// Pages
const Dashboard = Loadable(lazy(() => import('../views/dashboards/Dashboard')));
const Typography = Loadable(lazy(() => import('../views/typography/StudentForms')));
const Table = Loadable(lazy(() => import('../views/tables/Table')));
const Form = Loadable(lazy(() => import('../views/forms/FeeForm')));
const Fees = Loadable(lazy(() => import('../views/fees/FeesTables')));
const Course = Loadable(lazy(() => import('../views/course/Course')));
const Batch = Loadable(lazy(() => import('../views/batch/Batch')));
const Update = Loadable(lazy(() => import('../views/updateform/Updates')));

// Auth
const Login = Loadable(lazy(() => import('../views/auth/login/Login')));
const Register = Loadable(lazy(() => import('../views/auth/register/Register')));
const Error = Loadable(lazy(() => import('../views/auth/error/Error')));

const Router = [
  // 👇 Protected routes - inside AuthProtectedRoute
  {
    path: '/',
    element: <AuthProtectedRoute />, // <-- Protected wrapper
    children: [
      {
        path: '/',
        element: <FullLayout />,
        children: [
          { path: '/', exact: true, element: <Dashboard /> },
          { path: '/ui/studentform', exact: true, element: <Typography /> },
          { path: '/ui/table', exact: true, element: <Table /> },
          { path: '/ui/feesform', exact: true, element: <Form /> },
          { path: '/ui/feestable', exact: true, element: <Fees /> },
          { path: '/ui/course', exact: true, element: <Course /> },
          { path: '/ui/batch', exact: true, element: <Batch /> },
          { path: '/ui/update', exact: true, element: <Update /> },
        ],
      },
    ],
  },

  // 👇 Public routes
  {
    path: '/',
    element: <BlankLayout />,
    children: [
      { path: '/auth/login', element: <Login /> },
      { path: '/auth/register', element: <Register /> },
      { path: '/auth/404', element: <Error /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
];

const router = createBrowserRouter(Router, { basename: '/MatDash' });
export default router;

