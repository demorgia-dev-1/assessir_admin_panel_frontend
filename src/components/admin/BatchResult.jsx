import { Dialog } from '@mui/material';
import axios from 'axios';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useEffect, useState } from 'react';
import { LuView } from "react-icons/lu";
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import * as XLSX from 'xlsx';
import { BASE_URL } from '../constant';
import { setSelectedBatch, setSelectedJobRole, setSelectedSector } from '../features/assignTestSlice';
import { fetchBatchesBySectorJobRole } from '../features/batchSlice';
import { fetchJobRolesBySector } from '../features/jobRoleSlice';
import { clearReport, fetchReports } from '../features/reportsSlice';
import { fetchSectors } from '../features/subAdminSlice';
import TheoryResponse from './TheoryResponse';

const BatchResult = () => {
    const dispatch = useDispatch();
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { reports, status } = useSelector(state => state.report);
    const {
        batches, jobRoles, sectors,
        selectedBatch, selectedJobRole,
        selectedSector
    } = useSelector(state => state.assignTest);
    const reportData = Object.values(reports);

    const handleSectorChange = (selectedOption) => {
        dispatch(setSelectedSector(selectedOption));

    };

    const handleJobRoleChange = (selectedOption) => {
        dispatch(setSelectedJobRole(selectedOption));
    };

    const handleBatchChange = (selectedOption) => {
        const batch = selectedOption;
        dispatch(setSelectedBatch(batch));
        if (batch) {
            dispatch(fetchReports(batch._id));
        } else {
            dispatch(clearReport());
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
    }, [dispatch, selectedSector, selectedJobRole]);

    const getUniqueNOSDetails = (data) => {
        const nosDetailsMap = new Map();
        data.forEach(item => {
            item.theoryResponses.forEach(response => {
                if (response.nosDetails) {
                    const { nosCode, totalMarksInTheory, totalMarksInPractical, totalMarksInViva, totalMarks } = response.nosDetails;
                    if (!nosDetailsMap.has(nosCode)) {
                        nosDetailsMap.set(nosCode, {
                            totalMarks: totalMarks || 0,
                            theory: totalMarksInTheory || 0,
                            practical: totalMarksInPractical || 0,
                            viva: totalMarksInViva || 0,
                            jobRoleShortName: response.jobRoleDetails.qpCode || 'Unknown'
                        });
                    }
                }
            });
        });
        return Array.from(nosDetailsMap.entries());
    };

    const getUniquePCDetails = (data) => {
        const pcDetailsMap = new Map();
        data.forEach(item => {
            item.theoryResponses.forEach(response => {
                if (response.pcDetails) {
                    const { pcCode, totalMarksInTheory, totalMarksInPractical, totalMarksInViva, totalMarks } = response.pcDetails;
                    if (!pcDetailsMap.has(pcCode)) {
                        pcDetailsMap.set(pcCode, {
                            totalMarks: totalMarks || 0,
                            theory: totalMarksInTheory || 0,
                            practical: totalMarksInPractical || 0,
                            viva: totalMarksInViva || 0,
                            jobRoleShortName: response.jobRoleDetails.qpCode || 'Unknown'
                        });
                    }
                }
            });
        });
        return Array.from(pcDetailsMap.entries());
    };

    const nosDetails = getUniqueNOSDetails(reportData);
    const pcDetails = getUniquePCDetails(reportData);
    console.log('nosDetails:', nosDetails);
    console.log('pcDetails:', pcDetails);

    const calculateTotalMarksInTheory = (responses) => {
        return responses?.reduce((acc, response) => acc + (response?.marks || 0), 0) || 0;
    };

    const calculateTotalMarksInPractical = (responses) => {
        return responses?.reduce((acc, res) => acc + (res?.marksObtained || 0), 0) || 0;
    };

    const calculateTotalMarksInViva = (responses) => {
        return responses?.reduce((acc, res) => acc + (res?.marksObtained || 0), 0) || 0;
    };

    const calculateTotalMarks = (rowData) => {
        const theoryMarks = calculateTotalMarksInTheory(rowData?.theoryResponses || []);
        const practicalMarks = calculateTotalMarksInPractical(rowData?.practicalResponses?.flatMap(res => res?.responses || []) || []);
        const vivaMarks = calculateTotalMarksInViva(rowData?.vivaResponse?.flatMap(res => res?.responses || []) || []);
        return theoryMarks + practicalMarks + vivaMarks;
    };

    const calculatePercentage = (totalMarks, maxMarks) => {
        if (!maxMarks || maxMarks <= 0) return "0.00";
        return ((totalMarks / maxMarks) * 100).toFixed(2);
    };


    const renderTheoryResponses = (rowData, nosCode) => {
        const responses = rowData?.theoryResponses
            ?.filter(res => res?.nosDetails?.nosCode === nosCode) || [];
        const totalMarks = responses.reduce((acc, res) => acc + (res?.marks || 0), 0);
        return totalMarks;
    };

    const renderPracticalResponses = (rowData, nosCode) => {
        const responses = rowData?.practicalResponses
            ?.flatMap(res => res?.responses || [])
            ?.filter(res => res?.question?.nos?.nosCode === nosCode) || [];
        const totalMarks = responses.reduce((acc, res) => acc + (res?.marksObtained || 0), 0);
        return totalMarks;
    };

    const renderVivaResponses = (rowData, nosCode) => {
        const responses = rowData?.vivaResponse
            ?.flatMap(res => res?.responses || [])
            ?.filter(res => res?.question?.nos?.nosCode === nosCode) || [];
        const totalMarks = responses.reduce((acc, res) => acc + (res?.marksObtained || 0), 0);
        return totalMarks;
    };

    const handleDownloadExcel = () => {
        const formattedData = reportData.map(item => {
            const nosMarks = nosDetails.reduce((acc, [nosCode, details]) => {
                acc[`${details.jobRoleShortName}/${nosCode} (Theory)`] = renderTheoryResponses(item, nosCode);
                acc[`${details.jobRoleShortName}/${nosCode} (Practical)`] = renderPracticalResponses(item, nosCode);
                acc[`${details.jobRoleShortName}/${nosCode} (Viva)`] = renderVivaResponses(item, nosCode);
                return acc;
            }, {});

            const isAbsent = !item.candidate?.isPresentInTheory && !item.candidate?.isPresentInPractical && !item.candidate?.isPresentInViva;

            return {
                Name: item?.candidate?.name || 'N/A',
                Email: item?.candidate?.email || 'N/A',
                Phone: item?.candidate?.phone || 'N/A',
                EnrollmentNo: item?.candidate?.enrollmentNo,
                JobRole: item?.theoryResponses?.length > 0 ? item?.theoryResponses[0]?.jobRoleDetails?.qpCode : 'Unknown',
                ...nosMarks,
                TotalTheoryMarks: calculateTotalMarksInTheory(item.theoryResponses),
                TotalPracticalMarks: calculateTotalMarksInPractical(item.practicalResponses.flatMap((res => res?.responses || []) || [])),
                TotalVivaMarks: calculateTotalMarksInViva(item.vivaResponse?.flatMap((res => res?.responses || []) || [])),
                TotalMarks: calculateTotalMarks(item),
                TotalPercentage: calculatePercentage(calculateTotalMarks(item), selectedJobRole?.totalMarks || 0),
                Result: isAbsent ? 'Absent' : calculatePercentage(calculateTotalMarks(item), selectedJobRole?.totalMarks || 0) >= (selectedJobRole?.passingPercentage || 0) ? 'Pass' : 'Fail'
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(formattedData);

        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const address = XLSX.utils.encode_col(C) + "1";
            if (!worksheet[address]) continue;
            worksheet[address].s = {
                font: { bold: true },
                alignment: { vertical: "center", horizontal: "center" },
                fill: { fgColor: { rgb: "FFFF00" } }
            };
        }

        worksheet['!rows'] = [{ hpx: 40 }];

        const colWidths = new Array(range.e.c + 1).fill({ wpx: 150 });
        worksheet['!cols'] = colWidths;

        const rowHeights = new Array(range.e.r + 1).fill({ hpx: 20 });
        worksheet['!rows'] = rowHeights;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Batch Results');
        XLSX.writeFile(workbook, `Batch_Results_${selectedBatch?.no}.xlsx`);
    };

    const handleViewResponse = (candidate) => {
        setSelectedCandidate(candidate);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setSelectedCandidate(null);
    };

    console.log('response', reportData);

    const emailBodyTemplate = (rowData) => {
        return rowData.candidate.email ? rowData.candidate.email : 'N/A';
    };

    const phoneBodyTemplate = (rowData) => {
        return rowData.candidate.phone ? rowData.candidate.phone : 'N/A';
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


    const handleDownloadTheoryExcel = async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token is missing');
            }
            const response = await axios.get(
                `${BASE_URL}company/batches/${selectedBatch._id}/theory-logs`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const reportData = response.data.data;
            console.log('Theory logs fetched successfully:', reportData);

            const formattedData = reportData.flatMap(item => {
                const batch = item.batch || {};
                const jobRole = batch.jobRole || {};
                const questionBank = batch.theoryQuestionBank || {};

                if (item.logs.length === 0) {
                    return [{
                        Name: item.name || '',
                        Enroll_No: item?.enrollmentNo || '',
                        Batch_No: batch.no || '',
                        Job_Role: jobRole?.qpCode || '',
                        NOS: '',
                        Question_Bank: questionBank.name || '',
                        Question: '',
                        Options: '',
                        Correct_Answer: "",
                        Submitted_Answer: '',
                        Max_Marks:  0,
                        Obtained_Marks:  0,
                        isFinalAnswer: '',
                        isCorrect: '',
                        Theory_Start_Time: '',
                        Theory_End_Time: '',
                        Question_Start_Time: '',
                        Question_End_Time: '',
                        Time_Taken: ''

                    }];
                }

                return item.logs.map(log => {
                    const options = log.question?.options || [];
                    const optionLetters = ['A', 'B', 'C', 'D'];
                    const allOptions = options.map((option, index) => `${optionLetters[index]}. ${option.option.replace(/<\/?p>/g, '')}`).join(', ');
                    const correctOption = options
                        .map((option, index) => option.isCorrect ? `${optionLetters[index]}. ${option.option.replace(/<\/?p>/g, '')}` : '')
                        .filter(Boolean)
                        .join(', ');
                    const submittedOption = options
                        .map((option, index) => option.option.replace(/<\/?p>/g, '') === log.answer?.replace(/<\/?p>/g, '') ? `${optionLetters[index]}. ${option.option.replace(/<\/?p>/g, '')}` : '')
                        .filter(Boolean)
                        .join(', ');

                    const startedAt = new Date(log.startedAt);
                    const endedAt = new Date(log.endedAt);
                    const timeTaken = ((endedAt - startedAt) / 1000).toFixed(2);

                    return {
                        Name: item.name || '',
                        Enroll_No: item?.enrollmentNo || '',
                        Batch_No: batch.no || '',
                        Job_Role: jobRole?.qpCode || '',
                        NOS: log?.question?.nos?.nosCode || '',
                        Question_Bank: questionBank.name || '',
                        Question: log?.question?.title?.replace(/<\/?p>/g, '') || '',
                        Options: allOptions,
                        Correct_Answer: correctOption,
                        Submitted_Answer: submittedOption,
                        Max_Marks: log?.question?.marks || 0,
                        Obtained_Marks: log?.marks || 0,
                        isFinalAnswer: log?.isFinal ? 'True' : 'False',
                        isCorrect: log?.isCorrect ? 'Yes' : 'No',
                        Theory_Start_Time: convertToIST(item?.theoryStartedAt),
                        Theory_End_Time: convertToIST(item?.theorySubmittedAt),
                        Question_Start_Time: convertToIST(log?.startedAt),
                        Question_End_Time: convertToIST(log?.endedAt),
                        Time_Taken: `${timeTaken} sec`
                    };
                });
            });

            console.log('Formatted data:', formattedData);

            const worksheet = XLSX.utils.json_to_sheet([]);
            XLSX.utils.sheet_add_aoa(worksheet, [
                ["Name", "Enrollment No", "Batch No", "Job Role", "NOS", "Question Bank", "Question", "Options", "Correct Answer", "Submitted Answer", "Max Marks", "Obtained Marks", "Is Final Answer", "Is Correct", "Theory Start Time", "Theory End Time", "Question Start Time", "Question End Time", "Time Taken"]
            ], { origin: "A1" });
            XLSX.utils.sheet_add_json(worksheet, formattedData, { origin: "A2", skipHeader: true });

            const columnWidths = [
                { wch: 20 },
                { wch: 15 },
                { wch: 10 },
                { wch: 15 },
                { wch: 10 },
                { wch: 25 },
                { wch: 50 },
                { wch: 50 },
                { wch: 35 },
                { wch: 35 },
                { wch: 10 },
                { wch: 15 },
                { wch: 15 },
                { wch: 15 },
                { wch: 20 },
                { wch: 20 },
                { wch: 20 },
                { wch: 15 }
            ];
            worksheet['!cols'] = columnWidths;
            const rowHeights = [
                { hpt: 30 }
            ];
            worksheet['!rows'] = rowHeights;

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Theory Responses');
            XLSX.writeFile(workbook, `Theory_Responses_${selectedBatch.no}.xlsx`);

        } catch (error) {
            console.error('Error fetching theory logs:', error.message);
        }
    };
    const handleDownloadPracticalExcel = () => {
        const formattedData = reportData.flatMap(item => {
            return item?.practicalResponses?.flatMap(response => {
                if (!response || !response.responses) return [];
                return response?.responses?.map(res => {
                    return {
                        Name: item?.candidate?.name,
                        Enroll_No: item?.candidate?.enrollmentNo,
                        JobRole: res?.question?.jobRole?.qpCode,
                        NOS: res?.question?.nos?.nosCode,
                        Question_Bank: res?.question?.questionBank?.name,
                        Question: res?.question?.title?.replace(/<\/?p>/g, ''),
                        Max_Marks: res?.question?.marks,
                        Obtained_Marks: res?.marksObtained,
                    };
                });
            });
        });

        const worksheet = XLSX.utils.json_to_sheet([]);
        XLSX.utils.sheet_add_aoa(worksheet, [
            ["Name", "Enrollment No", "Job Role", "NOS", "Question Bank", "Questions", "Max Marks", "Obtained Marks"]
        ], { origin: "A1" });
        XLSX.utils.sheet_add_json(worksheet, formattedData, { origin: "A2", skipHeader: true });

        const columnWidths = [
            { wch: 20 },
            { wch: 15 },
            { wch: 15 },
            { wch: 10 },
            { wch: 25 },
            { wch: 50 },
            { wch: 10 },
            { wch: 10 }
        ];
        worksheet['!cols'] = columnWidths;

        const rowHeights = [
            { hpt: 30 }
        ];
        worksheet['!rows'] = rowHeights;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Practical Responses');
        XLSX.writeFile(workbook, `Practical_Responses_${selectedBatch.no}.xlsx`);
    };
    const handleDownloadVivaExcel = () => {
        const formattedData = reportData.flatMap(item => {
            return item.vivaResponse.flatMap(response => {
                if (!response || !response.responses) return [];
                return response.responses.map(res => {
                    return {
                        Name: item?.candidate?.name,
                        Enroll_No: item?.candidate?.enrollmentNo,
                        JobRole: res?.question?.jobRole?.qpCode,
                        NOS: res?.question?.nos?.nosCode,
                        Question_Bank: res?.question?.questionBank?.name,
                        Question: res?.question?.title?.replace(/<\/?p>/g, ''),
                        Max_Marks: res?.question?.marks,
                        Obtained_Marks: res?.marksObtained,
                    };
                });
            });
        });

        const worksheet = XLSX.utils.json_to_sheet([]);
        XLSX.utils.sheet_add_aoa(worksheet, [
            ["Name", "Enrollment No", "Job Role", "NOS", "Question Bank", "Questions", "Max Marks", "Obtained Marks"]
        ], { origin: "A1" });
        XLSX.utils.sheet_add_json(worksheet, formattedData, { origin: "A2", skipHeader: true });


        const columnWidths = [
            { wch: 20 },
            { wch: 15 },
            { wch: 15 },
            { wch: 10 },
            { wch: 25 },
            { wch: 50 },
            { wch: 10 },
            { wch: 10 },

        ];
        worksheet['!cols'] = columnWidths;
        const rowHeights = [
            { hpt: 30 }
        ];
        worksheet['!rows'] = rowHeights;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Viva Responses');
        XLSX.writeFile(workbook, `Viva_Responses_${selectedBatch.no}.xlsx`);
    };

    return (
        <div className="max-w-[20rem]  xs:max-w-[23rem] sm:max-w-[60rem] my-2  md:max-w-[86rem]  lg:max-w-[100%] xl:w-[100%]
        mx-auto mt-5 sm:p-2 py-8 bg-white border-2 border-white/10 backdrop-blur-[20px] items-center overflow-hidden duration-200 ease-in-out text-black rounded-lg shadow-lg flex-grow-0 ">
            <h2 className="text-xl font-bold mb-4 ml-1  p-2 text-center sm:text-left">Batch Result </h2>
            <div className="flex flex-col space-y-4 my-5 z-0">
                <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4 bg-gray-100 rounded-lg px-2 py-2 pb-6">
                    <div className="flex flex-col">
                        <label htmlFor="sector" className="font-semibold">Select Sector</label>
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
                        <label htmlFor="jobrole" className="font-semibold">Select Job Role</label>
                        <Select
                            id="jobrole"
                            value={selectedJobRole}
                            options={jobRoles}
                            onChange={handleJobRoleChange}
                            getOptionLabel={(option) => `${option.name}-V${option.version}`}
                            getOptionValue={(option) => option._id}
                            isClearable
                            placeholder="Select Job Role"
                            className="w-full text-sm border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition z-40"
                        />
                    </div>
                    <div className="flex flex-col ">
                        <label htmlFor="batch" className="font-semibold">Select Batch</label>

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

                <div className="min-w-full inline-block align-middle overflow-x-auto flex-grow-0 p-2 mt-4">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <Button
                                label="Download Result"
                                icon='pi pi-file-excel'
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 sm:py-2 sm:px-4 rounded-md text-xs sm:text-sm w-full sm:w-auto ml-2 lg:text-xs"
                                onClick={handleDownloadExcel}
                            />
                            <Button
                                label="Theory Response"
                                icon="pi pi-file-excel"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 sm:py-2 sm:px-4 rounded-md text-xs sm:text-sm w-full sm:w-auto ml-2 lg:text-xs"
                                onClick={handleDownloadTheoryExcel}
                            />

                            <Button
                                label="Practical Response"
                                icon="pi pi-file-excel"
                                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-1 sm:py-2 sm:px-4 rounded-md text-xs sm:text-sm w-full sm:w-auto ml-2 lg:text-xs"
                                onClick={handleDownloadPracticalExcel}
                            />
                            <Button
                                label="Viva Response"
                                icon="pi pi-file-excel"
                                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-1 sm:py-2 sm:px-4 rounded-md text-xs sm:text-sm w-full sm:w-auto ml-2 lg:text-xs"
                                onClick={handleDownloadVivaExcel}
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

                        {status === 'loading' && <div className="card flex justify-center items-center">
                            <ProgressSpinner className='h-10 w-10' />
                        </div>}
                        <DataTable value={reportData}
                            paginator rows={10}
                            rowsPerPageOptions={[5, 10, 20, 50]}
                            responsiveLayout="scroll"
                            scrollable={true}
                            globalFilter={globalFilter}
                            className="min-w-full bg-white border border-gray-200">

                            <Column
                                header="View Response"
                                body={(rowData) => (
                                    <button
                                        onClick={() => handleViewResponse(rowData)}
                                        className=" px-4 py-1 rounded-md hover:text-green-600 "
                                    >
                                        <LuView className='h-5 w-5' />
                                    </button>
                                )}
                                className="py-2 px-4 border-b"
                            />

                            <Column header="Name" field='candidate.name' className="py-2 px-4 border-b" />
                            <Column header="Email" body={emailBodyTemplate} className="py-2 px-4 border-b" />
                            <Column header="Phone" body={phoneBodyTemplate} className="py-2 px-4 border-b" />
                            <Column field="candidate.enrollmentNo" header="Enrollment No" className="py-2 px-4 border-b" />

                            <Column
                                header="Job Role"
                                body={(rowData) => {
                                    const jobRoleDetails = rowData?.theoryResponses?.length > 0 ? rowData?.theoryResponses[0]?.jobRoleDetails : null;
                                    return jobRoleDetails ? jobRoleDetails?.qpCode : 'Unknown';
                                }}
                                className="py-2 px-4 border-b"
                            />
                            {nosDetails.flatMap(([nosCode, details]) => [
                                <Column
                                    key={`${nosCode}-theory`}
                                    header={`${nosCode} (Theory MM-${details.theory})`}
                                    body={(rowData) => renderTheoryResponses(rowData, nosCode)}
                                    className="py-2 px-4 border-b"
                                />,
                                <Column
                                    key={`${nosCode}-practical`}
                                    header={`${nosCode} (Practical MM-${details.practical})`}
                                    body={(rowData) => renderPracticalResponses(rowData, nosCode)}
                                    className="py-2 px-4 border-b"
                                />,
                                <Column
                                    key={`${nosCode}-viva`}
                                    header={`${nosCode} (Viva MM-${details.viva})`}
                                    body={(rowData) => renderVivaResponses(rowData, nosCode)}
                                    className="py-2 px-4 border-b"
                                />
                            ])}

                            <Column
                                header={`Total Theory Marks (MM-${selectedJobRole?.totalMarksInTheory || 0})`}
                                body={(rowData) => calculateTotalMarksInTheory(rowData?.theoryResponses)}
                                className="py-2 px-4 border-b"
                            />
                            <Column
                                header={`Total Practical Marks (MM-${selectedJobRole?.totalMarksInPractical || 0})`}
                                body={(rowData) => calculateTotalMarksInPractical(rowData.practicalResponses.flatMap(res => res?.responses))}
                                className="py-2 px-4 border-b"
                            />
                            <Column
                                header={`Total Viva Marks (MM-${selectedJobRole?.totalMarksInViva || 0})`}
                                body={(rowData) => calculateTotalMarksInViva(rowData.vivaResponse?.flatMap(res => res?.responses))}
                                className="py-2 px-4 border-b"
                            />
                            <Column
                                header={`Total Marks (MM-${selectedJobRole?.totalMarks || 0})`}
                                body={(rowData) => calculateTotalMarks(rowData)}
                                className="py-2 px-4 border-b"
                            />
                            <Column
                                header={`Total Percentage (Passing %-${selectedJobRole?.passingPercentage || 0})`}
                                body={(rowData) => {
                                    const totalMarks = calculateTotalMarks(rowData);
                                    const maxMarks = selectedJobRole?.totalMarks || 0;
                                    return calculatePercentage(totalMarks, maxMarks);
                                }}
                                className="py-2 px-4 border-b"
                            />

                            <Column
                                header="Result"
                                body={(rowData) => {
                                    const isAbsent = !rowData?.candidate?.isPresentInTheory && !rowData?.candidate?.isPresentInPractical && !rowData?.candidate?.isPresentInViva;
                                    if (isAbsent) {
                                        return 'Absent';
                                    }
                                    const totalMarks = calculateTotalMarks(rowData);
                                    const maxMarks = selectedJobRole?.totalMarks || 0;
                                    const percentage = calculatePercentage(totalMarks, maxMarks);
                                    return percentage >= (selectedJobRole?.passingPercentage || 0) ? 'Pass' : 'Fail';
                                }}
                                className="py-2 px-4 border-b"
                            />
                        </DataTable>
                        {/* )} */}
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center font-semibold p-4 gap-80">
                        <span> Total Records: {reportData.length}</span>

                    </div>
                </div>
            </div>

            <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <div className="p-4">
                    <h2 className="text-2xl font-semibold mb-4">Theory Response of {selectedCandidate?.candidate.name}</h2>
                    {selectedCandidate && selectedCandidate?.theoryResponses?.map(response => (
                        <TheoryResponse key={response?._id} response={response} />
                    ))}
                    <button onClick={handleCloseDialog} className="bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-600 mt-4">Close</button>
                </div>
            </Dialog>
        </div>
    );
};

export default BatchResult;