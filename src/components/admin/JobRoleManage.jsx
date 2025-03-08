
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Menu } from 'primereact/menu';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FaEdit } from 'react-icons/fa';
import { IoMdAdd, IoMdClose } from 'react-icons/io';
import { VscClearAll } from 'react-icons/vsc';
import { useDispatch, useSelector } from 'react-redux';
import { createJobRole, deleteJobRole, fetchJobRolesBySector, lockJobRole, setSelectedSector, unlockJobRole, updateJobRole } from '../features/jobRoleSlice';
import { fetchSectors } from '../features/subAdminSlice';


const JobRoleManage = () => {
    const dispatch = useDispatch();
    const [jobRole, setJobRole] = useState('');
    const [qpCode, setQpCode] = useState('');
    const [version, setVersion] = useState(1);
    const [NsqfLevel, setNsqfLevel] = useState();
    const [totalMarks, setTotalMarks] = useState();
    const [passingPercentage, setPassingPercentage] = useState();
    const [totalMarksInPractical, setTotalMarksInPractical] = useState();
    const [totalMarksInViva, setTotalMarksInViva] = useState();
    const [totalMarksInTheory, setTotalMarksInTheory] = useState();
    const [submitted, setSubmitted] = useState(false);
    const [isEditFormVisible, setIsEditFormVisible] = useState(false);
    const [selectedJobRole, setSelectedJobRole] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [viewData, setViewData] = useState(null);
    const [formVisible, setFormVisible] = useState(false);
    const [isViewFormVisible, setIsViewFormVisible] = useState(false);
    const [editFormData, setEditFormData] = useState({
        _id: '',
        name: '',
        qpCode: '',
        version: '',
        nsqfLevel: '',
        totalMarks: '',
        passingPercentage: '',
        totalMarksInTheory: '',
        totalMarksInPractical: '',
        totalMarksInViva: ''
    });

    const { sectors, selectedSector, jobRoles } = useSelector(state => state.jobRole);

    const showButtons = selectedSector && !formVisible;

    useEffect(() => {
        dispatch(fetchSectors());

        if (selectedSector) {
            dispatch(fetchJobRolesBySector(selectedSector._id));
        }

    }, [dispatch, selectedSector]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedSector && jobRole && qpCode && version && NsqfLevel && totalMarks && totalMarksInViva && totalMarksInPractical && totalMarksInTheory && passingPercentage) {

            await dispatch(createJobRole({
                sector: selectedSector._id,
                name: jobRole,
                qpCode: qpCode,
                version: Number(version),
                nsqfLevel: Number(NsqfLevel),
                totalMarks: Number(totalMarks),
                passingPercentage: Number(passingPercentage),
                totalMarksInTheory: Number(totalMarksInTheory),
                totalMarksInPractical: Number(totalMarksInPractical),
                totalMarksInViva: Number(totalMarksInViva)
            }));

            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 1000);
            dispatch(fetchJobRolesBySector(selectedSector._id))
            handleClear();
        }
    };

    const handleClear = () => {
        setJobRole('');
        setVersion('');
        setNsqfLevel('');
        setQpCode('');
        setTotalMarks('');
        setTotalMarksInTheory('');
        setPassingPercentage('');
        setTotalMarksInPractical('');
        setTotalMarksInViva('');
    };

    const handleSectorChange = (e) => {
        const sectorId = e.target.value;
        const sector = sectors.find(s => s._id === sectorId);
        dispatch(setSelectedSector(sector));
    };

    const handleEditClick = (rowData) => {
        setEditFormData({
            _id: rowData._id,
            name: rowData.name,
            qpCode: rowData.qpCode,
            version: rowData.version,
            nsqfLevel: rowData.nsqfLevel,
            totalMarks: rowData.totalMarks,
            passingPercentage: rowData.passingPercentage,
            totalMarksInTheory: rowData.totalMarksInTheory,
            totalMarksInPractical: rowData.totalMarksInPractical,
            totalMarksInViva: rowData.totalMarksInViva
        });
        setIsEditFormVisible(true);
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };
    const handleEditFormSubmit = async (e) => {
        e.preventDefault();

        const { _id, ...updatedJobRole } = {
            ...editFormData,
            version: Number(editFormData.version),
            nsqfLevel: Number(editFormData.nsqfLevel),
            totalMarks: Number(editFormData.totalMarks),
            passingPercentage: Number(editFormData.passingPercentage),
            totalMarksInTheory: Number(editFormData.totalMarksInTheory),
            totalMarksInPractical: Number(editFormData.totalMarksInPractical),
            totalMarksInViva: Number(editFormData.totalMarksInViva)
        };

        console.log('Submitting Update for Job Role:', updatedJobRole);

        try {
            const resultAction = await dispatch(updateJobRole({ _id, updatedJobRole }));
            if (updateJobRole.fulfilled.match(resultAction)) {
                setIsEditFormVisible(false);
                dispatch(fetchJobRolesBySector(selectedSector._id));
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleView = (rowData) => {
        setViewData(rowData);
        setIsViewFormVisible(true);
    };


    const handleDeleteClick = (rowData) => {
        setSelectedJobRole(rowData);
        setConfirmAction('delete');
        setIsConfirmVisible(true);
    };

    const handleLockClick = (rowData) => {
        setSelectedJobRole(rowData);
        setConfirmAction('lock');
        setIsConfirmVisible(true);
    };

    const handleUnlockClick = (rowData) => {
        setSelectedJobRole(rowData);
        setConfirmAction('unlock');
        setIsConfirmVisible(true);
    };

    const handleCopyId = (rowData) => {
        if (rowData && rowData._id) {
            navigator.clipboard.writeText(rowData._id);
            toast.success('Job Role ID copied to clipboard!');
        }
    };

    const confirmActionHandler = async () => {
        if (!selectedJobRole || !selectedJobRole._id) {
            toast.error('Invalid job role selected');
            return;
        }

        const jobRoleId = selectedJobRole._id;

        try {
            let resultAction;
            if (confirmAction === 'lock') {
                resultAction = await dispatch(lockJobRole(jobRoleId));

            } else if (confirmAction === 'unlock') {
                resultAction = await dispatch(unlockJobRole(jobRoleId));
            }else if (confirmAction === 'delete') {
                resultAction = await dispatch(deleteJobRole(jobRoleId));

            }
            dispatch(fetchJobRolesBySector(selectedSector._id));
        } catch (error) {
            toast.error(error);
        } finally {
            setIsConfirmVisible(false);
            setSelectedJobRole(null);
        }
    };

    const type = sessionStorage.getItem("type");
    const menuRefs = useRef([]);
    const actionBodyTemplate = (rowData, options) => {
        const items = [
            {
                label: 'Edit',
                icon: 'pi pi-pencil',
                command: () => handleEditClick(rowData),
                disabled: type === 'sub-admin' && rowData.isLocked
            },
            {
                label: 'Delete',
                icon: 'pi pi-trash',
                command: () => handleDeleteClick(rowData),
                disabled: rowData.isLocked && type === 'sub-admin'
            },
            {
                label: 'View',
                icon: 'pi pi-eye',
                command: () => handleView(rowData)
            },
            {
                label: rowData.isLocked ? 'Locked' : 'Lock Job Role',
                icon: 'pi pi-lock',
                command: () => handleLockClick(rowData),
                disabled: rowData.isLocked
            },
            {
                label: rowData.isLocked ? 'Unlock Job Role' : 'Unlocked',
                icon: 'pi pi-unlock',
                command: () => handleUnlockClick(rowData),
                disabled:type === 'sub-admin'
            },
            {
                label: 'Copy Job Role ID',
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

    const filteredJobRoles = selectedSector ? jobRoles?.filter(jobRole => jobRole?.sector?._id === selectedSector._id) : [];

    console.log(filteredJobRoles);

    return (

        <div className="max-w-[20rem]  xs:max-w-[23rem] sm:max-w-[60rem] my-2 mt-14 md:max-w-[86rem]  lg:max-w-[100%] xl:w-[100%]
        mx-auto sm:mt-5 p-0 sm:p-2  py-8 bg-white border-2 border-white/10 backdrop-blur-[20px] items-center overflow-hidden duration-200 ease-in-out text-black rounded-lg shadow-lg flex-grow-0 ">
            <h2 className="text-xl font-bold mb-4 ml-1  p-2 text-center sm:text-left">Manage Job Role</h2>

            <div className="flex flex-col  space-y-4 my-5">
                <div className="grid grid-cols-1 md:grid-cols-3 p-2 gap-4 bg-gray-100 rounded-lg py-2 pb-6">
                    <div className="flex flex-col">
                        <label htmlFor="sector" className="mb-1 font-semibold text-lg ml-1">Select Sector</label>
                        <select
                            id="sector"
                            value={selectedSector ? selectedSector._id : ''}
                            onChange={handleSectorChange}
                            className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        >
                            <option value="">Select Sector</option>
                            {sectors.map((sector) => (
                                <option key={sector._id} value={sector._id}>{`${sector.name.toUpperCase()} (${sector.sector_short_name.toUpperCase()})`}</option>
                            ))}
                        </select>
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

            {formVisible && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                        <div className="flex flex-col">
                            <label htmlFor="jobrole" className="mb-1 font-semibold text-lg ml-1">Job Role/QP</label>
                            <input
                                type="text"
                                id="jobrole"
                                value={jobRole || ''}
                                placeholder="Enter Job Role/QP"
                                onChange={(e) => setJobRole(e.target.value)}
                                className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                disabled={!selectedSector}
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="qpcode" className="mb-1 font-semibold text-lg ml-1">QP Code</label>
                            <input
                                type="text"
                                id="qpcode"
                                value={qpCode}
                                placeholder="Enter QP Code"
                                onChange={(e) => setQpCode(e.target.value)}
                                className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                disabled={!selectedSector}
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="version" className="mb-1 font-semibold text-lg ml-1">Version</label>
                            <input
                                type="number"
                                id="version"
                                value={version}
                                placeholder="Version"
                                onChange={(e) => setVersion(e.target.value)}
                                onWheel={(e) => e.target.blur()}
                                className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                disabled={!selectedSector}
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="nsqf" className="mb-1 font-semibold text-lg ml-1">NSQF Level</label>
                            <input
                                type="number"
                                id="nsqf"
                                value={NsqfLevel || ''}
                                placeholder="Enter NSQF Level"
                                onChange={(e) => setNsqfLevel(e.target.value)}
                                onWheel={(e) => e.target.blur()}
                                className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                disabled={!selectedSector}
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="totalmarks" className="mb-1 font-semibold text-lg ml-1">Total Marks</label>
                            <input
                                type="number"
                                id="totalmarks"
                                value={totalMarks}
                                placeholder="Enter Total Marks"
                                onChange={(e) => setTotalMarks(e.target.value)}
                                onWheel={(e) => e.target.blur()}
                                className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                disabled={!selectedSector}
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="totalmarksintheory" className="mb-1 font-semibold text-lg ml-1">Total Marks in Theory</label>
                            <input
                                type="number"
                                id="totalmarksintheory"
                                value={totalMarksInTheory}
                                placeholder="Enter Total Marks in Theory"
                                onChange={(e) => setTotalMarksInTheory(e.target.value)}
                                onWheel={(e) => e.target.blur()}
                                className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                disabled={!selectedSector}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="totalmarksinpractical" className="mb-1 font-semibold text-lg ml-1">Total Marks in Practical</label>
                            <input
                                type="number"
                                id="totalmarksinpractical"
                                value={totalMarksInPractical}
                                placeholder="Enter Total Marks in Practical"
                                onChange={(e) => setTotalMarksInPractical(e.target.value)}
                                onWheel={(e) => e.target.blur()}
                                className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                disabled={!selectedSector}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="totalmarksinviva" className="mb-1 font-semibold text-lg ml-1">Total Marks in Viva</label>
                            <input
                                type="number"
                                id="totalmarksinviva"
                                value={totalMarksInViva}
                                placeholder="Enter Total Marks in Viva"
                                onChange={(e) => setTotalMarksInViva(e.target.value)}
                                onWheel={(e) => e.target.blur()}
                                className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                disabled={!selectedSector}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="passingpercentage" className="mb-1 font-semibold text-lg ml-1">Passing Percentage</label>
                            <input
                                type="number"
                                id="passingpercentage"
                                value={passingPercentage}
                                placeholder="Enter Passing Percentage"
                                onChange={(e) => setPassingPercentage(e.target.value)}
                                onWheel={(e) => e.target.blur()}
                                className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                disabled={!selectedSector}
                            />
                        </div>
                    </div>
                    {!selectedSector && (
                        <div className="text-red-500 text-md mt-2">
                            Please select a Sector before entering Job Role information.
                        </div>
                    )}
                    <div className="flex space-x-4">
                        <button type="submit" className="w-32 py-2 text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-md text-sm px-5 text-center me-2 mb-2 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 flex items-center justify-center">  <span className='pr-2'><IoMdAdd className='w-5 h-5' /></span>    <span>Add</span></button>
                        <button type="button" onClick={handleClear} className="w-32 py-2 text-white bg-gray-600 hover:bg-gray-700 focus:ring-blue-300 shadow-lg shadow-gray-500/50 dark:shadow-lg dark:shadow-gray-800/80 font-medium rounded-md text-sm px-5 text-center me-2 mb-2 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 flex items-center justify-center">
                            <span className='pr-2'><VscClearAll className='w-5 h-5' /></span>
                            <span>Clear</span>
                        </button>

                        <button type="button" onClick={() => setFormVisible(false)} className="w-32 py-2 text-white bg-red-600 hover:bg-red-700 focus:ring-red-300 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-md text-sm px-5 text-center me-2 mb-2 transition-all duration-200 ease-in-out transform hover:-translate-y-1 hover:scale-110 flex items-center justify-center">
                            <span className='pr-2'><IoMdClose className='w-5 h-5' /></span>
                            <span>Close</span>
                        </button>
                    </div>
                </form>
            )}

            {viewData && (
                <Dialog header="Job Role Details" visible={isViewFormVisible} style={{ width: '50vw' }} onHide={() => setIsViewFormVisible(false)}>
                    <div>
                        <p><strong>Job Role ID:</strong> {viewData._id}</p>
                        <p><strong>Job Role Name:</strong> {viewData.name}</p>
                        <p><strong>QP Code:</strong> {viewData.qpCode}</p>
                        <p><strong>Version:</strong> {viewData.version}</p>
                        <p><strong>NSQF Level:</strong> {viewData.nsqfLevel}</p>
                        <p><strong>Total Marks:</strong> {viewData.totalMarks}</p>
                        <p><strong>Passing Percentage:</strong> {viewData.passingPercentage}</p>
                        <p><strong>Total Marks in Theory:</strong> {viewData.totalMarksInTheory}</p>
                        <p><strong>Total Marks in Practical:</strong> {viewData.totalMarksInPractical}</p>
                        <p><strong>Total Marks in Viva:</strong> {viewData.totalMarksInViva}</p>
                        <p><strong>Locked:</strong> {viewData.isLocked ? 'Yes' : 'No'}</p>
                    </div>
                </Dialog>
            )}
            <Dialog header="Edit Job Role" visible={isEditFormVisible} style={{ width: '50vw' }} onHide={() => setIsEditFormVisible(false)}>
                <form onSubmit={handleEditFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        <div className="flex flex-col flex-1">
                            <label htmlFor="name" className="mb-1 font-semibold text-sm md:text-lg">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={editFormData.name}
                                onChange={handleEditFormChange}
                                className="px-2 py-2 md:px-3 md:py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label htmlFor="qpCode" className="mb-1 font-semibold text-sm md:text-lg">QP Code</label>
                            <input
                                type="text"
                                id="qpCode"
                                name="qpCode"
                                value={editFormData.qpCode}
                                onChange={handleEditFormChange}
                                className="px-2 py-2 md:px-3 md:py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label htmlFor="version" className="mb-1 font-semibold text-sm md:text-lg">Version</label>
                            <input

                                type="text"
                                id="version"
                                name="version"
                                value={editFormData.version}
                                onChange={handleEditFormChange}
                                className="px-2 py-2 md:px-3 md:py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label htmlFor="nsqfLevel" className="mb-1 font-semibold text-sm md:text-lg">NSQF Level</label>
                            <input

                                type="text"
                                id="nsqfLevel"
                                name="nsqfLevel"
                                value={editFormData.nsqfLevel}
                                onChange={handleEditFormChange}
                                className="px-2 py-2 md:px-3 md:py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label htmlFor="totalMarks" className="mb-1 font-semibold text-sm md:text-lg">Total Marks</label>
                            <input
                                type='number'
                                id="totalMarks"
                                name="totalMarks"
                                value={editFormData.totalMarks}
                                onChange={handleEditFormChange}
                                onWheel={(e) => e.target.blur()}
                                className="px-2 py-2 md:px-3 md:py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"

                            />
                        </div>

                        <div className="flex flex-col flex-1">
                            <label htmlFor="totalMarksInTheory" className="mb-1 font-semibold text-sm md:text-lg">Total Marks in Theory</label>
                            <input

                                type='number'
                                id="totalMarksInTheory"
                                name="totalMarksInTheory"
                                value={editFormData.totalMarksInTheory}
                                onChange={handleEditFormChange}
                                onWheel={(e) => e.target.blur()}
                                className="px-2 py-2 md:px-3 md:py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label htmlFor="totalMarksInPractical" className="mb-1 font-semibold text-sm md:text-lg">Total Marks in Practical</label>
                            <input
                                type='number'
                                id="totalMarksInPractical"
                                name="totalMarksInPractical"
                                value={editFormData.totalMarksInPractical}
                                onChange={handleEditFormChange}
                                onWheel={(e) => e.target.blur()}
                                className="px-2 py-2 md:px-3 md:py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label htmlFor="totalMarksInViva" className="mb-1 font-semibold text-sm md:text-lg">Total Marks in Viva</label>
                            <input

                                type='number'
                                id="totalMarksInViva"
                                name="totalMarksInViva"
                                value={editFormData.totalMarksInViva}
                                onChange={handleEditFormChange}
                                onWheel={(e) => e.target.blur()}
                                className="px-2 py-2 md:px-3 md:py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label htmlFor="passingPercentage" className="mb-1 font-semibold text-sm md:text-lg">Passing Percentage</label>
                            <input

                                type='number'
                                id="passingPercentage"
                                name="passingPercentage"
                                value={editFormData.passingPercentage}
                                onChange={handleEditFormChange}
                                onWheel={(e) => e.target.blur()}
                                className="px-2 py-2 md:px-3 md:py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            />
                        </div>
                    </div>
                    <div className="flex space-x-4">
                        <button type="submit" className="w-32 py-2 text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-md text-sm px-5 text-center me-2 mb-2 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 flex items-center justify-center"> <span className='pr-2'><FaEdit className="w-4 h-4" /></span>Update</button>
                        <button type="button" onClick={() => setIsEditFormVisible(false)} className="w-32 py-2 text-white bg-red-600 hover:bg-red-700 focus:ring-red-300 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-md text-sm px-5 text-center me-2 mb-2 transition-all duration-200 ease-in-out transform hover:-translate-y-1 hover:scale-110 flex items-center justify-center">
                            <span className='pr-2'><IoMdClose className='w-5 h-5' /></span>
                            <span>Close</span>
                        </button>
                    </div>
                </form>
            </Dialog>

            <Dialog header={confirmAction === 'lock' ? "Confirm Lock" : "Confirm Delete"} visible={isConfirmVisible} style={{ width: '30vw' }} onHide={() => setIsConfirmVisible(false)}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle px-5" style={{ fontSize: '1rem', color: 'orange' }}></i>
                    <span>Are you sure you want to {confirmAction} this job role?</span>
                </div>
                <div className="flex justify-end space-x-4 mt-4">
                    <Button label="Yes" icon="pi pi-check" className="p-button-danger" onClick={confirmActionHandler} />
                    <Button label="No" icon="pi pi-times" className="p-button-secondary" onClick={() => setIsConfirmVisible(false)} />
                </div>
            </Dialog>

            <div className="mt-8 overflow-x-auto sm:w-full md:w-[100%] xl:w-full">

                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-4 sm:space-y-0">
                    <h3 className="text-xl font-bold">Job Role List</h3>
                    <span className="p-input-icon-left w-full sm:w-auto px-2">
                        <i className="pi pi-search px-2" />
                        <InputText
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Search..."
                            className="px-8 py-2 w-full sm:w-72 rounded-md"
                        />
                    </span>
                </div>
                <div className=" p-1 md:max-w-full lg:max-w-[100%] max-w-[20rem]  xs:max-w-[23rem] sm:max-w-[50rem]">
                    <DataTable
                        value={jobRoles}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 20, 50]}
                        responsiveLayout="scroll"
                        scrollable={true}
                        globalFilter={globalFilter}
                        className="min-w-full bg-white border border-gray-200"
                    >
                        <Column body={actionBodyTemplate} header="Actions" className="sm:px-1 py-2 px-4 border-b" />
                        <Column field="_id" header="Id" className="sm:px-1 py-2 px-4 border-b" />
                        <Column field="name" header="Job Role" className="sm:px-1 py-2 px-4 border-b" />
                        <Column field="qpCode" header="QP Code" className="sm:px-1 py-2 px-4 border-b" />
                        <Column field="totalMarks" header="Total Marks" className="sm:px-1 py-1 px-1 border-b" />
                    </DataTable>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center font-semibold p-1 gap-4 sm:gap-80">
                    <span>Total Records: {jobRoles?.length}</span>
                </div>
            </div>
        </div>

    );

};

export default JobRoleManage;