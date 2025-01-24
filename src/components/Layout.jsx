
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation } from 'react-router-dom';
import Dashboard from '../components/Dashboard/Dashboard';
import { fetchAdminProfile } from '../components/features/profileSlice';
import Breadcrumbs from './Breadcrumbs';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout() {
    const [isSidebarVisible, setSidebarVisible] = useState(true);
    const location = useLocation();
    const sidebarRef = useRef(null);

    const toggleSidebar = () => {
        setSidebarVisible(!isSidebarVisible);
    };

    const handleClickOutside = (event) => {
        if (window.innerWidth < 768 && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
            setSidebarVisible(false);
        }
    };


    useEffect(() => {
        if (isSidebarVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSidebarVisible]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarVisible(false);
            } else {
                setSidebarVisible(true);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const { adminProfile } = useSelector((state) => state.profile);
    const { adminDetails } = adminProfile || {};
    const dispatch = useDispatch();
    const adminId = sessionStorage.getItem("adminId");

    useEffect(() => {
        if ( 'admin' && adminId) {
            dispatch(fetchAdminProfile(adminId));
        }
    }, [adminId, dispatch]);

    return (
        <div className="h-screen w-screen overflow-hidden flex flex-row">

            {'admin' && (
                <div ref={sidebarRef} className={`${isSidebarVisible ? 'block' : 'hidden'} md:block`}>
                    {isSidebarVisible && <Sidebar  />}
                </div>
            )}
            <div className="flex flex-col flex-1">
                <Header toggleSidebar={toggleSidebar} admin={adminDetails} />
                <div className="flex-1 p-2 min-h-0 overflow-auto">
                    {'admin' && (
                        <Breadcrumbs className='max-w-[15rem] md:max-w-[75rem] sm:max-w-[40rem] lg:max-w-[90rem]' />
                    )}
                    {location.pathname === '/admin' || location.pathname === '/dashboard' ? (
                        <Dashboard />
                    ) : (
                        <div className="min-w-full inline-block align-middle overflow-hidden w-full overflow-x-auto">
                            <Outlet />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
