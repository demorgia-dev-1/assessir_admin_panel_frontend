import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Menu } from 'primereact/menu';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { IoMdAdd } from 'react-icons/io';
import { VscClearAll } from 'react-icons/vsc';
import { useDispatch, useSelector } from 'react-redux';
import { createCompany, fetchCompanies } from '../features/companySlice';

const ManageCompany = () => {
    const [companyName, setCompanyName] = useState('');
    const [companyPhone, setCompanyPhone] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');
    const [adminName, setAdminName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [adminPhone, setAdminPhone] = useState('');
    const [globalFilter, setGlobalFilter] = useState('');
    const dispatch = useDispatch();
    const { companies, totalCompanies } = useSelector(state => state.company);


    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const validatePhone = (phone) => {
        const re = /^\d{10}$/;
        return re.test(String(phone));
    };

    const validatePassword = (password) => {
        return password.length >= 8;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!companyName) {
            toast.error('Company Name is required');
            return;
        }
        if (companyPhone && !validatePhone(companyPhone)) {
            toast.error('Invalid Company Phone');
            return;
        }
        if (!adminName) {
            toast.error('Admin Name is required');
            return;
        }
        if (adminEmail && !validateEmail(adminEmail)) {
            toast.error('Invalid Admin Email');
            return;
        }
        if (adminPhone && !validatePhone(adminPhone)) {
            toast.error('Invalid Admin Phone');
            return;
        }
        if (!adminPassword || !validatePassword(adminPassword)) {
            toast.error('Admin Password must be at least 8 characters long');
            return;
        }

        const newCompany = {
            company: {
                name: companyName,
                phone: companyPhone,
                address: companyAddress
            },
            companyAdmin: {
                name: adminName,
                email: adminEmail,
                phone: adminPhone,
                password: adminPassword
            }
        };

        dispatch(createCompany(newCompany));
        dispatch(fetchCompanies());
        handleClear();
    };

    const handleClear = () => {
        setCompanyName('');
        setCompanyPhone('');
        setCompanyAddress('');
        setAdminName('');
        setAdminEmail('');
        setAdminPassword('');
    };

    useEffect(() => {
        dispatch(fetchCompanies());
    }, [dispatch]);

    const handleEdit = (rowData) => {
        console.log('Edit:', rowData);
    };

    const handleDelete = (id) => {
        console.log('Delete:', id);
    };

    const handleView = (rowData) => {
        console.log('View:', rowData);
    };

    const menu = useRef(null);
    const actionBodyTemplate = (rowData) => {
        const items = [
            {
                label: 'Edit',
                icon: 'pi pi-pencil',
                command: () => handleEdit(rowData)
            },
            {
                label: 'Delete',
                icon: 'pi pi-trash',
                command: () => handleDelete(rowData._id)
            },
            {
                label: 'View',
                icon: 'pi pi-eye',
                command: () => handleView(rowData)
            }
        ];

        return (
            <>
                <Menu model={items} popup ref={menu} id="popup_menu" />
                <Button icon="pi pi-ellipsis-v" className="p-button-rounded p-button-secondary" onClick={(event) => menu.current.toggle(event)} aria-haspopup="true" aria-controls="popup_menu" />
            </>
        );
    }

    console.log('companies:', companies);
    const adminNameTemplate = (rowData) => {
        return rowData.admin && rowData.admin.length > 0 ? rowData.admin[0].name : 'N/A';
    };

    const adminEmailTemplate = (rowData) => {
        return rowData.admin && rowData.admin.length > 0 ? rowData.admin[0].email : 'N/A';
    };

    const adminPhoneTemplate = (rowData) => {
        return rowData.admin && rowData.admin.length > 0 ? rowData.admin[0].phone : 'N/A';
    };


    return (
<div className="max-w-[23rem] my-2bg-white p-1 md:max-w-[86rem] sm:max-w-[50rem] lg:max-w-[90rem]
        mx-auto mt-5 p-0 sm:p-2  py-8 bg-white border-2 border-white/10 backdrop-blur-[20px] items-center overflow-hidden duration-200 ease-in-out text-black rounded-lg shadow-lg flex-grow-0 xl:w-[100%]">
                            <h2 className="text-xl font-bold mb-4 ml-1">Manage Company</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col space-y-4 my-5 mx-2">
            <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4 bg-white rounded-lg px-1 py-2 pb-5">

                    <div className="flex flex-col flex-1 mt-3">
                        <label htmlFor="companyname" className="mb-1 font-semibold text-sm ml-1">Company Name</label>
                        <input
                            type="text"
                            id="companyname"
                            value={companyName}
                            placeholder="Enter Company Name"
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="px-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-transparent border-2 text-sm"
                            required
                        />
                    </div>

                    <div className="flex flex-col flex-1 mt-3">
                        <label htmlFor="companyphone" className="mb-1 font-semibold text-sm ml-1">Company Phone</label>
                        <input
                            type="text"
                            id="companyphone"
                            value={companyPhone}
                            placeholder="Enter Company Phone"
                            onChange={(e) => setCompanyPhone(e.target.value)}
                            className="px-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-transparent border-2 text-sm"
                        />
                    </div>
                    <div className="flex flex-col flex-1 mt-3">
                        <label htmlFor="companyaddress" className="mb-1 font-semibold text-sm ml-1">Company Address</label>
                        <input
                            type="text"
                            id="companyaddress"
                            value={companyAddress}
                            placeholder="Enter Company Address"
                            onChange={(e) => setCompanyAddress(e.target.value)}
                            className="px-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-transparent border-2 text-sm"
                        />
                    </div>

                    <div className="flex flex-col flex-1 mt-3 !ml-0">
                        <label htmlFor="adminname" className="mb-1 font-semibold text-sm ml-1">Admin Name</label>
                        <input
                            type="text"
                            id="adminname"
                            value={adminName}
                            placeholder="Enter Admin Name"
                            onChange={(e) => setAdminName(e.target.value)}
                            className="px-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-transparent border-2 text-sm"
                            required
                        />
                    </div>
                    <div className="flex flex-col flex-1 mt-3">
                        <label htmlFor="adminemail" className="mb-1 font-semibold text-sm ml-1">Admin Email</label>
                        <input
                            type="text"
                            id="adminemail"
                            value={adminEmail}
                            placeholder="Enter Admin Email"
                            onChange={(e) => setAdminEmail(e.target.value)}
                            className="px-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-transparent border-2 text-sm"
                        />
                    </div>
                    <div className="flex flex-col flex-1 mt-3">
                        <label htmlFor="phone" className="mb-1 font-semibold text-sm ml-1">Admin Phone</label>
                        <input
                            type="text"
                            id="phone"
                            value={adminPhone}
                            placeholder="Enter Admin Phone"
                            onChange={(e) => setAdminPhone(e.target.value)}
                            className="px-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-transparent border-2 text-sm"
                        />
                    </div>
                    <div className="flex flex-col flex-1 mt-3 !ml-0">
                        <label htmlFor="adminpassword" className="mb-1 font-semibold text-sm ml-1">Admin Password</label>
                        <input
                            type="password"
                            id="adminpassword"
                            value={adminPassword}
                            placeholder="Enter Admin Password"
                            onChange={(e) => setAdminPassword(e.target.value)}
                            className="px-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-transparent border-2 text-sm"
                            required
                        />
                    </div>
                </div>
                <div className="flex space-x-4">
                    <button type="submit" className="flex w-full sm:w-auto py-3 text-white bg-purple-600 hover:bg-purple-700 focus:ring-blue-300 shadow-lg font-medium rounded-lg text-sm px-9 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110">
                        <span className='pr-2 pt-1'><IoMdAdd /></span>
                        <span>Add</span>
                    </button>
                    <button type="button" onClick={handleClear} className="flex w-full sm:w-auto py-3 text-white bg-gray-600 hover:bg-gray-700 focus:ring-blue-300 shadow-lg font-medium rounded-lg text-sm px-9 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110">
                        <span className='pr-2 pt-1'><VscClearAll /></span>
                        <span>Clear</span>
                    </button>
                </div>
                </div>
            </form>
            <div className="min-w-full inline-block align-middle overflow-x-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <h3 className="text-xl font-bold">Company List</h3>

                    <span className="p-input-icon-left w-full sm:w-auto">
                        <i className="pi pi-search px-2" />
                        <InputText
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Search..."
                            className=" px-10 w-full sm:w-72 rounded-md"
                        />
                    </span>
                </div>
                <div className="max-w-[24rem] p-2  md:max-w-[86rem] sm:max-w-[50rem] lg:max-w-[90rem]">
                    <DataTable
                        value={companies}
                        paginator rows={10}
                        rowsPerPageOptions={[5, 10, 20, 50]}
                        responsiveLayout="scroll"
                        scrollable={true}
                        globalFilter={globalFilter}
                        className="min-w-full bg-white border border-gray-200"
                    >
                        <Column body={actionBodyTemplate} header="Actions" className="py-2 px-4 border-b" />
                        <Column field="name" header="Company Name" className="py-2 px-4 border-b" />
                        <Column field="phone" header="Company Phone" className="py-2 px-4 border-b" />
                        <Column field="address" header="Company Address" className="py-2 px-4 border-b" />
                        <Column body={adminNameTemplate} header="Admin Name" className="py-2 px-4 border-b" />
                        <Column body={adminEmailTemplate} header="Admin Email" className="py-2 px-4 border-b" />
                        <Column body={adminPhoneTemplate} header="Admin Phone" className="py-2 px-4 border-b" />

                    </DataTable>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 p-4 gap-4">
                <span className="font-medium text-lg">Total Records: {totalCompanies}</span>
            </div>
        </div>
    );
};

export default ManageCompany;