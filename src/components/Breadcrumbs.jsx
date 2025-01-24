import { GoChevronRight } from 'react-icons/go';
import { IoHome } from 'react-icons/io5';
import { Link, useLocation } from 'react-router-dom';
import { belongsTo } from '../components/utils/breadacrumbs';

const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(x => x);
    return (
        <nav aria-label="Breadcrumb" className="p-2">
            <ol className="flex flex-wrap items-center space-x-2 text-gray-500 text-xs sm:text-sm md:text-base">
                <li className="flex items-center">
                    <IoHome className="h-4 w-4 text-gray-500 mr-1 sm:h-5 sm:w-5" aria-hidden="true" />
                    {('admin') && (
                        <Link to="/dashboard" className="text-gray-500 hover:underline">
                            Home
                        </Link>)}
                </li>
                {pathnames.length > 0 && (
                    <GoChevronRight className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5 mx-2" aria-hidden="true" />
                )}
                {pathnames.map((value, index) => {
                    const path = `/${pathnames.slice(0, index + 1).join('/')}`;

                    return (
                        <li key={path} className="flex items-center">
                            {belongsTo(path)}
                            {index < pathnames.length - 1 && (
                                <GoChevronRight className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5 mx-2" aria-hidden="true" />
                            )}
                            <Link to={path} className="text-gray-500 hover:underline">
                                {value.charAt(0).toUpperCase() + value.slice(1)}
                            </Link>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;