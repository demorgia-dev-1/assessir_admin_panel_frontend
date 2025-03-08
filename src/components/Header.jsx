import { useEffect, useRef, useState } from "react";
import { HiMenu } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import logo from "../assets/demorgia-logo.png";
import skill from "../assets/skillind.png";
import useOnline from "../components/features/useOnline";

export default function Header({ toggleSidebar, admin }) {
  const [openTab, setOpenTab] = useState(null);
  const isOnline = useOnline();

  const profileRef = useRef(null);
  const handleTabClick = (tab) => {
    setOpenTab(openTab === tab ? null : tab);
  };

  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setOpenTab(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileRef]);

  const handleProfileClick = () => {
    setOpenTab(openTab === "profileDetails" ? null : "profileDetails");
    const url = "/profile";
    navigate(url);
  };

  const handleLogoutClick = () => {
    sessionStorage.removeItem("token");
    navigate("/logout");
  };

  const role = sessionStorage.getItem("role");
  return (
    <div className="max-w-[100%] relative bg-white items-center duration-200 ease-in-out h-20 px-4 flex justify-between m-4 mb-0 rounded-lg shadow-md hover:shadow-lg hover:shadow-gray-300 transition-shadow max-w-auto">
      <div className="relative flex items-center">
        <button onClick={toggleSidebar} className="p-2 focus:outline-none">
          <HiMenu fontSize={24} />
        </button>
        <img
          src={admin?.company?.companyLogoUrl || logo}
          alt="company logo"
          className="h-14 m-2 bg-transparent object-cover"
        />

        <img src={skill} alt="skill" className="h-14" />
      </div>

      <div className="flex items-center gap-2 mr-2">
        {"admin" && (
          <div>
            <span
              className={`inline-block mr-2 h-2.5 w-2.5 rounded-full shadow ${
                isOnline ? "bg-green-500" : "bg-red-500"
              }`}
            ></span>
            <span className="font-bold mr-2">Welcome</span>
            <span className="text-green-700 font-semibold">{admin?.name}</span>
          </div>
        )}

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => handleTabClick("profile")}
            className="ml-2 bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-neutral-400"
          >
            <span className="sr-only">Open user menu</span>
            <div
              className="h-10 w-10 rounded-full bg-cover bg-no-repeat bg-center flex items-center justify-center text-white"
              style={{
                backgroundImage: admin?.profilePictureUrl
                  ? `url(${admin.profilePictureUrl})`
                  : "none",
              }}
            >
              {!admin?.profilePictureUrl && admin?.name ? (
                <span className="text-xl font-bold">{admin.name[0]}</span>
              ) : (
                <span className="sr-only">User</span>
              )}
            </div>
          </button>

          {openTab === "profile" && (
            <div className="absolute right-0 z-20 mt-2 w-48 rounded-sm shadow-md p-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div
                onClick={handleProfileClick}
                className="active:bg-gray-200 rounded-sm px-4 py-2 text-gray-700 cursor-pointer focus:bg-gray-200"
              >
                {"Your Profile"}
              </div>

              <div
                onClick={() => handleLogoutClick("/logout")}
                className="active:bg-gray-200 rounded-sm px-4 py-2 text-gray-700 cursor-pointer focus:bg-gray-200"
              >
                Sign out
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
