import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import 'primeicons/primeicons.css';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiDownload } from "react-icons/fi";
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Select from 'react-select';
import * as XLSX from 'xlsx';
import { BASE_URL } from '../constant';
import { setSelectedBatch, setSelectedJobRole, setSelectedSector } from '../features/assignTestSlice';
import { fetchBatchesBySectorJobRole } from '../features/batchSlice';
import { clearCandidates, fetchCandidateByBatchId } from '../features/candidateBatchStatusSlice';
import { fetchJobRolesBySector } from '../features/jobRoleSlice';
import { fetchSectors } from '../features/subAdminSlice';
const CandidatesForBatch = () => {
    const dispatch = useDispatch();
    const { batchId } = useParams();
    const [globalFilter, setGlobalFilter] = useState('');
    const [allResetChecked, setAllResetChecked] = useState(false);
    const [resetStatus, setResetStatus] = useState({});
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);
    const { candidates, totalCandidates } = useSelector(state => state.candidateEvidence);
    const {
        batches, jobRoles, sectors,
        selectedBatch, selectedJobRole,
        selectedSector
    } = useSelector(state => state.assignTest);
    const [zoomImage, setZoomImage] = useState(null);
    const [zoomImageName, setZoomImageName] = useState('');
    const [zoomImageType, setZoomImageType] = useState('');
    const [isDialogVisible, setDialogVisible] = useState(false);

    const imageTemplate = (rowData, field) => {
        return (
            <img
                src={rowData[field]}
                alt="Candidate"
                style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }}
                onClick={() => {
                    setZoomImage(rowData[field]);
                    setZoomImageName(rowData.name);
                    setDialogVisible(true);
                    setZoomImageType(field === 'candidateSelfie' ? 'Photo' : 'ID');
                }}
            />
        );
    };

    const confirmReset = () => {
        setIsConfirmVisible(true);
    };
    const rejectReset = () => {
        setIsConfirmVisible(false);
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
        } else {
            dispatch(clearCandidates());
        }
    };

    useEffect(() => {
        dispatch(fetchSectors());
        if (selectedSector) {
            dispatch(fetchJobRolesBySector(selectedSector._id));
        }
        if (selectedSector && selectedJobRole) {
            dispatch(fetchBatchesBySectorJobRole({ sectorId: selectedSector._id, jobRoleId: selectedJobRole._id }));
        }

        if (batchId) {
            dispatch(fetchCandidateByBatchId(batchId))
        }

    }, [dispatch, batchId, selectedSector, selectedJobRole]);

    const yesNoTemplate = (rowData, field) => {
        const value = rowData[field];
        const style = {
            color: value ? 'green' : 'red',
            boxShadow: `0 0 5px ${value ? 'green' : 'red'}`,
            padding: '1px',
            borderRadius: '3px',
            textAlign: 'center'
        };
        return <div style={style}>{value ? 'YES' : 'No'}</div>;
    };

    const presentTemplate = (rowData, field) => {
        const value = rowData[field];
        const style = {
            color: value ? 'green' : 'red',
            boxShadow: `0 0 5px ${value ? 'green' : 'red'}`,
            padding: '1px',
            borderRadius: '3px',
            textAlign: 'center'
        };
        return <div style={style}>{value ? 'Present' : 'Absent'}</div>;
    };

    const getStatusStyle = (value, statusMap) => {
        const status = statusMap[value] || { color: 'gray', text: 'No Status' };
        return {
            color: status.color,
            boxShadow: `0 0 5px ${status.color}`,
            padding: '1px',
            borderRadius: '3px',
            textAlign: 'center',
            text: status.text,
        };
    };

    const examStatusTemplate = (rowData, field) => {
        const value = rowData[field];
        const statusMap = {
            submitted: { color: 'green', text: 'Submitted' },
            started: { color: 'orange', text: 'Started' },
            notStarted: { color: 'red', text: 'Not Started' },
        };
        const style = getStatusStyle(value, statusMap);
        return <div style={style}>{style.text}</div>;
    };

    const reasonTheorySubmission = (rowData, field) => {
        const value = rowData[field];
        const statusMap = {
            testCompleted: { color: 'green', text: 'Test Completed' },
            timeExpired: { color: 'orange', text: 'Time Expired' },
            candidateRefreshedThePage: { color: 'blue', text: 'Page Refreshed' },
            candidateWentOffline: { color: 'orange', text: 'Candidate Went Offline' },
        };
        const style = getStatusStyle(value, statusMap);
        return <div style={style}>{style.text}</div>;
    };

    const convertToIST = (timestamp) => {
        if (!timestamp) {
            console.error('Invalid timestamp:', timestamp);
            return 'Invalid Date';
        }

        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
            console.error('Invalid date object:', date);
            return 'Invalid Date';
        }

        const options = {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        return new Intl.DateTimeFormat('en-GB', options).format(date);
    };

    const handleResetTheory = async () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            toast.error('Access token is missing');
            return;
        }

        const candidateIdsToReset = Object.keys(resetStatus)
            .filter(candidateId => resetStatus[candidateId].checked);

        console.log('Candidates to reset:', candidateIdsToReset);

        if (candidateIdsToReset.length === 0) {
            toast.error('No candidates selected for reset.');
            return;
        }

        try {
            const response = await axios.post(`${BASE_URL}company/batches/${selectedBatch._id}/reset-theory-test`, {
                candidates: candidateIdsToReset
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.status === 200 || response.status === 204) {
                toast.success('Theory reset successfully');

                const resetStatus = candidates.reduce((acc, candidate) => {
                    acc[candidate._id] = { checked: false, submitted: false };
                    return acc;
                }, {});

                setResetStatus(resetStatus);

                setAllResetChecked(false);

                sessionStorage.setItem('isMarkAllAttendanceDisabled', JSON.stringify(false));
            } else {
                toast.error('Failed to reset candidates. Please try again.');
            }
        } catch (error) {
            console.error('Error resetting candidates:', error);
            toast.error(error.response?.data?.message || 'Error resetting candidates');
        }
    };

    const handleResetPractical = async () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            toast.error('Access token is missing');
            return;
        }

        const candidateIdsToReset = Object.keys(resetStatus)
            .filter(candidateId => resetStatus[candidateId].checked);

        console.log('Candidates to reset:', candidateIdsToReset);

        if (candidateIdsToReset.length === 0) {
            toast.error('No candidates selected for reset.');
            return;
        }

        try {
            const response = await axios.post(`${BASE_URL}company/batches/${selectedBatch._id}/reset-practical-test`, {
                candidates: candidateIdsToReset
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.status === 200 || response.status === 204) {
                toast.success('Practical reset successfully');

                const resetStatus = candidates.reduce((acc, candidate) => {
                    acc[candidate._id] = { checked: false, submitted: false };
                    return acc;
                }, {});

                setResetStatus(resetStatus);

                setAllResetChecked(false);

                sessionStorage.setItem('isMarkAllAttendanceDisabled', JSON.stringify(false));
            } else {
                toast.error('Failed to reset candidates. Please try again.');
            }
        } catch (error) {
            console.error('Error resetting candidates:', error);
            toast.error(error.response?.data?.message || 'Error resetting candidates');
        }
    };

    const handleResetViva = async () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            toast.error('Access token is missing');
            return;
        }

        const candidateIdsToReset = Object.keys(resetStatus)
            .filter(candidateId => resetStatus[candidateId].checked);

        console.log('Candidates to reset:', candidateIdsToReset);

        if (candidateIdsToReset.length === 0) {
            toast.error('No candidates selected for reset.');
            return;
        }

        try {
            const response = await axios.post(`${BASE_URL}company/batches/${selectedBatch._id}/reset-viva-test`, {
                candidates: candidateIdsToReset
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.status === 200 || response.status === 204) {
                toast.success('Viva reset successfully');

                const resetStatus = candidates.reduce((acc, candidate) => {
                    acc[candidate._id] = { checked: false, submitted: false };
                    return acc;
                }, {});

                setResetStatus(resetStatus);

                setAllResetChecked(false);

                sessionStorage.setItem('isMarkAllAttendanceDisabled', JSON.stringify(false));
            } else {
                toast.error('Failed to reset candidates. Please try again.');
            }
        } catch (error) {
            console.error('Error resetting candidates:', error);
            toast.error(error.response?.data?.message || 'Error resetting candidates');
        }
    };

    const handleResetChange = (candidateId, checked) => {
        setResetStatus(prevState => ({
            ...prevState,
            [candidateId]: { ...prevState[candidateId], checked },
        }));
    };

    const handleMarkAllReset = (checked) => {
        setAllResetChecked(checked);
        const updatedResetStatus = candidates.reduce((acc, candidate) => {
            acc[candidate._id] = { ...resetStatus[candidate._id], checked };
            return acc;
        }, {});
        setResetStatus(updatedResetStatus);
    };

    const handleViewEvidence = (candidate) => {
        const url = `/batchEvidence/candidate/${candidate._id}`;
        window.open(url, '_blank');
    };

    const viewEvidenceTemplate = (rowData) => {
        return (
            <Button
                icon="pi pi-eye"
                className="p-button-rounded p-button-info h-7 w-7 font-bold hover:text-green-700"
                onClick={() => handleViewEvidence(rowData)}
            />
        );
    };

    const capitalizeFirstLetter = (string) => {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    };
    const handleDownloadLogs = async (candidateId) => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token is missing');
            }

            const response = await axios.get(`${BASE_URL}company/candidates/${candidateId}/theory-logs`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const logs = response.data.data;
            console.log('Logs fetched successfully:', logs);

            downloadLogsAsCSV(logs, candidateId);
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    };


    const downloadLogsAsCSV = (logs, candidateId) => {
        if (!Array.isArray(logs)) {
            console.error('Logs is not an array:', logs);
            return;
        }

        const csvData = logs.map(log => {
            const startedAt = new Date(log.startedAt);
            const endedAt = new Date(log.endedAt);
            const timeTaken = ((endedAt - startedAt) / 1000).toFixed(2);

            return {
                QuestionBank: log.questionBank,
                Question: log.question,
                Answer: log.answer,
                Marks: log.marks,
                StartedAt: convertToIST(log.startedAt),
                EndedAt: convertToIST(log.endedAt),
                TimeTaken: `${timeTaken} sec`
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(csvData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Logs');
        XLSX.writeFile(workbook, `Candidate_${candidateId}_Logs.xlsx`);
    };

    const handleDownloadSelectedPDF = () => {
        const selectedCandidates = candidates.filter(
            candidate => resetStatus[candidate._id]?.checked
        );

        if (selectedCandidates.length === 0) {
            toast.error("No candidates selected for download.");
            return;
        }

        const doc = new jsPDF();
        const tableColumn = [
            "Candidate ID", "Enrollment No", "Name", "Theory Present", "Practical Present",
            "Viva Present", "Evidence Uploaded", "Theory Status",
            "Practical Status", "Viva Status"
        ];
        const tableRows = selectedCandidates.map(candidate => [
            candidate._id,
            candidate.enrollmentNo,
            candidate.name,
            candidate.isPresentInTheory ? "Present" : "Absent",
            candidate.isPresentInPractical ? "Present" : "Absent",
            candidate.isPresentInViva ? "Present" : "Absent",
            candidate.isEvidanceUploaded ? "Yes" : "No",
            candidate.theoryExamStatus,
            candidate.practicalExamStatus === 'submitted' ? "Submitted" : "NotSubmitted",
            candidate.vivaExamStatus === 'submitted' ? "Submitted" : "NotSubmitted",
        ]);

        doc.setFontSize(20);
        const pageWidth = doc.internal.pageSize.getWidth();
        const text = `Selected Candidates`;
        const textWidth = doc.getTextWidth(text);
        const textX = (pageWidth - textWidth) / 2;
        doc.text(text, textX - 5, 15);
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            theme: 'striped',
            styles: { fontSize: 8, cellPadding: 1 },
            headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255] },
            margin: { top: 10, bottom: 5, left: 2, right: 2 },
        });
        doc.save(`Selected_Candidates.pdf`);
    };


    const handleDownloadSelectedExcel = () => {
        const selectedCandidates = candidates.filter(
            candidate => resetStatus[candidate._id]?.checked
        );

        if (selectedCandidates.length === 0) {
            toast.error("No candidates selected for download.");
            return;
        }

        const tableColumn = [
            "Candidate ID", "Enrollment No", "Name", "Email", "Aadhar No", "Gender",
            "Theory Present", "Practical Present", "Viva Present", "Evidence Uploaded",
            "Theory Status", "Practical Status", "Viva Status",
            "Theory Start Time", "Theory Submit Time"
        ];

        const tableRows = selectedCandidates.map(candidate => [
            candidate._id,
            candidate.enrollmentNo,
            candidate.name,
            candidate.email,
            candidate.adharNo,
            capitalizeFirstLetter(candidate.gender),
            candidate.isPresentInTheory ? "Present" : "Absent",
            candidate.isPresentInPractical ? "Present" : "Absent",
            candidate.isPresentInViva ? "Present" : "Absent",
            candidate.isEvidanceUploaded ? "Yes" : "No",
            candidate.theoryExamStatus,
            candidate.practicalExamStatus === 'submitted' ? "Submitted" : "NotSubmitted",
            candidate.vivaExamStatus === 'submitted' ? "Submitted" : "NotSubmitted",
            candidate.theoryStartedAt ? convertToIST(candidate.theoryStartedAt) : 'Invalid Date',
            candidate.theorySubmittedAt ? convertToIST(candidate.theorySubmittedAt) : 'Invalid Date',
        ]);

        const worksheet = XLSX.utils.json_to_sheet(tableRows);
        XLSX.utils.sheet_add_aoa(worksheet, [tableColumn], { origin: 'A1' });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `Selected_Candidates`);
        XLSX.writeFile(workbook, `Selected_Candidates.xlsx`);
    };


    return (
        <div className="max-w-[20rem]  xs:max-w-[23rem] sm:max-w-[60rem] my-2  md:max-w-[86rem]  lg:max-w-[100%] xl:w-[100%]
        mx-auto mt-5 p-0 sm:p-2  py-8 bg-white border-2 border-white/10 backdrop-blur-[20px] items-center overflow-hidden duration-200 ease-in-out text-black rounded-lg shadow-lg flex-grow-0 ">
            <h2 className="text-xl font-bold mb-4 ml-1  p-2 text-center sm:text-left">Batch Status</h2>
            <div className="flex flex-col space-y-4 my-5">
                <div className="grid p-2 grid-cols-1 md:grid-cols-3 gap-4 bg-gray-100 rounded-lg py-2 pb-6">
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
                            className="w-full text-sm border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition z-50"
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
                            className="w-full text-sm border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition z-30"

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

                <div className="min-w-full inline-block align-middle overflow-x-auto flex-grow-0 mt-4">
                    <div className="flex justify-between items-center mb-4">
                        <div>

                            <Button
                                label="Reset Candidates"
                                icon="pi pi-refresh"
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 sm:py-2 sm:px-3 rounded-md text-xs sm:text-sm w-full sm:w-auto ml-2 lg:text-xs"
                                onClick={confirmReset}
                            />
                            <Button
                                label="Download Excel"
                                icon='pi pi-file-excel'
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 sm:py-2 sm:px-4 rounded-md text-xs sm:text-sm w-full sm:w-auto ml-2 lg:text-xs"
                                onClick={handleDownloadSelectedExcel}
                            />
                            <Button
                                label="Download Pdf"
                                icon="pi pi-file-pdf"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 sm:py-2 sm:px-4 rounded-md text-xs sm:text-sm w-full sm:w-auto ml-2 lg:text-xs"
                                onClick={handleDownloadSelectedPDF}
                            />

                        </div>
                        <span className="p-input-icon-left w-full sm:w-auto">
                            <i className="pi pi-search px-2" />
                            <InputText
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                placeholder="Search..."
                                className="px-10 w-full sm:w-72 rounded-md"
                            />
                        </span>
                    </div>
                    <div className="max-w-[23rem] p-1 md:max-w-[50rem] sm:max-w-[30rem] lg:max-w-[76rem]">

                        <DataTable value={candidates}
                            paginator rows={10}
                            rowsPerPageOptions={[5, 10, 20, 50]}
                            responsiveLayout="scroll"
                            scrollable={true}
                            globalFilter={globalFilter}
                            totalRecords={candidates.length}
                            className="min-w-full bg-sky-100 border rounded-lg text-black">
                            <Column
                                header={
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <span>SELECT</span>
                                        <input
                                            type='checkbox'
                                            checked={allResetChecked}
                                            onChange={(e) => handleMarkAllReset(e.target.checked)}
                                            style={{ marginTop: '4px', marginBottom: '0' }}
                                        />
                                    </div>
                                }
                                body={(rowData) => (
                                    <input
                                        type='checkbox'
                                        checked={resetStatus[rowData._id]?.checked || false}
                                        onChange={(e) => handleResetChange(rowData._id, e.target.checked)}


                                    />
                                )}
                                className="py-2 px-4 border-b bg-sky-50 text-center"
                            />
                            <Column
                                field="candidateSelfie"
                                header="CANDIDATE PHOTO"
                                className="py-2 bg-sky-50 px-4 border-b header-gap"
                                body={(rowData) => imageTemplate(rowData, 'candidateSelfie')}
                            />
                            <Column
                                field="adharcardPicture"
                                header="UID PHOTO"
                                className="py-2 bg-sky-50 px-4 border-b header-gap"
                                body={(rowData) => imageTemplate(rowData, 'adharcardPicture')}
                            />

                            <Column field="enrollmentNo" header="ENROLLMENT NO" className="py-2 px-4 bg-sky-50 border-b header-gap text-gray-700 text-sm font-semibold" />
                            <Column field="name" header="NAME" className="py-2 px-4 border-b bg-sky-50 header-gap text-gray-700 font-semibold text-sm" />
                            <Column field="isPresentInTheory" header="THEORY PRESENT" className="py-2 bg-sky-50 px-4 border-b header-gap" body={(rowData) => presentTemplate(rowData, 'isPresentInTheory')} />
                            <Column field="isPresentInPractical" header="PRACTICAL PRESENT" className="py-2 px-4 bg-sky-50 border-b header-gap" body={(rowData) => presentTemplate(rowData, 'isPresentInPractical')} />
                            <Column field="isPresentInViva" header="VIVA PRESENT" className="py-2 bg-sky-50 px-4 border-b header-gap" body={(rowData) => presentTemplate(rowData, 'isPresentInViva')} />
                            <Column field="isEvidanceUploaded" header="EVIDENCE UPLOADED" className="py-2 bg-sky-50 px-4 border-b header-gap" body={(rowData) => yesNoTemplate(rowData, 'isEvidanceUploaded')} />
                            <Column field="theoryExamStatus" header="THEORY STATUS" className="py-2 bg-sky-50 px-4 border-b header-gap" body={(rowData) => examStatusTemplate(rowData, 'theoryExamStatus')} />
                            <Column field="theoryStartedAt" header="THEORY START TIME" className="py-2 bg-sky-50 px-4 border-b header-gap text-sm text-gray-700 font-semibold" body={(rowData) => rowData.theoryStartedAt ? convertToIST(rowData.theoryStartedAt) : 'Invalid Date'} />
                            <Column field="theorySubmittedAt" header="THEORY SUBMIT TIME" className="py-2 bg-sky-50 px-4 border-b header-gap text-sm text-gray-700 font-semibold" body={(rowData) => rowData.theorySubmittedAt ? convertToIST(rowData.theorySubmittedAt) : 'Invalid Date'} />
                            <Column field="practicalExamStatus" header="PRACTICAL STATUS" className="py-2 bg-sky-50 px-4 border-b header-gap" body={(rowData) => examStatusTemplate(rowData, 'practicalExamStatus')} />
                            <Column field="vivaExamStatus" header="VIVA STATUS" className="py-2 bg-sky-50 px-4 border-b header-gap" body={(rowData) => examStatusTemplate(rowData, 'vivaExamStatus')} />
                            <Column body={(rowData) => reasonTheorySubmission(rowData, 'reasonOfTheorySubmission')} header="THEORY SUBMISSION REASON" className="py-2 bg-sky-50 px-4 border-b header-gap text-sm text-gray-700 font-semibold" />

                            <Column
                                header="LOGS"
                                body={(rowData) => (
                                    <button
                                        onClick={() => handleDownloadLogs(rowData._id)}
                                        className=" px-4 py-1 text-xl hover:text-green-700 "
                                    >
                                        <FiDownload />
                                    </button>
                                )}
                                className="py-2 px-4 border-b bg-sky-50"
                            />
                            <Column header="EVIDENCE" body={viewEvidenceTemplate} className="py-2 bg-sky-50 px-4 border-b text-gray-700 font-semibold" />

                        </DataTable>

                        <Dialog
                            visible={isDialogVisible}
                            style={{ width: '30vw' }}
                            header={`${zoomImageType} of ${zoomImageName}`}
                            onHide={() => setDialogVisible(false)} dismissableMask
                        >
                            {zoomImage && (
                                <img
                                    src={zoomImage}
                                    alt="image"
                                    className="w-full h-auto object-contain"
                                />
                            )}
                        </Dialog>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 p-4 gap-4">
                    <span className="font-medium text-lg">Total Records: {totalCandidates}</span>
                </div>
            </div>
            <style>
                {`
                    .custom-accept-button {
                        background-color: #28a745 !important;
                        border-color: #28a745 !important;
                        color: white;
                        padding: 0.2rem 1.5rem;
               
                    }
                    .custom-reject-button {
                        background-color: #dc3545 !important;
                        border-color: #dc3545 !important;
                                 margin-right: 15px;
                                 color: white;
                                 padding: 0.2rem 1.5rem;
                    }
                `}
            </style>
            <ConfirmDialog
                visible={isConfirmVisible}
                dismissableMask
                onHide={rejectReset}
                message="Are you sure you want to reset the candidates?"
                header="Confirmation"
                icon="pi pi-exclamation-triangle"
                acceptClassName="custom-accept-button"
                rejectClassName="custom-reject-button"
                footer={
                    <div className="flex justify-end space-x-2">
                        <Button
                            label="Reset Theory"
                            icon="pi pi-refresh"
                            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-1 sm:py-2 px-1 lg:px-2 md:px-2 rounded-md text-xs sm:text-sm w-full sm:w-auto lg:text-xs"
                            onClick={handleResetTheory}
                        />
                        <Button
                            label="Reset Practical"
                            icon="pi pi-refresh"
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 sm:py-2 px-1 lg:px-2 md:px-2 rounded-md text-xs sm:text-sm w-full sm:w-auto lg:text-xs"
                            onClick={handleResetPractical}
                        />
                        <Button
                            label="Reset Viva"
                            icon="pi pi-refresh"
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 sm:py-2 px-1 lg:px-2 md:px-2 rounded-md text-xs sm:text-sm w-full sm:w-auto lg:text-xs"
                            onClick={handleResetViva}
                        />

                    </div>
                }
            />
        </div>
    );
};

export default CandidatesForBatch;