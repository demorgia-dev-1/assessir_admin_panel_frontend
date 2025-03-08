import 'cropperjs/dist/cropper.css';
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
import Cropper from 'react-cropper';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { IoMdAdd, IoMdClose } from 'react-icons/io';
import { VscClearAll } from 'react-icons/vsc';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import * as XLSX from 'xlsx';
import { clearAssessors, createAssessor, deleteAssessor, fetchAssessors, fetchAssessorsByJobRole, fetchJobRoles, setItemsPerPage, setSelectedCity, setSelectedCountry, setSelectedJobRoles, setSelectedSectors, setSelectedState, updateAssessors } from '../features/assessorSlice';
import { fetchCitiesByStateId, fetchStates } from '../features/citySlice';
import { fetchAllCountries } from '../features/countrySlice';
import { fetchSectors } from '../features/subAdminSlice';


const ManageAssessor = () => {
    const [selectedAssessors, setSelectedAssessors] = useState([]);
    const [assessorName, setAssessorName] = useState('');
    const [assessorEmail, setAssessorEmail] = useState('');
    const [assessorContact, setAssessorContact] = useState('');
    const [assessorAddress, setAssessorAddress] = useState('');
    const [assessorPassword, setAssessorPassword] = useState('');
    const [sipUserId, setSipUserId] = useState('');
    const [sipPassword, setSipPassword] = useState('');
    const [assessorPasswordVisible, setAssessorPasswordVisible] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [image, setImage] = useState(null);
    const [croppedImage, setCroppedImage] = useState(null);
    const [croppedImageUrl, setCroppedImageUrl] = useState(null);
    const cropperRef = useRef(null);
    const [showCropper, setShowCropper] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');
    const [formVisible, setFormVisible] = useState(false);
    const [isEditFormVisible, setIsEditFormVisible] = useState(false);
    const [selectedAssessor, setSelectedAssessor] = useState(null);
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [isViewFormVisible, setIsViewFormVisible] = useState(false);
    const [editFormData, setEditFormData] = useState({
        _id: '',
        assessorName: '',
        assessorEmail: '',
        assessorContact: '',
        assessorAddress: '',
        assessorPassword: '',
        sipUserId: '',
        sipPassword: '',
        selectedSectors: [],
        selectedJobRoles: [],
        croppedImage: null,
    });

    const dispatch = useDispatch();
    const {
        sectors ,
        jobRoles ,
        selectedSectors,
        selectedJobRoles ,
        countries ,
        states ,
        cities ,
        selectedCountry,
        selectedState ,
        selectedCity ,
        assessors ,
        itemsPerPage,
    } = useSelector((state) => state.assessor);

    const showButtons = selectedSectors  && selectedJobRoles && !formVisible;

    useEffect(() => {
        dispatch(fetchAllCountries());
        dispatch(fetchSectors());
    }, [dispatch]);

    useEffect(() => {
        if (selectedCountry) {
            dispatch(fetchStates(selectedCountry._id));
        }
    }, [dispatch, selectedCountry]);

    useEffect(() => {
        if (selectedState) {
            dispatch(fetchCitiesByStateId(selectedState._id));
        }
    }, [dispatch, selectedState]);

    useEffect(() => {
        if (selectedSectors?.length > 0) {
            dispatch(fetchJobRoles(selectedSectors));
            dispatch(fetchAssessors(selectedSectors));
        } else {
            dispatch(clearAssessors());
        }
    }, [dispatch, selectedSectors]);

    useEffect(() => {
        if (selectedSectors && selectedJobRoles) {
            dispatch(fetchAssessorsByJobRole(selectedJobRoles));
        } else {
            dispatch(clearAssessors());
        }
    }, [dispatch, selectedSectors, selectedJobRoles]);

    const handleSectorChange = (e) => {
        const selectedSectorIds = e.value.map(sector => sector._id);
        dispatch(setSelectedSectors(selectedSectorIds));
    };

    const handleJobRoleChange = (e) => {
        const selectedJobRoleIds = e.value.map(jobRole => jobRole._id);
        dispatch(setSelectedJobRoles(selectedJobRoleIds));
    };

    const handleCountryChange = (selectedOption) => {
        const country = selectedOption ? countries.find((c) => c._id === selectedOption.value) : null;
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


    useEffect(() => {
        const india = countries.find(c => c.name === 'india');
        if (india) {
            dispatch(setSelectedCountry(india));
        }
    }, [countries, dispatch]);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const validateMobile = (mobile) => {
        const re = /^[0-9]{10}$/;
        return re.test(String(mobile).replace(/\s+/g, ''));
    };
    const validatePassword = (password) => {
        return password.length === 8;
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateEmail(assessorEmail)) {
            toast.error('Invalid email format');
            return;
        }

        if (!validateMobile(assessorContact)) {
            toast.error('Invalid mobile number. It should be 10 digits.');
            return;
        }

        if (!validatePassword(assessorPassword)) {
            toast.error('Password must be exactly 8 characters long.');
            return;
        }

        if (assessorName && assessorEmail && assessorContact && selectedCountry && selectedState && selectedCity && assessorPassword && selectedJobRoles.length > 0 && selectedSectors.length > 0 && sipUserId && sipPassword) {

            const formData = new FormData();
            formData.append('name', assessorName);
            formData.append('email', assessorEmail);
            formData.append('phone', assessorContact);
            formData.append('address', assessorAddress);
            formData.append('country', selectedCountry._id);
            formData.append('state', selectedState._id);
            formData.append('city', selectedCity._id);
            formData.append('password', assessorPassword);
            formData.append('sipUserId', sipUserId);
            formData.append('sipPassword', sipPassword);
            formData.append('sectors', JSON.stringify(selectedSectors));
            formData.append('jobRoles', JSON.stringify(selectedJobRoles));
            if (croppedImage) {
                formData.append('avatar', croppedImage, 'avatar.png');
            }


            dispatch(createAssessor(formData))
            handleClear();

        }
    };

    const handleClear = () => {
        setAssessorName('');
        setAssessorEmail('');
        setAssessorContact('');
        setAssessorAddress('');
        setAssessorPassword('');
        setSipUserId('');
        setSipPassword('');
        setImage(null);
        setCroppedImage(null);
        setCroppedImageUrl(null);
        dispatch(setSelectedSectors([]));
        dispatch(setSelectedJobRoles([]));
        dispatch(setSelectedCountry(null));
        dispatch(setSelectedState(null));
        dispatch(setSelectedCity(null));

    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const toggleAssessorPasswordVisibility = () => {
        setAssessorPasswordVisible(!assessorPasswordVisible);
    };

    const onItemsPerPageChange = (e) => {
        dispatch(setItemsPerPage(Number(e.target.value)));
    };


    const onImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImage(reader.result);
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const getCroppedImage = () => {
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            cropper.getCroppedCanvas().toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], 'avatar.png', { type: 'image/png' });
                    setCroppedImage(file);
                    const url = URL.createObjectURL(blob);
                    setCroppedImageUrl(url);
                    setShowCropper(false);
                    toast.success('Image cropped successfully!');
                } else {
                    toast.error('Failed to get cropped canvas. Please try again.');
                }
            }, 'image/png');
        } else {
            toast.error('Cropper instance is not available. Please try again.');
        }
    };

    const handleUpdateSectorChange = (e) => {
        const selectedSectorIds = e.value.map(sector => sector._id);

        setEditFormData(prev => ({
            ...prev,
            selectedSectors: selectedSectorIds,
        }));

        dispatch(fetchJobRoles(selectedSectorIds));

    };

    const handleUpdateJobRoleChange = (e) => {
        const selectedJobRoleIds = e.value.map(jobRole => jobRole._id);
        setEditFormData(prev => ({
            ...prev,
            selectedJobRoles: selectedJobRoleIds,
        }));

    };

    const handleEditClick = (rowData) => {
        setEditFormData({
            _id: rowData._id,
            assessorName: rowData.name,
            assessorEmail: rowData.email,
            assessorContact: rowData.phone,
            assessorAddress: rowData.address,
            assessorPassword: rowData.password,
            sipUserId: rowData.sipUserId,
            sipPassword: rowData.sipPassword,
            selectedSectors: rowData.sectors.map(sector => sector._id),
            selectedJobRoles: rowData.jobRoles.map(jobRole => jobRole._id),
            croppedImage: rowData.avatar
        });
        setIsEditFormVisible(true);
    };
    const handleUpdate = async (e) => {
        e.preventDefault();

        const { _id, assessorName, assessorEmail, assessorContact, assessorAddress, assessorPassword, sipUserId, sipPassword, selectedSectors, selectedJobRoles, croppedImage } = editFormData;

        if (assessorName && assessorEmail && assessorContact && assessorPassword && selectedJobRoles.length > 0 && selectedSectors.length > 0 && sipUserId && sipPassword) {
            const formData = new FormData();
            formData.append('name', assessorName);
            formData.append('email', assessorEmail);
            formData.append('phone', assessorContact);
            formData.append('address', assessorAddress);
            formData.append('password', assessorPassword);
            formData.append('sipUserId', sipUserId);
            formData.append('sipPassword', sipPassword);

            selectedSectors.forEach((sector, index) => {
                formData.append(`sectors[${index}]`, sector);
            });

            selectedJobRoles.forEach((jobRole, index) => {
                formData.append(`jobRoles[${index}]`, jobRole);
            });

            if (croppedImage) {
                formData.append('avatar', croppedImage);
            }

            console.log('Edit form data before update:', editFormData);
            console.log('Payload being sent:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }


            const resultAction = await dispatch(updateAssessors({ _id, formData }));
            if (updateAssessors.fulfilled.match(resultAction)) {
                console.log('Update successful:', resultAction);
                setIsEditFormVisible(false);
                dispatch(fetchAssessors());
            }
        }
    };
    const handleDeleteClick = (rowData) => {
        setSelectedAssessor(rowData);
        setConfirmAction('delete');
        setIsConfirmVisible(true);
    };

    const handleView = (rowData) => {
        setSelectedAssessor(rowData);
        setIsViewFormVisible(true);
    };

    const confirmActionHandler = async () => {
        if (!selectedAssessor || !selectedAssessor._id) {
            toast.error('Invalid Assessor selected');
            return;
        }
        const assessorId = selectedAssessor._id;

        if (confirmAction === 'delete') {
            await dispatch(deleteAssessor(assessorId));
        }

        setIsConfirmVisible(false);
        setSelectedAssessor(null);

    };

    const handleCopyId = (rowData) => {
        navigator.clipboard.writeText(rowData._id);
        toast.success('Assessor ID copied to clipboard!');
    };
    const type = sessionStorage.getItem("type");

    const menuRefs = useRef([]);
    const actionBodyTemplate = (rowData, options) => {
        const items = [
            {
                label: 'Edit',
                icon: 'pi pi-pencil',
                command: () => handleEditClick(rowData),
                disabled: rowData.isLocked
            },
            {
                label: 'Delete',
                icon: 'pi pi-trash',
                command: () => handleDeleteClick(rowData),
                disabled: type === 'sub-admin'
            },
            {
                label: 'View',
                icon: 'pi pi-eye',
                command: () => handleView(rowData)
            },
            {
                label: 'Copy Assessor ID',
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

    const sectorsBodyTemplate = (rowData) => {
        return (
            <div className="overflow-hidden text-ellipsis">
                {rowData.sectors.map((sector, index) => (
                    <span key={index} className="sector-name">
                        {sector.sector_short_name?.toUpperCase()}
                        {index < rowData.sectors.length - 1 && ', '}
                    </span>
                ))}
            </div>
        );
    };

    const jobRolesBodyTemplate = (rowData) => {
        return (
            <div>
                {rowData.jobRoles.map((jobRole, index) => (
                    <span key={index} className="job-role-name">
                        {jobRole.name}
                        {index < rowData.jobRoles.length - 1 && ', '}
                    </span>
                ))}
            </div>
        );
    };


    const sectorOptions = Array.isArray(sectors) ? sectors.map(sector => ({
        value: sector,
        label: `${sector.name?.toUpperCase()}( ${sector.sector_short_name?.toUpperCase()} )`
    })) : [];

    const jobRoleOptions = Array.isArray(jobRoles) ? jobRoles.map(jobRole => ({
        value: jobRole,
        label: jobRole.name
    })) : [];

    const sectorItemTemplate = (option) => {
        return (
            <div className="flex align-items-center">
                <span>{option.label}</span>
            </div>
        );
    };

    const jobRoleItemTemplate = (option) => {
        return (
            <div className="flex align-items-center">
                <span>{option.label}</span>
            </div>
        );
    };
    const downloadExcel = () => {
        const data = selectedAssessors.length > 0 ? selectedAssessors : assessors;
        const headers = [
            ['Assessor Id', 'Assessor Name', 'Email', 'Password', 'Contact', 'Address', 'Sectors', 'Job Roles', 'SIP User Id', 'SIP Password']
        ];
        const worksheet = XLSX.utils.aoa_to_sheet(headers);
        XLSX.utils.sheet_add_json(worksheet, data.map(assessor => ({
            'Assessor Id': assessor._id,
            'Assessor Name': assessor.name,
            'Email': assessor.email,
            'Password': assessor.password,
            'Contact': assessor.phone,
            'Address': assessor.address,
            'Sectors': assessor.sectors.map(sector => sector.name).join(', '),
            'Job Roles': assessor.jobRoles.map(jobRole => jobRole.name).join(', '),
            'SIP User Id': assessor.sipUserId,
            'SIP Password': assessor.sipPassword
        })), { origin: 'A2', skipHeader: true });

        const colWidths = [
            { wch: 20 },
            { wch: 20 },
            { wch: 25 },
            { wch: 15 },
            { wch: 15 },
            { wch: 30 },
            { wch: 20 },
            { wch: 20 },
            { wch: 15 },
        ];
        worksheet['!cols'] = colWidths;

        worksheet['!rows'] = [{ hpt: 20 }];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Assessors');
        XLSX.writeFile(workbook, 'assessors.xlsx');
    };
    return (
        <div className="max-w-[20rem]  xs:max-w-[23rem] my-2  md:max-w-[86rem] sm:max-w-[50rem] lg:max-w-[100%] xl:w-[100%]
        mx-auto mt-14 sm:mt-5 p-0 sm:p-2  py-8 bg-white border-2 border-white/10 backdrop-blur-[20px] items-center overflow-hidden duration-200 ease-in-out text-black rounded-lg shadow-lg flex-grow-0 ">
            <h2 className="text-xl font-bold mb-4 ml-1 text-center sm:text-left">Manage Assessor</h2>
            <div className="flex flex-col space-y-4  mt-3">
                <div className="grid grid-cols-1 p-2  md:grid-cols-3 gap-4 bg-gray-100 rounded-lg py-2 pb-6">
                    <div className="flex flex-col">
                        <label htmlFor="sectors" className="mb-1 font-semibold text-md ml-1">Select Sectors<span className=' text-red-500'> * </span></label>
                        <MultiSelect
                            id="sectors"
                            value={selectedSectors?.map(sectorId => sectors.find(sector => sector._id === sectorId))}
                            options={sectorOptions}
                            onChange={handleSectorChange}
                            className="w-full px-3 border-2 text-sm border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            display="chip"
                            filter
                            placeholder="Select Sectors"
                            itemTemplate={sectorItemTemplate}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="jobRoles" className="mb-1 font-semibold text-md ml-1">Select Job Roles<span className=' text-red-500'> * </span></label>
                        <MultiSelect
                            id="jobRoles"
                            value={selectedJobRoles?.map(jobRoleId => jobRoles.find(jobRole => jobRole._id === jobRoleId))}
                            options={jobRoleOptions}
                            onChange={handleJobRoleChange}
                            className="w-full px-3  border-2 text-sm border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            display="chip"
                            filter
                            placeholder="Select Job Roles"
                            itemTemplate={jobRoleItemTemplate}
                        />
                    </div>
                </div>

                {showButtons && (
                    <div className="flex flex-col md:flex-row items-center mb-4 space-y-4 md:space-y-0 md:space-x-4">
                        <Button
                            label="Add New"
                            icon={<IoMdAdd />}
                            onClick={() => setFormVisible(true)}
                            className="p-button-primary bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-md transition-all ease-in-out duration-300 shadow-lg flex items-center space-x-2 text-sm"
                        />

                    </div>
                )}


            </div>

            {formVisible && (<form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    <div className="flex flex-col">
                        <label htmlFor="country" className="mb-1 font-semibold text-base md:text-md sm:text-sm lg:text-md ml-1">Select Country</label>
                        <Select
                            id="country"
                            value={selectedCountry ? { value: selectedCountry._id, label: selectedCountry.name.toUpperCase() } : null}
                            options={countries.map(c => ({ value: c._id, label: c.name.toUpperCase() }))}
                            onChange={handleCountryChange}
                            className="w-full text-sm border-2 border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition z-50"
                            placeholder="Select Country"
                            isClearable

                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="state" className="mb-1 font-semibold text-base sm:text-sm md:text-md lg:text-md ml-1">Select State</label>
                        <Select
                            id="state"
                            value={selectedState ? { value: selectedState._id, label: selectedState.name.toUpperCase() } : null}
                            options={states.map(s => ({ value: s._id, label: s.name.toUpperCase() }))}
                            onChange={handleStateChange}
                            className="w-full text-sm border-2 border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition z-50"
                            placeholder="Select State"
                            isClearable

                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="city" className="mb-1 font-semibold text-base sm:text-sm md:text-md lg:text-md ml-1">Select City</label>
                        <Select
                            id="city"
                            value={selectedCity ? { value: selectedCity._id, label: selectedCity.name.toUpperCase() } : null}
                            options={cities.map(c => ({ value: c._id, label: c.name.toUpperCase() }))}
                            onChange={handleCityChange}
                            className="w-full text-sm border-2 border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition z-50"
                            placeholder="Select City"
                            isClearable

                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="name" className="mb-1 font-semibold text-md ml-1">Assessor Name <span className=' text-red-500'> * </span></label>
                        <input
                            type="text"
                            id="name"
                            value={assessorName}
                            placeholder="Enter Assessor Name"
                            onChange={(e) => setAssessorName(e.target.value)}
                            className="px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-transparent border-2"
                            required
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="contact" className="mb-1 font-semibold text-md  ml-1">Assessor Phone<span className=' text-red-500'> * </span></label>
                        <input
                            type="tel"
                            id="contact"
                            value={assessorContact}
                            placeholder="Enter Assessor Phone Number"
                            onChange={(e) => setAssessorContact(e.target.value)}
                            className="px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-transparent border-2"
                            required
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="email" className="mb-1 font-semibold text-md ml-1">Assessor Email<span className=' text-red-500'> * </span></label>
                        <input
                            type="email"
                            id="email"
                            value={assessorEmail}
                            placeholder="Enter Assessor Email"
                            onChange={(e) => setAssessorEmail(e.target.value)}
                            className="px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-transparent border-2"
                            required
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="address" className="mb-1 font-semibold text-md  ml-1">Assessor Address<span className=' text-red-500'> * </span></label>
                        <input
                            type="text"
                            id="address"
                            value={assessorAddress}
                            placeholder="Enter Assessor Address"
                            onChange={(e) => setAssessorAddress(e.target.value)}
                            className="px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-transparent border-2"
                            required
                        />
                    </div>

                    <div className="flex flex-col relative">
                        <label htmlFor="password" className="mb-1 font-semibold text-md ml-1">Assessor Password<span className=' text-red-500'> * </span></label>
                        <input
                            type={assessorPasswordVisible ? 'text' : 'password'}
                            id="password"
                            value={assessorPassword}
                            placeholder="Enter Assessor Password"
                            onChange={(e) => setAssessorPassword(e.target.value)}
                            className="px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-transparent border-2"
                            required
                        />
                        <span
                            onClick={toggleAssessorPasswordVisibility}
                            className="absolute text-2xl right-5 top-9 cursor-pointer text-gray-500"
                        >
                            {assessorPasswordVisible ? <FaEye /> : <FaEyeSlash />}
                        </span>
                    </div>


                    <div className="flex flex-col">
                        <label htmlFor="sipuserid" className="mb-1 font-semibold text-md ml-1">SIP User Id<span className=' text-red-500'> * </span></label>
                        <input
                            type="text"
                            id="sipuserid"
                            value={sipUserId}
                            placeholder="Enter SIP User Id"
                            onChange={(e) => setSipUserId(e.target.value)}
                            className="px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-transparent border-2"
                            required
                        />
                    </div>
                    <div className="flex flex-col relative">
                        <label htmlFor="sippassword" className="mb-1 font-semibold text-md ml-1">SIP Password<span className=' text-red-500'> * </span></label>
                        <input
                            type={passwordVisible ? 'text' : 'password'}
                            id="sippassword"
                            value={sipPassword}
                            placeholder="Enter SIP Password"
                            onChange={(e) => setSipPassword(e.target.value)}
                            className="px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-transparent border-2"
                            required
                        />
                        <span
                            onClick={togglePasswordVisibility}
                            className="absolute text-2xl right-5 top-9 cursor-pointer text-gray-500"
                        >
                            {passwordVisible ? <FaEye /> : <FaEyeSlash />}
                        </span>
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="image" className="mb-1 font-semibold text-md ml-1">Upload Image</label>
                        <input
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={onImageChange}
                            className="px-3 py-1 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-transparent border-2"
                        />
                        {croppedImageUrl && (
                            <div className="mt-2">
                                <img
                                    src={croppedImageUrl}
                                    alt="Cropped Preview"
                                    className="w-32 h-32 object-cover border-2 border-gray-300 rounded-lg"
                                />
                            </div>
                        )}
                    </div>

                    {showCropper && image && (
                        <div className="flex flex-col mt-4">
                            <div className="relative" style={{ height: 300, width: 300 }}>
                                <Cropper
                                    src={image}
                                    style={{ height: '100%', width: '100%' }}
                                    initialAspectRatio={1}
                                    aspectRatio={1}
                                    guides={false}
                                    ref={cropperRef}
                                    viewMode={1}
                                    minCropBoxHeight={10}
                                    minCropBoxWidth={10}
                                    background={false}
                                    responsive={true}
                                    autoCropArea={1}
                                    checkOrientation={false}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={getCroppedImage}
                                className="mt-2 py-2 w-[300px] bg-blue-500 text-white rounded-md">
                                Crop and Upload
                            </button>
                        </div>
                    )}


                </div>
                <div className="flex space-x-4">
                    <button type="submit" className="w-32 py-2 text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-md text-sm px-5 text-center transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 flex items-center justify-center">
                        <span className='pr-2'><IoMdAdd className='w-5 h-5' /></span>
                        <span>Add</span>
                    </button>
                    <button type="button" onClick={handleClear} className="w-32 py-2 text-white bg-gray-600 hover:bg-gray-700 focus:ring-blue-300 shadow-lg shadow-gray-500/50 dark:focus:ring-gray-800 font-medium rounded-md text-sm px-5 text-center transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 flex items-center justify-center">
                        <span className='pr-2'><VscClearAll className='w-5 h-5' /></span>
                        <span>Clear</span>
                    </button>
                    <button type="button" onClick={() => setFormVisible(false)} className="w-32 py-2 text-white bg-red-600 hover:bg-red-700 focus:ring-red-300 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-md text-sm px-5 text-center transition-all duration-200 ease-in-out transform hover:-translate-y-1 hover:scale-110 flex items-center justify-center">
                        <span className='pr-2'><IoMdClose className='w-5 h-5' /></span>
                        <span>Close</span>
                    </button>
                </div>
            </form>
            )}

            {selectedAssessor && (
                <Dialog header="Assessor Details" visible={isViewFormVisible} style={{ width: '50vw' }} onHide={() => setIsViewFormVisible(false)}>
                    <div>
                        <p><strong>Assessor ID:</strong> {selectedAssessor._id}</p>
                        <p><strong>Assessor Name:</strong> {selectedAssessor.name}</p>
                        <p><strong>Email:</strong> {selectedAssessor.email}</p>
                        <p><strong>Contact:</strong> {selectedAssessor.phone}</p>
                        <p><strong>Address:</strong> {selectedAssessor.address}</p>
                        <p><strong>Sectors:</strong> {selectedAssessor.sectors.map(sector => sector.name).join(', ')}</p>
                        <p><strong>Job Roles:</strong> {selectedAssessor.jobRoles.map(jobRole => jobRole.name).join(', ')}</p>
                        <p><strong>SIP User ID:</strong> {selectedAssessor.sipUserId}</p>
                        <p><strong>SIP Password:</strong> {selectedAssessor.sipPassword}</p>
                    </div>
                </Dialog>
            )}

            <Dialog header="Edit Assessor" visible={isEditFormVisible} style={{ width: '50vw' }} onHide={() => setIsEditFormVisible(false)}>
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                        <div className="flex flex-col">
                            <label htmlFor="name" className="mb-1 font-semibold text-md ml-1">Assessor Name</label>
                            <input
                                type="text"
                                id="name"
                                value={editFormData.assessorName}
                                placeholder="Enter Assessor Name"
                                onChange={(e) => setEditFormData({ ...editFormData, assessorName: e.target.value })}
                                name="name"
                                className="px-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-transparent border-2"
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="email" className="mb-1 font-semibold text-md ml-1">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={editFormData.assessorEmail}
                                placeholder="Enter Email"
                                onChange={(e) => setEditFormData({ ...editFormData, assessorEmail: e.target.value })}
                                name="email"
                                className="px-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-transparent border-2"
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="phone" className="mb-1 font-semibold text-md ml-1">Contact</label>
                            <input
                                type="text"
                                id="phone"
                                value={editFormData.assessorContact}
                                placeholder="Enter Contact"
                                onChange={(e) => setEditFormData({ ...editFormData, assessorContact: e.target.value })}
                                name="phone"
                                className="px-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-transparent border-2"
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="address" className="mb-1 font-semibold text-md ml-1">Address</label>
                            <input
                                type="text"
                                id="address"
                                value={editFormData.assessorAddress}
                                placeholder="Enter Address"
                                onChange={(e) => setEditFormData({ ...editFormData, assessorAddress: e.target.value })}
                                name="address"
                                className="px-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-transparent border-2"
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="password" className="mb-1 font-semibold text-md ml-1">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={editFormData.assessorPassword}
                                placeholder="Enter Password"
                                onChange={(e) => setEditFormData({ ...editFormData, assessorPassword: e.target.value })}
                                name="password"
                                className="px-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-transparent border-2"
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="sipUserId" className="mb-1 font-semibold text-md ml-1">SIP User ID</label>
                            <input
                                type="text"
                                id="sipUserId"
                                value={editFormData.sipUserId}
                                placeholder="Enter SIP User ID"
                                onChange={(e) => setEditFormData({ ...editFormData, sipUserId: e.target.value })}
                                name="sipUserId"
                                className="px-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-transparent border-2"
                                required
                            />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="sipPassword" className="mb-1 font-semibold text-md ml-1">SIP Password</label>
                            <input
                                type="password"
                                id="sipPassword"
                                value={editFormData.sipPassword}
                                placeholder="Enter SIP Password"
                                onChange={(e) => setEditFormData({ ...editFormData, sipPassword: e.target.value })}
                                name="sipPassword"
                                className="px-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-transparent border-2"
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="sectors" className="mb-1 font-semibold text-md ml-1">Select Sectors</label>
                            <MultiSelect
                                id="sectors"
                                value={sectors.filter(sector => editFormData.selectedSectors.includes(sector._id))}
                                options={sectorOptions}
                                onChange={handleUpdateSectorChange}
                                className="w-full px-3 py-1 border-2 border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                display="chip"
                                filter
                                placeholder="Select Sectors"
                                itemTemplate={sectorItemTemplate}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="sectors" className="mb-1 font-semibold text-md ml-1">Select Job Role</label>
                            <MultiSelect
                                id="jobRoles"
                                value={jobRoles.filter(jobRole => editFormData.selectedJobRoles.includes(jobRole._id))}
                                options={jobRoleOptions}
                                onChange={handleUpdateJobRoleChange}
                                className="w-full px-3 py-1 border-2 border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                display="chip"
                                filter
                                placeholder="Select Job Roles"
                                itemTemplate={jobRoleItemTemplate}
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

            <Dialog header={confirmAction} visible={isConfirmVisible} style={{ width: '30vw' }} onHide={() => setIsConfirmVisible(false)}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle px-5" style={{ fontSize: '1rem', color: 'orange' }}></i>
                    <span>Are you sure you want to {confirmAction} this Assessor?</span>
                </div>
                <div className="flex justify-end space-x-4 mt-4">
                    <Button label="Yes" icon="pi pi-check" className="p-button-danger" onClick={confirmActionHandler} />
                    <Button label="No" icon="pi pi-times" className="p-button-secondary" onClick={() => setIsConfirmVisible(false)} />
                </div>
            </Dialog>
            <div className="mt-8 overflow-x-auto sm:w-full md:w-[100%] xl:w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">

                    <div className="flex space-x-4 px-2">
                        <h3 className="text-xl font-bold">Assessors List</h3>
                        <Button
                            label="Download Excel"
                            icon='pi pi-file-excel'
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 sm:py-2 sm:px-4 rounded-md text-xs sm:text-sm w-full sm:w-auto ml-2 lg:text-xs"
                            onClick={downloadExcel}
                        />

                    </div>
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
                <div className="max-w-[23rem] p-1 md:max-w-[50rem] sm:max-w-[30rem] lg:max-w-[76rem]">
                    <DataTable
                        value={assessors}
                        paginator rows={10}
                        rowsPerPageOptions={[5, 10, 20, 50]}
                        responsiveLayout="scroll"
                        scrollable={true}
                        globalFilter={globalFilter}
                        selection={selectedAssessors}
                        onSelectionChange={(e) => setSelectedAssessors(e.value)}
                        className="min-w-full bg-white border border-gray-200"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>
                        <Column body={actionBodyTemplate} header="Actions" className="py-2 px-4 border-b" />
                        <Column field="_id" header="Assessor Id" className="py-2 px-4 border-b" />
                        <Column field="name" header="Assessor Name" className="py-2 px-4 border-b" />
                        <Column field="email" header="Email" className="py-2 px-4 border-b" />
                        <Column field="password" header="Password" className="py-2 px-4 border-b" />
                        <Column field="phone" header="Contact" className="py-2 px-4 border-b" />
                        <Column field="address" header="Address" className="py-2 px-4 border-b" />
                        <Column body={sectorsBodyTemplate} header="Sectors " className="py-2 px-4 border-b" />
                        <Column body={jobRolesBodyTemplate} header="Job Roles" className="py-2 px-4 border-b" />
                        <Column field="sipUserId" header="SIP User Id" className="py-2 px-4 border-b" />
                        <Column field="sipPassword" header="SIP Password" className="py-2 px-4 border-b" />
                    </DataTable>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 p-4 gap-4">
                <span className="font-medium text-lg">Total Records: {assessors.length}</span>
                <div>
                    <label className="font-medium text-lg">
                        Items per page:
                        <select
                            id="itemsPerPage"
                            value={itemsPerPage}
                            onChange={onItemsPerPageChange}
                            className="ml-2 pl-2 border border-gray-300 rounded"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </label>
                </div>
            </div>
            <style>
                {`
                    .p-checkbox-box {
                        border: 1px solid ;
                    }
                `}
            </style>
        </div>
    );
};

export default ManageAssessor;