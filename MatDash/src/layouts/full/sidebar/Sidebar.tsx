import { Sidebar } from 'flowbite-react';
import React from 'react';
// import SimpleBar from 'simplebar-react';
import FullLogo from '../shared/logo/FullLogo';
import NavItems from './NavItems';
import SidebarContent from './Sidebaritems';
// import { useNavigate } from 'react-router-dom';
// import { useEffect  } from 'react';
// // import { useNavigate } from 'react-router-dom';
// import { useEffect  } from 'react';

const SidebarLayout = () => {


// const navigate = useNavigate();

// useEffect(() => {
//   const auths = sessionStorage.getItem('auth');
//   console.log(auths);

//   if (auths === "admin") {
//     navigate('/');
//   } 

// }, []);




// const navigate = useNavigate();

// useEffect(() => {
//   const auths = sessionStorage.getItem('auth');
//   console.log(auths);

//   if (auths === "admin") {
//     navigate('/');
//   } else {
//     navigate('/auth/login');
//   }

// }, []);

  return (
    <>
      <div className="xl:block hidden">
        <Sidebar
         // className="fixed menu-sidebar  bg-white dark:bg-darkgray rtl:pe-4 rtl:ps-0 "
                  className="fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-darkgray overflow-y-auto "
          aria-label="Sidebar with multi-level dropdown example"
        >
          <div className="px-6 py-4 flex items-center sidebarlogo">
            <FullLogo />
          </div>
          {/* <SimpleBar className="h-[calc(100vh_-_230px)]"> */}
              <div className="overflow-y-auto h-[calc(100vh-100px)] px-5 mt-2">
            <Sidebar.Items>
              <Sidebar.ItemGroup className="sidebar-nav hide-menu">
                {/* {SidebarContent && */}
                 { SidebarContent?.map((item, index) => (
                    <div className="caption" key={item.heading}>
                      <React.Fragment key={index}>
                        <h5 className="text-link dark:text-white/70 caption font-semibold leading-6 tracking-widest text-xs pb-2 uppercase">
                          {item.heading}
                        </h5>
                        {item.children?.map((child, index) => (
                          <React.Fragment key={child.id && index}>
                            <NavItems item={child} />
                          </React.Fragment>
                        ))}
                      </React.Fragment>
                    </div>
                  ))}
              </Sidebar.ItemGroup>
            </Sidebar.Items>
          {/* </SimpleBar> */}
          </div>
        </Sidebar>
      </div>
    </>
  );
};

export default SidebarLayout;




