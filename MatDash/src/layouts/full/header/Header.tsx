
import { useState, useEffect } from "react";
import { Navbar } from "flowbite-react";
import Profile from "./Profile";
// import Notification from "./notification";
import { Drawer } from "flowbite-react";
import MobileSidebar from "../sidebar/MobileSidebar";



const Header = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [userName, setUserName] = useState("Guest");
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // mobile-sidebar
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);


  // After login  your name will be displayed on the screen
  useEffect(() => {
    if (!sessionStorage.getItem("name")) {
      sessionStorage.setItem("name", "admin");
      console.log("Name has been set in sessionStorage.");
    }

    const storedName = sessionStorage.getItem("name");
    console.log("📦 Stored Name:", storedName);

    setUserName(storedName || "Guest");
  }, []);
  



  return (
    <>
      <header
        className={`sticky top-0 z-[5] ${isSticky
            ? "bg-white dark:bg-dark fixed w-full"
            : "bg-white"
          }`}
      >
        <Navbar
          fluid
          className={`rounded-none bg-transparent dark:bg-transparent py-1 sm:px-30 px-4`}
        >
          {/* Mobile Toggle Icon */}

          <div className="flex gap-3 items-center justify-between w-full ">
            <div className="flex gap-2 items-center">
              {/* <span
                onClick={() => setIsOpen(true)}
                className="h-10 w-10 flex text-black dark:text-white text-opacity-65 xl:hidden hover:text-primary hover:bg-lightprimary rounded-full justify-center items-center cursor-pointer"
              >
                <Icon icon="solar:hamburger-menu-line-duotone" height={21} />
              </span>
              <Notification /> */}
            </div>

            <div className="flex gap-2 items-center">
  <Profile />
  <div className="flex flex-col leading-none space-y--1">
  <h5 className="text-base font-semibold">Welcome</h5>
  <p className="text-sm text-gray-600 -mt-1">{userName}</p>
</div>


</div>
          </div>
        </Navbar>
      </header>

      {/* Mobile Sidebar */}
      <Drawer open={isOpen} onClose={handleClose} className="w-130">
        <Drawer.Items>
          <MobileSidebar />
        </Drawer.Items>
      </Drawer>
    </>
  );
};

export default Header;
