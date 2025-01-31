
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { FaRegUser } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { GrDocumentText } from "react-icons/gr";
import { IoSettingsOutline } from 'react-icons/io5';
import { MdBatchPrediction } from "react-icons/md";
import { RxDashboard } from 'react-icons/rx';
import { TbReportSearch } from "react-icons/tb";
import { Link } from 'react-router-dom';
import logo from '../assets/dashboardlogo.png';
import './Sidebar.css';

const Sidebar = ({ userType }) => {
    const [dropdownOpen, setDropdownOpen] = useState({ admin: false, credit: false, evidence: false, superAdmin: false, user: false, batch: false, assessor: false, reports: false });

    const toggleDropdown = (dropdown) => {
        setDropdownOpen((prevState) => ({
            ...prevState,
            [dropdown]: !prevState[dropdown],
        }));
    };

    const renderCompanyAdminContent = () => (
        <>
            <Link
                to="/dashboard"
                className="flex items-center p-3 pl-6 text-sm md:text-sm hover:bg-transparent cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
            >
                <span className="font-bold">
                    <RxDashboard />
                </span>
                <span className="pl-2 md:pl-4">Dashboard</span>
            </Link>
            <div
                className="flex items-center p-3 pl-6 hover:bg-transparent cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 text-sm"
                onClick={() => toggleDropdown('admin')}
            >
                <span className="text-sm font-bold md:text-md">
                    <IoSettingsOutline />
                </span>
                <span className="pl-2 md:pl-4 pr-10 md:pr-[100px]">Content</span>
                {dropdownOpen.admin ? (
                    <ChevronUpIcon className="w-4 h-4 md:w-6 md:h-6" />
                ) : (
                    <ChevronDownIcon className="w-4 h-4 md:w-6 md:h-6" />
                )}
            </div>
            {dropdownOpen.admin && (
                <ul className="pl-4 pr-4 pb-4 transition-all duration-300 ease-in-out">
                    <Link to="/manageJobRole">
                        <li className="px-3 py-2 md:px-4 md:py-3 hover:bg-purple-600 cursor-pointer border-l-2 border-white/10 ml-4 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 hover:rounded-lg text-xs md:text-sm">
                            Manage Job Role
                        </li>
                    </Link>
                    <Link to="/manageNOSDetails">
                        <li className="px-3 py-2 md:px-4 md:py-3 hover:bg-purple-600 cursor-pointer border-l-2 border-white/10 ml-4 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 hover:rounded-lg text-xs md:text-sm">
                            Manage NOS
                        </li>
                    </Link>
                    <Link to="/managePC">
                        <li className="px-3 py-2 md:px-4 md:py-3 hover:bg-purple-600 cursor-pointer border-l-2 border-white/10 ml-4 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 hover:rounded-lg text-xs md:text-sm">
                            Manage PC
                        </li>
                    </Link>
                    <Link to="/manageQuestionSet">
                        <li className="px-3 py-2 md:px-4 md:py-3 hover:bg-purple-600 cursor-pointer border-l-2 border-white/10 ml-4 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 hover:rounded-lg text-xs md:text-sm">
                            Question Set
                        </li>
                    </Link>
                    <Link to="/manageQuestion">
                        <li className="px-3 py-2 md:px-4 md:py-3 hover:bg-purple-600 cursor-pointer border-l-2 border-white/10 ml-4 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 hover:rounded-lg text-xs md:text-sm">
                            Add Question
                        </li>
                    </Link>

                </ul>
            )}


            <div
                className="flex items-center p-3 pl-6 hover:bg-transparent cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 text-sm"
                onClick={() => toggleDropdown('batch')}
            >
                <span className="text-sm md:text-md font-bold">
                    <MdBatchPrediction />
                </span>
                <span className="pl-2 md:pl-4 pr-20 md:pr-[118px]">Batch</span>
                {dropdownOpen.batch ? (
                    <ChevronUpIcon className="w-4 h-4 md:w-6 md:h-6" />
                ) : (
                    <ChevronDownIcon className="w-4 h-4 md:w-6 md:h-6" />
                )}
            </div>
            {dropdownOpen.batch && (
                <ul className="pl-4 pr-4 pb-4">
                    <Link to="/manageBatch">
                        <li className="px-3 py-2 md:px-4 md:py-3 hover:bg-purple-600 cursor-pointer border-l-2 border-white/10 ml-4 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 hover:rounded-lg text-xs md:text-sm">
                            Manage Batch
                        </li>
                    </Link>

                    <Link to="/assignBatch">
                        <li className="px-3 py-2 md:px-4 md:py-3 hover:bg-purple-600 cursor-pointer border-l-2 border-white/10 ml-4 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 hover:rounded-lg text-xs md:text-sm">
                            Assign Batch
                        </li>
                    </Link>
                </ul>
            )}
            {userType !== 'sub-admin' && (
                <>
                    <div
                        className="flex items-center p-3 pl-6 hover:bg-transparent cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 text-sm"
                        onClick={() => toggleDropdown('user')}
                    >
                        <span className="text-sm md:text-md font-bold">
                            <FaRegUser />
                        </span>
                        <span className="pl-2 md:pl-4 pr-20 md:pr-[126px]">User</span>
                        {dropdownOpen.user ? (
                            <ChevronUpIcon className="w-4 h-4 md:w-6 md:h-6" />
                        ) : (
                            <ChevronDownIcon className="w-4 h-4 md:w-6 md:h-6" />
                        )}
                    </div>
                    {dropdownOpen.user && (
                        <ul className="pl-4 pr-4 pb-4">
                            <Link to="/manageSubAdmin">
                                <li className="px-3 py-2 md:px-4 md:py-3 hover:bg-purple-600 cursor-pointer border-l-2 border-white/10 ml-4 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 hover:rounded-lg text-xs md:text-sm">
                                    Sub Admin
                                </li>
                            </Link>
                            <Link to="/manageTP">
                                <li className="px-3 py-2 md:px-4 md:py-3 hover:bg-purple-600 cursor-pointer border-l-2 border-white/10 ml-4 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 hover:rounded-lg text-xs md:text-sm">
                                    Training Partner
                                </li>
                            </Link>
                            <Link to="/manageTc">
                                <li className="px-3 py-2 md:px-4 md:py-3 hover:bg-purple-600 cursor-pointer border-l-2 border-white/10 ml-4 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 hover:rounded-lg text-xs md:text-sm">
                                    Training Center
                                </li>
                            </Link>
                            <Link to="/manageAssessor">
                                <li className="px-3 py-2 md:px-4 md:py-3 hover:bg-purple-600 cursor-pointer border-l-2 border-white/10 ml-4 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 hover:rounded-lg text-xs md:text-sm">
                                    Assessor
                                </li>
                            </Link>
                            <Link to="/manageCandidate">
                                <li className="px-3 py-2 md:px-4 md:py-3 hover:bg-purple-600 cursor-pointer border-l-2 border-white/10 ml-4 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 hover:rounded-lg text-xs md:text-sm">
                                    Candidate
                                </li>
                            </Link>
                        </ul>
                    )}
                </>
            )}

            {userType === 'sub-admin' && (

                <>
                    <div
                        className="flex items-center p-3 pl-6 hover:bg-transparent cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 text-sm"
                        onClick={() => toggleDropdown('user')}
                    >
                        <span className="text-sm md:text-md font-bold">
                            <FaRegUser />
                        </span>
                        <span className="pl-2 md:pl-4 pr-20 md:pr-[126px]">User</span>
                        {dropdownOpen.user ? (
                            <ChevronUpIcon className="w-4 h-4 md:w-6 md:h-6" />
                        ) : (
                            <ChevronDownIcon className="w-4 h-4 md:w-6 md:h-6" />
                        )}
                    </div>
                    {dropdownOpen.user && (
                        <ul className="pl-4 pr-4 pb-4">
                            <Link to="/manageTP">
                                <li className="px-3 py-2 md:px-4 md:py-3 hover:bg-purple-600 cursor-pointer border-l-2 border-white/10 ml-4 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 hover:rounded-lg text-xs md:text-sm">
                                    Training Partner
                                </li>
                            </Link>
                            <Link to="/manageTc">
                                <li className="px-3 py-2 md:px-4 md:py-3 hover:bg-purple-600 cursor-pointer border-l-2 border-white/10 ml-4 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 hover:rounded-lg text-xs md:text-sm">
                                    Training Center
                                </li>
                            </Link>
                            <Link to="/manageAssessor">
                                <li className="px-3 py-2 md:px-4 md:py-3 hover:bg-purple-600 cursor-pointer border-l-2 border-white/10 ml-4 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 hover:rounded-lg text-xs md:text-sm">
                                    Assessor
                                </li>
                            </Link>
                            <Link to="/manageCandidate">
                                <li className="px-3 py-2 md:px-4 md:py-3 hover:bg-purple-600 cursor-pointer border-l-2 border-white/10 ml-4 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 hover:rounded-lg text-xs md:text-sm">
                                    Candidate
                                </li>
                            </Link>
                        </ul>
                    )}
                </>
            )}
            <div className="flex items-center p-3 pl-6 hover:bg-transparent cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 text-sm" onClick={() => toggleDropdown('evidence')}>
                <span className="text-sm md:text-md font-bold">
                    <GrDocumentText />
                </span>
                <span className="pl-2 md:pl-4 md:pr-[100px]">Evidence</span>
                {dropdownOpen.evidence ? (
                    <ChevronUpIcon className="w-5 h-5 md:w-6 md:h-6" />
                ) : (
                    <ChevronDownIcon className="w-5 h-5 md:w-6 md:h-6" />
                )}
            </div>

            {dropdownOpen.evidence && (
                <ul className="pl-3 pr-2 md:pl-5 md:pr-4 pb-4">
                    <Link to="/batchEvidence">
                        <li className="px-3 py-2 md:px-4 md:py-3 hover:bg-purple-600 cursor-pointer border-l-2 border-white/10 ml-4 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 hover:rounded-lg text-xs md:text-sm">
                            Batch
                        </li>
                    </Link>

                    <Link to="/assessorEvidence">
                        <li className="px-3 py-2 md:px-4 md:py-3 hover:bg-purple-600 cursor-pointer border-l-2 border-white/10 ml-4 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 hover:rounded-lg text-xs md:text-sm">
                            Assessor
                        </li>
                    </Link>

                </ul>
            )}

            <div className="flex items-center p-3 pl-6 hover:bg-transparent cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 text-sm" onClick={() => toggleDropdown('reports')}>
                <span className="text-sm md:text-lg font-bold">
                    <TbReportSearch />
                </span>
                <span className="pl-2 md:pl-4 md:pr-[104px]">Reports</span>
                {dropdownOpen.reports ? (
                    <ChevronUpIcon className="w-5 h-5 md:w-6 md:h-6" />
                ) : (
                    <ChevronDownIcon className="w-5 h-5 md:w-6 md:h-6" />
                )}
            </div>

            {dropdownOpen.reports && (
                <ul className="pl-3 pr-2 md:pl-5 md:pr-4 pb-4">
                    <Link to="/batchResult">
                        <li className="px-3 py-2 md:px-4 md:py-3 hover:bg-purple-600 cursor-pointer border-l-2 border-white/10 ml-4 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 hover:rounded-lg text-xs md:text-sm">
                            Batch Result
                        </li>
                    </Link>

                    <Link to="/summary-report">
                        <li className="px-3 py-2 md:px-4 md:py-3 hover:bg-purple-600 cursor-pointer border-l-2 border-white/10 ml-4 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 hover:rounded-lg text-xs md:text-sm">
                            Summary Report
                        </li>
                    </Link>

                    <Link to="/batchAnalytics">
                        <li className="px-3 py-2 md:px-4 md:py-3 hover:bg-purple-600 cursor-pointer border-l-2 border-white/10 ml-4 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 hover:rounded-lg text-xs md:text-sm">
                            Batch Analytics
                        </li>
                        </Link>
                </ul>
            )}
        </>
    );

    return (
        <div className="flex flex-col justify-between h-[96%] w-full md:w-64 bg-gradient-to-r from-slate-900 to-slate-800 border-2 border-white/10 backdrop-blur-[20px] shadow-[0_0_10px_rgba(0,0,0,0.2)] items-center overflow-hidden duration-200 ease-in-out text-white my-4 ml-4 rounded-lg overflow-y-scroll custom-scrollbar max-w-auto">
            <div>
                <div className="sticky top-2 z-1 ">
                    <img src={logo} alt="Logo" className="h-14 w-auto p-0 m-4 mx-auto" />
                </div>
                { 'admin' && renderCompanyAdminContent()}
            </div>

            <div className="border-t border-gray-500 w-full mb-6">
                {'admin' && (<Link to="/logout" className=''>
                    <div className="mt-7 px-16 py-4 hover:bg-transparent cursor-pointer ml-5 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 hover:rounded-lg relative inline-flex items-center justify-center mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 ">
                        <span className="font-bold text-xl">
                            <FiLogOut />
                        </span>
                        <span className="pl-4">Logout</span>
                    </div>
                </Link>
                )}
  <p className='text-center text-sm text-gray-400'>Powered by AssessiR 2024</p>
              </div>

        </div>
    );
};

export default Sidebar;