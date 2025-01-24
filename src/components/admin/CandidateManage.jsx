
import axios from 'axios';
import 'cropperjs/dist/cropper.css';
import { saveAs } from 'file-saver';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Menu } from 'primereact/menu';
import { useEffect, useRef, useState } from 'react';
import Cropper from 'react-cropper';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { IoMdAdd, IoMdClose, IoMdCloudUpload } from 'react-icons/io';
import { MdOutlineNoteAdd } from "react-icons/md";
import { VscClearAll } from 'react-icons/vsc';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import * as XLSX from 'xlsx';
import { BASE_URL } from '../constant';
import { setSelectedBatch, setSelectedJobRole, setSelectedSector } from '../features/assignTestSlice';
import { fetchBatchesBySectorJobRole } from '../features/batchSlice';
import { clearCandidates, createCandidate, deleteCandidate, fetchCandidateByBatchId, updateCandidate } from '../features/candidateSlice';
import { fetchJobRolesBySector } from '../features/jobRoleSlice';
import { fetchSectors } from '../features/subAdminSlice';

const ManageCandidate = () => {
    const [candidateName, setCandidateName] = useState('');
    const [candidateEmail, setCandidateEmail] = useState('');
    const [password, setPassword] = useState('');
    const [candidateContact, setCandidateContact] = useState('');
    const [candidateAddress, setCandidateAddress] = useState('');
    const [gender, setGender] = useState('');
    const [enrollmentNo, setEnrollmentNo] = useState('');
    const [aadharNumber, setAadharNumber] = useState('');
    const [fatherName, setFatherName] = useState('');
    const [formVisible, setFormVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [image, setImage] = useState(null);
    const [croppedImage, setCroppedImage] = useState(null);
    const [croppedImageUrl, setCroppedImageUrl] = useState(null);
    const cropperRef = useRef(null);
    const [showCropper, setShowCropper] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [isBulkUploadVisible, setBulkUploadVisible] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);
    const [isEditFormVisible, setIsEditFormVisible] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [isViewFormVisible, setIsViewFormVisible] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [viewData, setViewData] = useState(null);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [editFormData, setEditFormData] = useState({
        _id: '',
        name: '',
        email: '',
        phone: '',
        password: '',
        address: '',
        gender: '',
        enrollmentNo: '',
        adharNo: '',
        fatherName: '',
    });
    const [selectedCandidates, setSelectedCandidates] = useState([]);
    const dispatch = useDispatch();
    const { candidates, totalCandidates } = useSelector(state => state.candidate);
    const {
        batches, jobRoles, sectors,
        selectedBatch, selectedJobRole,
        selectedSector
    } = useSelector(state => state.assignTest);
    const showButtons = selectedBatch && !formVisible;

    const handleDownloadCandidates = (selectedOnly) => {
        const dataToDownload = selectedOnly
            ? candidates.filter(candidate => selectedCandidates.includes(candidate))
            : candidates;

        const sampleData = dataToDownload.map(candidate => ({
            "Name": candidate.name,
            "Email": candidate.email,
            "Phone": candidate.phone,
            "Password": candidate.password,
            "Address": candidate.address,
            "Gender": candidate.gender,
            "Enrollment Number": candidate.enrollmentNo,
            "Aadhar Number": candidate.adharNo,
            "Father Name": candidate.fatherName,
        }));

        const worksheet = XLSX.utils.json_to_sheet(sampleData);

        const columnWidths = [
            { wpx: 200 },
            { wpx: 200 },
            { wpx: 150 },
            { wpx: 100 },
            { wpx: 100 },
            { wpx: 100 },
            { wpx: 100 },
            { wpx: 150 },
            { wpx: 100 },
        ];

        worksheet['!cols'] = columnWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `Batch-${selectedBatch.no}`);

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Batch-${selectedBatch.no}.xlsx`);
    };

    const handleSectorChange = (selectedOption) => {
        dispatch(setSelectedSector(selectedOption));
        if (selectedOption) {
            dispatch(fetchJobRolesBySector(selectedOption._id));
        }
    };

    const handleJobRoleChange = (selectedOption) => {
        dispatch(setSelectedJobRole(selectedOption));
    };

    const handleBatchChange = (selectedOption) => {
        const batch = selectedOption;
        dispatch(setSelectedBatch(batch));
        if (batch) {
            dispatch(fetchCandidateByBatchId(batch._id));
        }
        else {
            dispatch(clearCandidates());
        }
    };

    useEffect(() => {
        dispatch(fetchSectors());
    }, [dispatch]);

    useEffect(() => {
        if (selectedSector && selectedJobRole) {
            dispatch(fetchBatchesBySectorJobRole({ sectorId: selectedSector._id, jobRoleId: selectedJobRole._id }));
        }
    }, [dispatch, selectedSector, selectedJobRole]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (candidateName && enrollmentNo && selectedBatch && password) {
            const formData = new FormData();
            formData.append('name', candidateName);
            formData.append('enrollmentNo', enrollmentNo);
            formData.append('batch', selectedBatch._id);
            formData.append('password', password);

            if (candidateContact) {
                formData.append('phone', candidateContact);
            }

            if (candidateEmail) {
                formData.append('email', candidateEmail);
            }
            if (candidateAddress) {
                formData.append('address', candidateAddress);
            }
            if (gender) {
                formData.append('gender', gender);
            }
            if (aadharNumber) {
                formData.append('adharNo', aadharNumber);
            }
            if (fatherName) {
                formData.append('fatherName', fatherName);
            }

            if (croppedImage) {
                formData.append('avatar', croppedImage, 'avatar.png');
            }

            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }

            dispatch(createCandidate(formData))
                .unwrap()
                .then(() => {
                    toast.success('Candidate added successfully!');
                    handleClear();
                    dispatch(fetchCandidateByBatchId(selectedBatch._id));
                })
                .catch((error) => {
                    const errorMessage = error.response?.data?.message || 'Failed to add candidate due to an unknown error.';
                    console.log(`Failed to add candidate:`, errorMessage);
                });

        }
    };

    const handleDownload = () => {
        const sampleData = [
            {
                "Name": "abcd",
                "Email": "abcd@gmail.com",
                "Phone": "9154656325",
                "Password": "12345678",
                "Address": "xyz",
                "Gender": "male",
                "Enrollment Number": "12345",
                "Aadhar Number": "745632587456",
                "Father Name": "mr.abcd",
            },
        ];

        const worksheet = XLSX.utils.json_to_sheet(sampleData);


        const columnWidths = [
            { wpx: 200 },
            { wpx: 200 },
            { wpx: 150 },
            { wpx: 100 },
            { wpx: 100 },
            { wpx: 100 },
            { wpx: 100 },
            { wpx: 150 },
            { wpx: 100 },
        ];
        worksheet['!cols'] = columnWidths;

        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
            const phoneCell = `C${rowNum + 1}`;
            const aadharCell = `H${rowNum + 1}`;
            if (!worksheet[phoneCell]) {
                worksheet[phoneCell] = { t: 's', v: '' };
            }
            worksheet[phoneCell].z = '@';
            if (!worksheet[aadharCell]) {
                worksheet[aadharCell] = { t: 's', v: '' };
            }
            worksheet[aadharCell].z = '@';
        }
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, selectedBatch._id);

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array', cellStyles: true });

        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'candidates_upload.xlsx');
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setErrorMessage('Please select a file to upload.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '', cellText: true });

            const allowedGenders = ['male', 'female', 'other'];

            const candidates = jsonData.map(row => {
                const {
                    "Name": name,
                    "Enrollment Number": enrollmentNo,
                    "Email": email,
                    "Phone": phone,
                    "Password": password,
                    "Address": address,
                    "Gender": gender,
                    "Aadhar Number": adharNo,
                    "Father Name": fatherName,
                } = row;

                const formattedPhone = phone ? phone.toString() : '';
                const formattedAadharNo = adharNo ? adharNo.toString() : '';

                if (
                    name &&
                    enrollmentNo &&
                    password
                ) {
                    const candidate = {
                        name,
                        enrollmentNo,
                        password,
                        batch: selectedBatch._id,
                    };

                    if (email) {
                        candidate.email = email;
                    }
                    if (phone) {
                        candidate.phone = formattedPhone;
                    }
                    if (gender && allowedGenders.includes(gender.toLowerCase())) {
                        candidate.gender = gender.toLowerCase();
                    }
                    if (address) {
                        candidate.address = address;
                    }
                    if (formattedAadharNo) {
                        candidate.adharNo = formattedAadharNo;
                    }
                    if (fatherName) {
                        candidate.fatherName = fatherName;
                    }

                    return candidate;
                } else {
                    toast.error(!name ? 'Name is required' : !enrollmentNo ? 'Enrollment Number is required' : !allowedGenders.includes(gender.toLowerCase()) ? 'Invalid gender' : 'Required fields are missing');
                }
                return null;
            }).filter(item => item !== null);

            console.log('Candidates to be uploaded:', candidates);

            try {
                const response = await axios.post(`${BASE_URL}company/candidates/bulk-insert`, { candidates }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': "Bearer " + sessionStorage.getItem("token"),
                    },
                });

                if (response.status === 200) {
                    handleClear();
                    toast.success('Candidates uploaded successfully!');
                    dispatch(fetchCandidateByBatchId(selectedBatch._id));
                } else {
                    console.error('Error response:', response);
                    toast.error(`Error uploading candidates: ${response.data?.message || response?.data?.statusText}`);
                }
            } catch (error) {
                console.error('Error uploading candidates:', error);
                toast.error(`Error uploading candidates: ${error.response?.data?.message || error.message}`);
            }
        };
        reader.readAsArrayBuffer(selectedFile);
    };

    const onDrop = (acceptedFiles) => {
        dispatch
        const file = acceptedFiles[0];
        setSelectedFile(file);
        setErrorMessage('');
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx', '.xls'] },
    });

    const handleClear = () => {
        setCandidateName('');
        setCandidateEmail('');
        setCandidateContact('');
        setCandidateAddress('');
        setGender('');
        setEnrollmentNo('');
        setAadharNumber('');
        setFatherName('');
        setPassword('');
        dispatch(setSelectedBatch(null));
        setFormVisible(false);
        setIsEditing(false);
        setImage(null);
        setCroppedImage(null);
        setCroppedImageUrl(null);
        setShowCropper(false);

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

    const handleEditClick = (rowData) => {

        setEditFormData({
            _id: rowData._id,
            name: rowData.name,
            email: rowData.email,
            phone: rowData.phone,
            password: rowData.password,
            address: rowData.address,
            enrollmentNo: rowData.enrollmentNo,
            adharNo: rowData.adharNo,
            fatherName: rowData.fatherName,
        });

        setIsEditFormVisible(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        const { _id, ...updatedCandidate } = {
            ...editFormData,

        };

        console.log("Submitting Update for Question:", updatedCandidate);


        const resultAction = await dispatch(updateCandidate({ _id, updatedCandidate })).unwrap();
        if (updateCandidate.fulfilled.match(resultAction)) {
            setIsEditFormVisible(false);
            await dispatch(fetchCandidateByBatchId(selectedBatch._id));

        }
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };


    const handleDeleteClick = (rowData) => {
        setSelectedCandidate(rowData);
        setConfirmAction('delete');
        setIsConfirmVisible(true);
    };

    const confirmActionHandler = async () => {
        if (!selectedCandidate || !selectedCandidate._id) {
            toast.error('Invalid Candidate selected');
            return;
        }
        const batchId = selectedCandidate._id;

        if (confirmAction === 'delete') {
            await dispatch(deleteCandidate(batchId)).unwrap();
        }

        dispatch(fetchCandidateByBatchId(selectedBatch._id));
        setIsConfirmVisible(false);
        setSelectedCandidate(null);

    };

    const handleView = (rowData) => {
        setViewData(rowData);
        setIsViewFormVisible(true);
    };

    const handleCopyId = (rowData) => {
        if (rowData && rowData._id) {
            navigator.clipboard.writeText(rowData._id);
            toast.success('Candidate copied to clipboard!');
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
                label: 'Copy Candidate Id',
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


    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };


    return (
        <div className="max-w-[20rem]  xs:max-w-[23rem] sm:max-w-[60rem] my-2  md:max-w-[86rem]  lg:max-w-[100%] xl:w-[100%]
        mx-auto mt-5 p-0 sm:p-2  py-8 bg-white border-2 border-white/10 backdrop-blur-[20px] items-center overflow-hidden duration-200 ease-in-out text-black rounded-lg shadow-lg flex-grow-0 ">
            <style>
                {`
                    .p-datatable .p-checkbox-box {
                        border: 1px solid ; 
                    }
                `}
            </style>
            <h2 className="text-xl font-bold mb-4 ml-1  p-2 text-center sm:text-left"> Manage Candidate </h2>
            <div className="flex flex-col  space-y-4 my-5">
                <div className="grid grid-cols-1 p-2  md:grid-cols-3 gap-4 bg-gray-100 rounded-lg py-2 pb-6">
                    <div className="flex flex-col">
                        <label htmlFor="sector" className="mb-1 font-semibold text-md ml-1">Select Sector</label>
                        <Select
                            id="sector"
                            value={selectedSector}
                            options={sectors}
                            onChange={handleSectorChange}
                            getOptionLabel={(option) => `${option.name.toUpperCase()}(${option.sector_short_name.toUpperCase()})`}
                            getOptionValue={(option) => option._id}
                            isClearable
                            placeholder="Select Sector"
                            className="w-full text-sm border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition z-50"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="jobrole" className="mb-1 font-semibold text-md ml-1">Select Job Role</label>
                        <Select
                            id="jobrole"
                            value={selectedJobRole}
                            options={jobRoles}
                            onChange={handleJobRoleChange}
                            getOptionLabel={(option) => `${option.name}-V${option.version}`}
                            getOptionValue={(option) => option._id}
                            isClearable
                            placeholder="Select Job Role"
                            className="w-full text-sm border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition z-30"

                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="batch" className="mb-1 font-semibold text-md ml-1">Select Batch</label>
                        <Dropdown
                            id="batch"
                            value={selectedBatch}
                            options={batches}
                            onChange={(e) => handleBatchChange(e.value)}
                            optionLabel="no"
                            filter
                            showClear
                            filterInputAutoFocus
                            placeholder="Select Batch"
                            className="w-full text-sm border border-gray-300 rounded-md z-20"
                        />
                    </div>

                </div>

                {showButtons && (
                    <div className="flex flex-col md:flex-row items-center mb-4 space-y-4 md:space-y-0 md:space-x-4">
                        <Button
                            label="Add New"
                            icon={<IoMdAdd />}
                            onClick={() => setFormVisible(true)}
                            className="p-button-primary bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-md transition-all ease-in-out duration-300 shadow-md flex items-center space-x-2 text-sm"
                        />

                        <Button
                            label="Bulk Upload"
                            icon={<MdOutlineNoteAdd />}
                            onClick={() => setBulkUploadVisible(!isBulkUploadVisible)}
                            className="p-button-success bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-all ease-in-out duration-300 shadow-md flex items-center space-x-2 text-sm"
                        />

                        <Button
                            label='Download Sample Excel'
                            onClick={handleDownload}
                            className="p-button-primary bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-all ease-in-out duration-300 shadow-md flex items-center space-x-2 text-sm" />

                        {isBulkUploadVisible && (
                            <>
                                <div
                                    {...getRootProps()}
                                    className={`w-full md:w-2/3 lg:w-1/3 border-2 border-dashed rounded-md p-6 mt-2 transition-all ease-in-out duration-300 ${isDragActive ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-300'} hover:bg-gray-100 hover:border-gray-400 cursor-pointer`}
                                >
                                    <input {...getInputProps()} />
                                    {isDragActive ? (
                                        <p className="text-blue-700 font-semibold text-center">Drop the files here ...</p>
                                    ) : (
                                        <p className="text-gray-700 text-center">Drag & drop a file here, or <span className="text-purple-600 ">click to select a file</span></p>
                                    )}
                                    {errorMessage && <div className="text-red-600 mt-2 text-center">{errorMessage}</div>}
                                    {selectedFile && (
                                        <div className="mt-4 text-center">
                                            <span className="font-semibold">Selected File: </span>
                                            <span className="text-gray-800">{selectedFile.name}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-center mt-4">
                                    <Button
                                        label="Upload"
                                        icon={<IoMdCloudUpload />}
                                        onClick={handleUpload}
                                        className={`p-button-primary bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-md transition-all ease-in-out duration-300 shadow-lg flex items-center space-x-2 text-sm`}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )}

            </div>
            {formVisible && (<form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">


                    <div className="flex flex-col">
                        <label htmlFor="name" className="font-semibold ">Name</label>
                        <input
                            type="text"
                            id="name"
                            placeholder='Enter Candidate Name'
                            value={candidateName}
                            onChange={(e) => setCandidateName(e.target.value)}
                            className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="email" className="font-semibold ">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder='Enter Candidate Email'
                            value={candidateEmail}
                            onChange={(e) => setCandidateEmail(e.target.value)}
                            className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="contact" className="font-semibold ">Phone</label>
                        <input
                            type="text"
                            id="contact"
                            placeholder='Enter Candidate Contact'
                            value={candidateContact}
                            onChange={(e) => setCandidateContact(e.target.value)}
                            className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="address" className="font-semibold ">Address</label>
                        <input
                            type="text"
                            id="address"
                            placeholder='Enter Candidate Address'
                            value={candidateAddress}
                            onChange={(e) => setCandidateAddress(e.target.value)}
                            className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="gender" className="font-semibold ">Gender</label>
                        <select
                            id="gender"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        >
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="flex flex-col relative">
                        <label htmlFor="password" className="font-semibold ">Password</label>
                        <input
                            type={passwordVisible ? "text" : "password"}
                            id="password"
                            placeholder='Enter Password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                        <span
                            onClick={togglePasswordVisibility}
                            className="absolute text-2xl right-3 top-8 cursor-pointer text-gray-500"
                        >
                            {passwordVisible ? <FaEye /> : <FaEyeSlash />}
                        </span>
                    </div>


                    <div className="flex flex-col">
                        <label htmlFor="enrollmentNo" className="font-semibold ">Enrollment Number</label>
                        <input
                            type="text"
                            id="enrollmentNo"
                            placeholder='Enter Enrollment Number'
                            value={enrollmentNo}
                            onChange={(e) => setEnrollmentNo(e.target.value)}
                            className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                    </div>


                    <div className="flex flex-col">
                        <label htmlFor="aadharNumber" className="font-semibold ">Aadhar Number</label>
                        <input
                            type="text"
                            id="aadharNumber"
                            placeholder='Enter Aadhar Number'
                            value={aadharNumber}
                            onChange={(e) => setAadharNumber(e.target.value)}
                            className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="fatherName" className="font-semibold ">Father Name</label>
                        <input
                            type="text"
                            id="fatherName"
                            placeholder='Enter Father Name'
                            value={fatherName}
                            onChange={(e) => setFatherName(e.target.value)}
                            className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="image" className="font-semibold ">Upload Image</label>
                        <input
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={onImageChange}
                            className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
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
                                className="mt-2 py-2 w-[300px] bg-blue-500 text-white rounded-lg">
                                Crop and Upload
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex space-x-4">
                    <button type="submit" className="w-32 py-2 text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-md text-sm px-5 text-center transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 flex items-center justify-center">
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
            </form>)}

            {viewData && (
                <Dialog header="Candidate Details" visible={isViewFormVisible} style={{ width: '50vw' }} onHide={() => setIsViewFormVisible(false)}>
                    <div>
                        <p><strong>Candidate ID:</strong> {viewData._id}</p>
                        <p><strong>Enrollment No:</strong> {viewData.enrollmentNo}</p>
                        <p><strong>Batch Id:</strong> {viewData.batch}</p>
                        <p><strong>Name:</strong> {viewData.name}</p>
                        <p><strong>Email:</strong> {viewData.email}</p>
                        <p><strong>Phone:</strong> {viewData.phone}</p>
                        <p><strong>Password:</strong> {viewData.password}</p>
                        <p><strong>Gender:</strong> {viewData.gender}</p>
                        <p><strong>Aadhar No:</strong> {viewData.adharNo}</p>
                        <p><strong>Address:</strong> {viewData.address}</p>
                        <p><strong>Father Name:</strong> {viewData.fatherName}</p>
                    </div>
                </Dialog>
            )}

            {isEditFormVisible && (
                <Dialog header="Edit Candidate" visible={isEditFormVisible} style={{ width: '50vw' }} onHide={() => setIsEditFormVisible(false)}>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="flex flex-col">
                                <label htmlFor="name" className="mb-1 font-semibold text-lg">Name</label>
                                <input

                                    type="text"
                                    id="name"
                                    name="name"
                                    value={editFormData.name}
                                    onChange={handleEditFormChange}
                                    className="px-3 py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="email" className="mb-1 font-semibold text-lg">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={editFormData.email}
                                    onChange={handleEditFormChange}
                                    className="px-3 py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="contact" className="mb-1 font-semibold text-lg">Phone</label>
                                <input
                                    type="text"
                                    id="phone"
                                    name="phone"
                                    value={editFormData.phone}
                                    onChange={handleEditFormChange}
                                    className="px-3 py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="address" className="mb-1 font-semibold text-lg">Address</label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={editFormData.address}
                                    onChange={handleEditFormChange}
                                    className="px-3 py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>

                            <div className="flex flex-col">

                                <label htmlFor="enrollmentNo" className="mb-1 font-semibold text-lg">Enrollment Number</label>
                                <input

                                    type="text"
                                    id="enrollmentNo"
                                    name="enrollmentNo"
                                    value={editFormData.enrollmentNo}
                                    onChange={handleEditFormChange}
                                    className="px-3 py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="adharNo" className="mb-1 font-semibold text-lg">Aadhar Number</label>
                                <input
                                    type="text"
                                    id="adharNo"
                                    name="adharNo"
                                    value={editFormData.adharNo}
                                    onChange={handleEditFormChange}
                                    className="px-3 py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="fatherName" className="mb-1 font-semibold text-lg">Father Name</label>
                                <input
                                    type="text"
                                    id="fatherName"
                                    name="fatherName"
                                    value={editFormData.fatherName}
                                    onChange={handleEditFormChange}
                                    className="px-3 py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>

                            <div className="flex flex-col relative">
                                <label htmlFor="password" className="mb-1 font-semibold text-lg">Password</label>
                                <input
                                    type={passwordVisible ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={editFormData.password}
                                    onChange={handleEditFormChange}
                                    className="px-3 py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                                <span
                                    onClick={togglePasswordVisibility}
                                    className="absolute text-2xl right-3 top-11 cursor-pointer text-gray-500"
                                >
                                    {passwordVisible ? <FaEye /> : <FaEyeSlash />}
                                </span>
                            </div>

                        </div>

                        <div className="flex space-x-4">
                            <button type="submit" className="w-36 py-3 text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br shadow-lg shadow-purple-400/50 dark:shadow-xl dark:shadow-purple-800/80 font-medium rounded-md text-sm px-5 text-center me-2 mb-2 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110">
                                Update
                            </button>

                            <button type="button" onClick={() => setIsEditFormVisible(false)} className="w-32 py-3 text-white bg-red-600 hover:bg-red-700 focus:ring-red-300 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-md text-sm px-5 text-center me-2 mb-2 transition-all duration-200 ease-in-out transform hover:-translate-y-1 hover:scale-110">Close</button>
                        </div>
                    </form>
                </Dialog>
            )}

            {isConfirmVisible && (
                <Dialog header={confirmAction} visible={isConfirmVisible} style={{ width: '30vw' }} onHide={() => setIsConfirmVisible(false)}>
                    <div className="confirmation-content">
                        <i className="pi pi-exclamation-triangle px-5" style={{ fontSize: '1rem', color: 'orange' }}></i>
                        <span>Are you sure you want to {confirmAction} this Batch?</span>
                    </div>
                    <div className="flex justify-end space-x-4 mt-4">
                        <Button label="Yes" icon="pi pi-check" className="p-button-danger" onClick={confirmActionHandler} />
                        <Button label="No" icon="pi pi-times" className="p-button-secondary" onClick={() => setIsConfirmVisible(false)} />
                    </div>
                </Dialog>
            )}



            <div className="min-w-full inline-block align-middle overflow-x-auto mt-10">
                <div className="flex justify-between items-center mb-4">
                    <div className='flex gap-4'>
                        <h3 className="text-xl font-bold">Candidates List</h3>
                        <Button
                            label="Download Excel"
                            icon='pi pi-file-excel'
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 sm:py-2 sm:px-4 rounded-md text-xs sm:text-sm w-full sm:w-auto ml-2 lg:text-sm"
                            onClick={handleDownloadCandidates}
                        />
                    </div>

                    <div>
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

                </div>
                <div className="max-w-[23rem] p-1 md:max-w-[50rem] sm:max-w-[30rem] lg:max-w-[75rem]">
                    <DataTable
                        value={candidates}
                        paginator rows={10}
                        rowsPerPageOptions={[5, 10, 20, 50]}
                        responsiveLayout="scroll"
                        scrollable={true}
                        selection={selectedCandidates}
                        onSelectionChange={e => setSelectedCandidates(e.value)}
                        globalFilter={globalFilter}
                        className="min-w-full bg-white border border-gray-200"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3em' }} ></Column>
                        <Column body={actionBodyTemplate} header="Actions" className="py-2 px-4 border-b" />
                        <Column field="_id" header="Candidate Id" className="py-2 px-4 border-b" />
                        <Column field="enrollmentNo" header="Enrollment Number" className="py-2 px-4 border-b" />
                        <Column field="password" header="Candidate Password" className="py-2 px-4 border-b" />
                        <Column field="name" header="Candidate Name" className="py-2 px-4 border-b" />
                        <Column field="email" header="Email" className="py-2 px-4 border-b" />
                        <Column field="phone" header="Phone" className="py-2 px-4 border-b" />

                        <Column field="adharNo" header="Aadhar Number" className="py-2 px-4 border-b" />
                        <Column field="fatherName" header="Father Name" className="py-2 px-4 border-b" />

                    </DataTable>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 p-4 gap-4">
                <span className="font-medium text-lg">Total Records: {totalCandidates}</span>
            </div>


        </div>
    );
};

export default ManageCandidate;