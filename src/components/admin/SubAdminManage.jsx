
import 'primeicons/primeicons.css';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Menu } from 'primereact/menu';
import { MultiSelect } from 'primereact/multiselect';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { IoMdAdd } from 'react-icons/io';
import { VscClearAll } from 'react-icons/vsc';
import { useDispatch, useSelector } from 'react-redux';
import { createSubAdmin, fetchSectors, fetchSubAdmins, updateSubAdmin } from '../features/subAdminSlice';

const SubAdminManage = () => {
    const dispatch = useDispatch();

    const { sectors, subAdmins } = useSelector((state) => state.subAdmin);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [selectedSectors, setSelectedSectors] = useState([]);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [isViewFormVisible, setIsViewFormVisible] = useState(false);
    const [isEditFormVisible, setIsEditFormVisible] = useState(false);
    const [selectedSubAdmin, setSelectedSubAdmin] = useState(null);
    const [editFormData, setEditFormData] = useState({
        _id: '',
        selectedSectors: [],
    });

    useEffect(() => {
        dispatch(fetchSubAdmins());
        dispatch(fetchSectors());
    }, [dispatch]);

    const handleSectorChange = (e) => {
        setSelectedSectors(e.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name && email && phone && password && selectedSectors.length > 0) {
            const payload = {
                assignedSectorDetails: {
                    sectors: selectedSectors,
                },
                subAdminDetails: {
                    name,
                    email,
                    phone,
                    password,
                },
            };

            dispatch(createSubAdmin(payload))
                .unwrap()
                .then(() => {
                    toast.success('Sub-admin created successfully!');
                    handleClear();
                })
                .catch((err) => {
                    toast.error(`Error: ${err.message}`);
                });
        } else {
            toast.error('All fields are required');
        }
    };

    const handleClear = () => {
        setName('');
        setEmail('');
        setPassword('');
        setSelectedSectors([]);
    };

    const sectorOptions = Array.isArray(sectors) ? sectors?.map(sector => ({
        value: sector._id,
        label: `${sector.name?.toUpperCase()} (${sector.sector_short_name.toUpperCase()})`
    })) : [];

    const sectorItemTemplate = (option) => {
        return (
            <div className="flex align-items-center">
                <span>{option.label}</span>
            </div>
        );
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleEditClick = (rowData) => {
        setEditFormData({
            _id: rowData._id,
            selectedSectors: rowData.assignedSectors.map(sector => sector._id),
        });
        setIsEditFormVisible(true);
    };

    const handleUpdateSectorChange = (e) => {
        setEditFormData({ ...editFormData, selectedSectors: e.value });
    };

    const handleUpdate = (e) => {
        e.preventDefault();

        const payload = {
            sectors: editFormData.selectedSectors,
        };

        dispatch(updateSubAdmin({ payload, subAdminId: editFormData._id }))
            .unwrap()
            .then(() => {
                setIsEditFormVisible(false);
                dispatch(fetchSubAdmins());
            })
            .catch((error) => {
                console.error('Error updating sub-admin:', error);
            });
    };

    const handleDeleteClick = (rowData) => {
        console.log('Delete clicked', rowData);
    };

    const handleView = (rowData) => {
        console.log('View clicked', rowData);
    };

    const handleCopyId = (rowData) => {
        navigator.clipboard.writeText(rowData._id);
        toast.success('TP copied to clipboard');
    };

    const menuRefs = useRef([]);
    const actionBodyTemplate = (rowData, options) => {
        const items = [
            {
                label: 'Update Sectors',
                icon: 'pi pi-pencil',
                command: () => handleEditClick(rowData),

            },
            {
                label: 'Delete',
                icon: 'pi pi-trash',
                command: () => handleDeleteClick(rowData)
            },
            {
                label: 'View',
                icon: 'pi pi-eye',
                command: () => handleView(rowData)
            },
            {
                label: 'Copy PC ID',
                icon: 'pi pi-copy',
                command: () => handleCopyId(rowData)
            }
        ];

        return (
            <>
                <Menu model={items} popup ref={el => menuRefs.current[options.rowIndex] = el} id={`popup_menu_${options.rowIndex}`} />
                <Button icon="pi pi-ellipsis-v" className="p-button-rounded p-button-secondary" onClick={(event) => menuRefs.current[options.rowIndex].toggle(event)} />
            </>
        );
    };

    const assignedSectorsTemplate = (rowData) => {
        return rowData.assignedSectors?.map((sector, index) => (
            <span key={sector._id}>
                {`${sector.sector_short_name.toUpperCase()}`}
                {index < rowData.assignedSectors.length - 1 && ', '}
            </span>
        ));
    };


    return (
        <div className="max-w-[20rem]  xs:max-w-[23rem] sm:max-w-[60rem] my-2  md:max-w-[86rem]  lg:max-w-[100%] xl:w-[100%]
        mx-auto mt-5 p-0 sm:p-2  py-8 bg-white border-2 border-white/10 backdrop-blur-[20px] items-center overflow-hidden duration-200 ease-in-out text-black rounded-lg shadow-lg flex-grow-0 ">
            <style> {` .p-checkbox-box { border: 1px solid ; } `} </style>
            <h2 className="text-xl font-bold mb-4 ml-1  p-2 text-center sm:text-left">Manage Sub-Admins</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="mb-4">
                        <label htmlFor="name" className="mb-1 font-semibold text-md ml-1">Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            placeholder='Enter Sub Admin Name'
                            onChange={(e) => setName(e.target.value)}
                            className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="mb-1 font-semibold text-md ml-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            placeholder='Enter Sub Admin Email'
                            onChange={(e) => setEmail(e.target.value)}
                            className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition w-full"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="phone" className="mb-1 font-semibold text-md ml-1">Phone</label>
                        <input
                            type="text"
                            id="phone"
                            value={phone}
                            placeholder='Enter Sub Admin Phone'
                            onChange={(e) => setPhone(e.target.value)}
                            className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition w-full"
                        />
                    </div>
                    <div className="mb-4 relative">
                        <label htmlFor="password" className="mb-1 font-semibold text-md ml-1">Password</label>
                        <input
                            type={passwordVisible ? 'text' : 'password'}
                            id="password"
                            value={password}
                            placeholder='Enter Sub Admin Password'
                            onChange={(e) => setPassword(e.target.value)}
                            className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition w-full"
                        />
                        <span
                            onClick={togglePasswordVisibility}
                            className="absolute text-xl right-5 top-9 cursor-pointer text-gray-500"
                        >
                            {passwordVisible ? <FaEye /> : <FaEyeSlash />}
                        </span>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="sectors" className="mb-1 font-semibold text-md ml-1">Assign Sectors</label>
                        <MultiSelect
                            id="sectors"
                            value={selectedSectors}
                            options={sectorOptions}
                            onChange={handleSectorChange}
                            className="w-full px-3 text-sm border-2 border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            display="chip"
                            placeholder="Select Sectors"
                            filter
                            itemTemplate={sectorItemTemplate}
                        />
                    </div>
                </div>

                <div className="flex space-x-4">
                    <button type="submit" className="w-32 py-2 text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-md text-sm px-5 text-center me-2 mb-2 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 flex items-center justify-center">  <span className='pr-2'><IoMdAdd className='w-5 h-5' /></span>    <span>Add</span></button>
                    <button type="button" onClick={handleClear} className="w-32 py-2 text-white bg-gray-600 hover:bg-gray-700 focus:ring-blue-300 shadow-lg shadow-gray-500/50 dark:shadow-lg dark:shadow-gray-800/80 font-medium rounded-md text-sm px-5 text-center me-2 mb-2 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 flex items-center justify-center">
                        <span className='pr-2'><VscClearAll className='w-5 h-5' /></span>
                        <span>Clear</span>
                    </button>
                </div>
            </form>
            {selectedSubAdmin && (
                <Dialog header="Sub Admin Details" visible={isViewFormVisible} style={{ width: '50vw' }} onHide={() => setIsViewFormVisible(false)}>
                    <div>
                        <p><strong> ID:</strong> {selectedSubAdmin._id}</p>
                        <p><strong> Name:</strong> {selectedSubAdmin.name}</p>
                        <p><strong>Email:</strong> {selectedSubAdmin.email}</p>
                        <p><strong>Contact:</strong> {selectedSubAdmin.phone}</p>
                        <p><strong>Address:</strong> {selectedSubAdmin.address}</p>
                        <p><strong>Sectors:</strong> {selectedSubAdmin.sectors.map(sector => sector.name).join(', ')}</p>

                    </div>
                </Dialog>
            )}

            <Dialog header="Edit Assessor" visible={isEditFormVisible} style={{ width: '50vw' }} onHide={() => setIsEditFormVisible(false)}>
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                        <div className="flex flex-col">
                            <label htmlFor="sectors" className="mb-1 font-semibold text-md ml-1">Select Sectors</label>
                            <MultiSelect
                                id="sectors"
                                value={editFormData.selectedSectors}
                                options={sectorOptions}
                                onChange={handleUpdateSectorChange}
                                className="w-full px-3 text-sm border-2 border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                display="chip"
                                placeholder="Select Sectors"
                                filter
                                itemTemplate={sectorItemTemplate}
                            />
                        </div>
                    </div>
                    <div className="flex space-x-4 mt-4">
                        <button type="submit" className="w-28 py-2 text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-md shadow-purple-400/50 dark:shadow-xl dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 text-center me-2 mb-2 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110">
                            Update
                        </button>

                        <button type="button" onClick={() => setIsEditFormVisible(false)} className="w-28 py-2 text-white bg-red-600 hover:bg-red-700 focus:ring-red-300 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-md text-sm px-5 text-center me-2 mb-2 transition-all duration-200 ease-in-out transform hover:-translate-y-1 hover:scale-110">Close</button>
                    </div>
                </form>
            </Dialog>


            <div className=" overflow-x-auto sm:w-full md:w-[100%] xl:w-full mt-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Sub Admins List</h3>

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
                <div className="max-w-[100%] p-1  sm:max-w-full  md:max-w-full lg:max-w-[100%]">
                    <DataTable value={subAdmins}
                        paginator rows={10}
                        rowsPerPageOptions={[5, 10, 20, 50]}
                        responsiveLayout="scroll"
                        scrollable={true}
                        globalFilter={globalFilter}
                        className="min-w-full bg-white border border-gray-200">
                        <Column body={actionBodyTemplate} header="Actions" className="py-2 px-4 border-b" />
                        <Column field="_id" header="Id" className="py-2 px-4 border-b " />
                        <Column field="name" header=" Name" className="py-2 px-4 border-b" />
                        <Column field="email" header="Email" className="py-2 px-4 border-b" />
                        <Column body={assignedSectorsTemplate} header="Assigned Sectors" className="py-2 px-4 border-b" />

                    </DataTable>
                </div>

            </div>

        </div>
    );
};

export default SubAdminManage;