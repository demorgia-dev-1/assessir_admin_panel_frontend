import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Menu } from 'primereact/menu';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FaEdit } from 'react-icons/fa';
import { IoMdAdd, IoMdClose } from 'react-icons/io';
import { VscClearAll } from 'react-icons/vsc';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { fetchCitiesByStateId } from '../features/citySlice';
import { fetchAllCountries } from '../features/countrySlice';
import { fetchStates } from '../features/stateSlice';
import { createTc, fetchTcs, setSelectedCity, setSelectedCountry, setSelectedState, setSelectedTp, updateTc } from '../features/tcSlice';
import { fetchTps } from '../features/tpSlice';

const ManageTc = () => {
    const [tcName, setTcName] = useState('');
    const [globalFilter, setGlobalFilter] = useState('');
    const [tcAddress, setTcAddress] = useState('');
    const [tcId, setTcId] = useState('');
    const [tcPhone, setTcPhone] = useState('');
    const [tcEmail, setTcEmail] = useState('');
    const [isEditFormVisible, setIsEditFormVisible] = useState(false);
    const [isViewFormVisible, setIsViewFormVisible] = useState(false);

    const [viewData, setViewData] = useState(null);

    const [editFormData, setEditFormData] = useState({
        _id: '',
        tp: '',
        tcId: '',
        name: '',
        phone: '',
        email: '',
        address: '',

    });
    const dispatch = useDispatch();

    const { countries, states, cities, selectedCountry, selectedState, selectedCity, selectedTp, tcs } = useSelector(state => state.tc);

    const { tps } = useSelector(state => state.tp);

    const saveFormData = () => {
        const formData = {
            selectedCountry, selectedState, selectedCity, selectedTp,
            tcName, tcAddress, tcId, tcPhone, tcEmail
        };
        localStorage.setItem('tcFormData', JSON.stringify(formData));
    };

    const loadFormData = () => {
        const formData = JSON.parse(localStorage.getItem('tcFormData'));
        if (formData) {
            dispatch(setSelectedCountry(formData.selectedCountry));
            dispatch(setSelectedState(formData.selectedState));
            dispatch(setSelectedCity(formData.selectedCity));
            dispatch(setSelectedTp(formData.selectedTp));

        }
    };

    useEffect(() => {
        loadFormData();
    }, []);

    useEffect(() => {
        saveFormData();
    }, [selectedCountry, selectedState, selectedCity, selectedTp]);


    useEffect(() => {
        dispatch(fetchAllCountries());
    }, [dispatch]);

    useEffect(() => {
        if (selectedCountry) {
            dispatch(fetchStates(selectedCountry._id));
        }
    }, [selectedCountry, dispatch]);

    useEffect(() => {
        if (selectedState) {
            dispatch(fetchCitiesByStateId(selectedState._id));
        }
    }, [selectedState, dispatch]);

    useEffect(() => {
        if (selectedCity) {
            dispatch(fetchTcs(selectedCity._id));
        }
    }, [selectedCity, dispatch]);

    useEffect(() => {
        if (selectedCity) {
            dispatch(fetchTps());
        }
    }, [dispatch, selectedCity]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedCountry && selectedState && selectedCity) {
            const newTc = {
                country: selectedCountry._id,
                state: selectedState._id,
                city: selectedCity._id,
                tp: selectedTp._id,
                tcId: tcId,
                name: tcName,
                phone: tcPhone,
                email: tcEmail,
                address: tcAddress,
            };
            const tpId = selectedTp._id;

            dispatch(createTc({ newTc, tpId }))
                .unwrap()
                .then(() => {
                    setTcName('');
                    setTcAddress('');
                    setTcId('');
                    setTcPhone('');
                    setTcEmail('');
                })
                .catch((error) => {

                    console.error('Error creating TC:', error);
                });
        }
    };

    const handleClear = () => {
        setTcName('');
        setTcAddress('');
        setTcId('');
        setTcPhone('');
        setTcEmail('');
        dispatch(setSelectedState(null));
        dispatch(setSelectedCity(null));
        localStorage.removeItem('tcFormData');
    };

    const handleCreateTP = () => {
        window.location.href = '/manageTP';
    };

    const handleCountryChange = (selectedOption) => {
        const country = selectedOption ? countries.find(c => c._id === selectedOption.value) : null;
        dispatch(setSelectedCountry(country));
    };

    const handleStateChange = (selectedOption) => {
        const state = selectedOption ? states.find(s => s._id === selectedOption.value) : null;
        dispatch(setSelectedState(state));
    };

    const handleCityChange = (selectedOption) => {
        const city = selectedOption ? cities.find(c => c._id === selectedOption.value) : null;
        dispatch(setSelectedCity(city));
    };

    const handleTPSChange = (e) => {
        const tpId = e.target.value;
        const tp = tps.find(c => c._id === tpId);
        dispatch(setSelectedTp(tp));

    };
    const handleEditClick = (rowData) => {
        setEditFormData({
            _id: rowData._id,
            tp: rowData.tp,
            tcId: rowData.tcId,
            name: rowData.name,
            phone: rowData.phone,
            email: rowData.email,
            address: rowData.address,
        });
        setIsEditFormVisible(true);
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        console.log(`Changing ${name} to ${value}`);
        setEditFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        console.log('Updated editFormData:', { ...editFormData, [name]: value });
    };
    const handleEditFormSubmit = async (e) => {
        e.preventDefault();

        const { _id, ...updatedTc } = {
            ...editFormData,
        };

        console.log('Submitting Update for NOS:', updatedTc);
        const resultAction = await dispatch(updateTc({ _id, updatedTc }));
        if (updateTc.fulfilled.match(resultAction)) {

            setIsEditFormVisible(false);
            dispatch(fetchTcs(selectedCity._id));
        }
    };

    const handleView = (rowData) => {
        setViewData(rowData);
        setIsViewFormVisible(true);
    };



    const handleCopyId = (rowData) => {
        if (rowData && rowData._id) {
            navigator.clipboard.writeText(rowData._id);
            toast.success('TC ID copied to clipboard!');
        }
    };



    const menuRefs = useRef([]);
    const actionBodyTemplate = (rowData, options) => {
        const items = [
            {
                label: 'Edit',
                icon: 'pi pi-pencil',
                command: () => handleEditClick(rowData),

            },

            {
                label: 'View',
                icon: 'pi pi-eye',
                command: () => handleView(rowData)
            },
            {
                label: 'Copy TC ID',
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

    useEffect(() => {
        const india = countries.find(c => c.name === 'india');
        if (india) {
            dispatch(setSelectedCountry(india));
        }
    }, [countries, dispatch]);

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            borderColor: state.isFocused ? '#4F46E5' : '#D1D5DB',
            boxShadow: state.isFocused ? '0 0 0 2px rgba(79, 70, 229, 0.5)' : 'none',
            '&:hover': {
                borderColor: '#4F46E5',
            },
            borderRadius: '0.5rem',
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: '0.5rem',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#4F46E5' : state.isFocused ? '#E0E7FF' : 'white',
            color: state.isSelected ? 'white' : 'black',
            '&:hover': {
                backgroundColor: '#E0E7FF',
            },
        }),
    };
    return (
        <div className="max-w-[20rem]  xs:max-w-[23rem] sm:max-w-[60rem] my-2  md:max-w-[86rem]  lg:max-w-[100%] xl:w-[100%]
        mx-auto mt-5 p-0 sm:p-2  py-8 bg-white border-2 border-white/10 backdrop-blur-[20px] items-center overflow-hidden duration-200 ease-in-out text-black rounded-lg shadow-lg flex-grow-0 ">
            <h2 className="text-xl font-bold mb-4 ml-1  p-2 text-center sm:text-left">Manage Training Center</h2>

            <form onSubmit={handleSubmit} className="space-y-4 my-5">
                <div className="grid grid-cols-1 md:grid-cols-3 p-2 gap-4 rounded-lg py-2 pb-6">

                    <div className="flex flex-col">
                        <label htmlFor="country" className="mb-1 font-semibold text-base md:text-md sm:text-sm lg:text-md ml-1">Select Country</label>
                        <Select
                            id="country"
                            value={selectedCountry ? { value: selectedCountry._id, label: selectedCountry.name.toUpperCase() } : null}
                            options={countries.map(c => ({ value: c._id, label: c.name.toUpperCase() }))}
                            onChange={handleCountryChange}
                            className="w-full text-sm border-2 border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            placeholder="Select Country"
                            isClearable
                            styles={customStyles}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="state" className="mb-1 font-semibold text-base sm:text-sm md:text-md lg:text-md ml-1">Select State</label>
                        <Select
                            id="state"
                            value={selectedState ? { value: selectedState._id, label: selectedState.name.toUpperCase() } : null}
                            options={states.map(s => ({ value: s._id, label: s.name.toUpperCase() }))}
                            onChange={handleStateChange}
                            className="w-full text-sm border-2 border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            placeholder="Select State"
                            isClearable
                            styles={customStyles}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="city" className="mb-1 font-semibold text-base sm:text-sm md:text-md lg:text-md ml-1">Select City</label>
                        <Select
                            id="city"
                            value={selectedCity ? { value: selectedCity._id, label: selectedCity.name.toUpperCase() } : null}
                            options={cities.map(c => ({ value: c._id, label: c.name.toUpperCase() }))}
                            onChange={handleCityChange}
                            className="w-full text-sm border-2 border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            placeholder="Select City"
                            isClearable
                            styles={customStyles}
                        />
                    </div>

                    <div className="flex flex-col flex-1">
                        <label htmlFor="tps" className="mb-1 font-semibold text-base md:text-md sm:text-sm lg:text-md ml-1">Select Training Partner</label>
                        <div className="flex items-center">
                            <Dropdown
                                id="tps"
                                value={selectedTp ? selectedTp._id : null}
                                options={tps.filter(c => c.tpId).map(c => ({ label: `${c.tpId}-${c.name}`, value: c._id }))}
                                onChange={handleTPSChange}
                                className="w-full text-sm border-2 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                placeholder="Select Training Center"
                                showClear
                                filter
                                filterInputAutoFocus
                            />
                            <button
                                onClick={handleCreateTP}
                                className="ml-2 flex px-2 py-2 text-sm text-white bg-purple-600 rounded-md hover:bg-blue-600 transition"
                            >
                                <span className='pr-1'><IoMdAdd className='w-5 h-5' /></span>  Create
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="tcId" className="mb-1 font-semibold text-base md:text-md sm:text-sm lg:text-md ml-1">Training Center Id</label>
                        <input
                            type="text"
                            id="tcId"
                            value={tcId}
                            placeholder="Enter TC Id"
                            onChange={(e) => setTcId(e.target.value)}
                            className="px-1 sm:px-2 py-1 sm:py-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition md:text-md sm:text-sm lg:text-md"
                            required
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="tcName" className="mb-1 font-semibold text-base md:text-md sm:text-sm lg:text-md ml-1">Training Center Name</label>
                        <input
                            type="text"
                            id="tcName"
                            value={tcName}
                            placeholder="Enter TC Name"
                            onChange={(e) => setTcName(e.target.value)}
                            className="px-1 sm:px-2 py-1 sm:py-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition md:text-md sm:text-sm lg:text-md"

                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="tcPhone" className="mb-1 font-semibold text-base md:text-md sm:text-sm lg:text-md ml-1">Training Center Phone</label>
                        <input
                            type="text"
                            id="tcPhone"
                            value={tcPhone}
                            placeholder="Enter TC Phone"
                            onChange={(e) => setTcPhone(e.target.value)}
                            className='px-1 sm:px-2 py-1 sm:py-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition md:text-md sm:text-sm lg:text-md'

                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="tcEmail" className="mb-1 font-semibold text-base md:text-md sm:text-sm lg:text-md ml-1">Training Center Email</label>
                        <input
                            type="email"
                            id="tcEmail"
                            value={tcEmail}
                            placeholder='Enter TC Email'
                            onChange={(e) => setTcEmail(e.target.value)}
                            className='px-1 sm:px-2 py-1 sm:py-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition md:text-md sm:text-sm lg:text-md'

                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="tcAddress" className="mb-1 font-semibold text-base md:text-md sm:text-sm lg:text-md ml-1">Training Center Address</label>
                        <input
                            type="text"
                            id="tcAddress"
                            value={tcAddress}
                            placeholder="Enter TC Address"
                            onChange={(e) => setTcAddress(e.target.value)}
                            className="px-1 sm:px-2 py-1 sm:py-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition md:text-md sm:text-sm lg:text-md"

                        />
                    </div>
                </div>
                {viewData && (
                    <Dialog header="TC Details" visible={isViewFormVisible} style={{ width: '50vw' }} onHide={() => setIsViewFormVisible(false)}>
                        <div>


                            <p><strong>TC ID:</strong> {viewData.tcId}</p>
                            <p><strong> Name:</strong> {viewData.name}</p>
                            <p><strong>Phone:</strong> {viewData.phone}</p>
                            <p><strong>Email:</strong> {viewData.email}</p>
                            <p><strong>Address:</strong> {viewData.address}</p>
                            <p><strong>TP:</strong> {viewData.tp.name}</p>

                        </div>
                    </Dialog>
                )}

                <Dialog header="Edit Training Center" visible={isEditFormVisible} style={{ width: '50vw' }} onHide={() => setIsEditFormVisible(false)}>
                    <form onSubmit={handleEditFormSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">

                            <div className="flex flex-col flex-1">
                                <label htmlFor="tcId" className="mb-1 font-semibold text-sm md:text-lg">Training Center Id</label>
                                <input type="text"
                                    id="tcId"
                                    name="tcId"
                                    value={editFormData.tcId}
                                    onChange={handleEditFormChange}
                                    className="px-2 py-2 md:px-3 md:py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>
                            <div className="flex flex-col flex-1">
                                <label htmlFor="name" className="mb-1 font-semibold text-sm md:text-lg">Training Center Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={editFormData.name}
                                    onChange={handleEditFormChange}
                                    className="px-2 py-2 md:px-3 md:py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>

                            <div className="flex flex-col flex-1">

                                <label htmlFor="phone" className="mb-1 font-semibold text-sm md:text-lg">Training Center Phone</label>
                                <input
                                    type="text"
                                    id="phone"
                                    name="phone"
                                    value={editFormData.phone}
                                    onChange={handleEditFormChange}
                                    className="px-2 py-2 md:px-3 md:py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>
                            <div className="flex flex-col flex-1">
                                <label htmlFor="email" className="mb-1 font-semibold text-sm md:text-lg">Training Center Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={editFormData.email}
                                    onChange={handleEditFormChange}
                                    className="px-2 py-2 md:px-3 md:py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>
                            <div className="flex flex-col flex-1">
                                <label htmlFor="address" className="mb-1 font-semibold text-sm md:text-lg">Training Center Address</label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={editFormData.address}
                                    onChange={handleEditFormChange}
                                    className="px-2 py-2 md:px-3 md:py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>
                            <div className="flex flex-col flex-1">
                                <label htmlFor="tp" className="mb-1 font-semibold text-sm md:text-lg">Training Partner</label>
                                <Dropdown
                                    value={editFormData.tp}
                                    options={tps.map(tp => ({ label: tp.name, value: tp._id }))}
                                    onChange={(e) => setEditFormData({ ...editFormData, tp: e.value })}
                                    placeholder="Select Training Partner"
                                    className="w-full text-sm border-2 border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />


                            </div>


                        </div>
                        <div className="flex space-x-4">
                            <button type="submit" className="w-32 py-2 text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-md text-sm px-5 text-center me-2 mb-2 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 flex items-center justify-center"> <span className='pr-2'><FaEdit className="w-4 h-4" /></span>Update</button>
                            <button type="button" onClick={() => setIsEditFormVisible(false)} className="w-32 py-2 text-white bg-red-600 hover:bg-red-700 focus:ring-red-300 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-md text-sm px-5 text-center me-2 mb-2 transition-all duration-200 ease-in-out transform hover:-translate-y-1 hover:scale-110 flex items-center justify-center">
                                <span className='pr-2'><IoMdClose className='w-5 h-5' /></span>
                                <span>Close</span>
                            </button>
                        </div>
                    </form>
                </Dialog>

                <div className="flex space-x-4">
                    <button type="submit" className="w-32 py-2 text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-md text-sm px-5 text-center me-2 mb-2 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 flex items-center justify-center">  <span className='pr-2'><IoMdAdd className='w-5 h-5' /></span>    <span>Add</span></button>
                    <button type="button" onClick={handleClear} className="w-32 py-2 text-white bg-gray-600 hover:bg-gray-700 focus:ring-blue-300 shadow-lg shadow-gray-500/50 dark:shadow-lg dark:shadow-gray-800/80 font-medium rounded-md text-sm px-5 text-center me-2 mb-2 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 flex items-center justify-center">
                        <span className='pr-2'><VscClearAll className='w-5 h-5' /></span>
                        <span>Clear</span>
                    </button>
                </div>
            </form>

            <div className="min-w-full inline-block align-middle overflow-x-auto flex-grow-0 mt-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">TC List</h3>

                    <span className="p-input-icon-left w-full sm:w-auto">
                        <i className="pi pi-search px-2" />
                        <InputText
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Search..."
                            className=" px-10  sm:w-72 rounded-md"
                        />
                    </span>
                </div>
                <div className=" p-1 md:max-w-full lg:max-w-[100%] max-w-[20rem]  xs:max-w-[23rem] sm:max-w-[50rem]">
                    <DataTable value={tcs}
                        paginator rows={10}
                        rowsPerPageOptions={[5, 10, 20, 50]}
                        responsiveLayout="scroll"
                        scrollable={true}
                        globalFilter={globalFilter}
                        className="min-w-full bg-white border border-gray-200">

                        <Column body={actionBodyTemplate} header="Actions" className="py-2 px-4 border-b" />
                        <Column field="tcId" header="TC Id" className="py-2 px-4 border-b " />
                        <Column field="name" header="TC Name" className="py-2 px-4 border-b" />
                        <Column field="email" header="TC Email" className="py-2 px-4 border-b" />
                        <Column field="phone" header="TC Phone" className="py-2 px-4 border-b" />
                        <Column field="address" header="TC Address" className="py-2 px-4 border-b" />
                        <Column field='tp.name' header='TP Name' className='py-2 px-4 border-b' />


                    </DataTable>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center font-semibold p-4 gap-80">
                    <span> Total Records: {tcs.length}</span>

                </div>
            </div>
        </div>
    );

};

export default ManageTc;