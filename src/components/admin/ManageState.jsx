
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
import { fetchAllCountries } from '../features/countrySlice';
import { createState, fetchStates, setSelectedCountry } from '../features/stateSlice';

const ManageState = () => {
    const [stateName, setStateName] = useState('');
    const [stateCode, setStateCode] = useState('');
    const [globalFilter, setGlobalFilter] = useState('');

    const dispatch = useDispatch();
    const { countries, selectedCountry, states, totalStates } = useSelector(state => state.state);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedCountry && stateName && stateCode) {
            dispatch(createState({ name: stateName, code: stateCode, country: selectedCountry._id }))
            toast.success(`State added to ${selectedCountry.name.toUpperCase()} successfully!`);
            handleClear();
        }
    };

    useEffect(() => {
        dispatch(fetchAllCountries());
        if (selectedCountry) {
            dispatch(fetchStates(selectedCountry._id));
        }
    }, [dispatch, selectedCountry]);

    const handleClear = () => {
        dispatch(setSelectedCountry(null));
        setStateName('');
        setStateCode('');
    };

    const handleCountryChange = (e) => {
        const countryId = e.target.value;
        const country = countries.find(c => c._id === countryId);
        dispatch(setSelectedCountry(country));
    };

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

    const uppercaseBodyTemplate = (rowData, field) => {
        return rowData[field].toUpperCase();
    };

    console.log('states', states);

    return (
<div className="max-w-[23rem] my-2bg-white p-1 md:max-w-[86rem] sm:max-w-[50rem] lg:max-w-[90rem]
        mx-auto mt-5 p-0 sm:p-2  py-8 bg-white border-2 border-white/10 backdrop-blur-[20px] items-center overflow-hidden duration-200 ease-in-out text-black rounded-lg shadow-lg flex-grow-0 xl:w-[100%]">
                     <h2 className="text-xl font-bold mb-4 ml-1">Manage State</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col space-y-4 my-5 mx-2">
            <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4 bg-gray-100 rounded-lg px-1 py-2 pb-5">

                    <div className="flex flex-col flex-1">
                        <label htmlFor="country" className="mb-1 font-semibold text-sm  ml-1">Select Country</label>
                        <select
                            id="country"
                            value={selectedCountry ? selectedCountry._id : ''}
                            onChange={handleCountryChange}
                            className="px-3 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
                        >
                            <option value="">Select</option>
                            {countries && countries.length > 0 ? (
                                countries.map((c) => (
                                    <option key={c._id} value={c._id}>{c.name.toUpperCase()}</option>
                                ))
                            ) : (
                                <option value="" disabled>No countries available</option>
                            )}
                        </select>
                    </div>
                    <div className="flex flex-col flex-1">
                        <label htmlFor="state" className="mb-1 font-semibold text-sm ml-1">State Name</label>
                        <input
                            type="text"
                            id="state"
                            value={stateName}
                            placeholder='Enter State Name'
                            onChange={(e) => setStateName(e.target.value)}
                            className="px-3 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
                            disabled={!selectedCountry}
                        />
                    </div>
                    </div>
                    <div className="flex flex-col flex-1">
                        <label htmlFor="statecode" className="mb-1 font-semibold text-sm ml-1">State Short Name</label>
                        <input
                            type="text"
                            id="statecode"
                            value={stateCode}
                            placeholder='Enter State Short Name'
                            onChange={(e) => setStateCode(e.target.value)}
                            className="px-3 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
                            disabled={!selectedCountry}
                        />
                    </div>
                </div>
                {!selectedCountry && (
                    <div className="text-red-500 text-md mt-2">
                        Please select a Country before entering State information.
                    </div>
                )}
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
            </form>

            <div className="min-w-full inline-block align-middle overflow-x-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <h3 className="text-xl font-bold">State List</h3>

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
                <div className="max-w-[24rem] p-2  md:max-w-[86rem] sm:max-w-[50rem] lg:max-w-[90rem] scrollbar-thin">
                <DataTable
                        value={states}
                        paginator rows={10}
                        rowsPerPageOptions={[5, 10, 20, 50]}
                        responsiveLayout="scroll"
                        scrollable={true}
                        globalFilter={globalFilter}
                        className="min-w-full bg-white border border-gray-200"
                    >
                        <Column body={actionBodyTemplate} header="Actions" className="py-2 px-4 border-b" />
                        <Column field="name" header="State" className="py-2 px-4 border-b" body={(rowData) => uppercaseBodyTemplate(rowData, 'name')} />
                        <Column field="code" header="State Short Name" className="py-2 px-4 border-b" body={(rowData) => uppercaseBodyTemplate(rowData, 'code')} />
                    </DataTable>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 p-4 gap-4">
                <span className="font-medium text-lg">Total Records: {totalStates}</span>

            </div>
        </div>
    );
};

export default ManageState;