
import axios from 'axios';
import { saveAs } from 'file-saver';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Menu } from 'primereact/menu';
import { useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { IoMdAdd, IoMdClose, IoMdCloudUpload } from "react-icons/io";
import { MdOutlineNoteAdd } from 'react-icons/md';
import { VscClearAll } from "react-icons/vsc";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { BASE_URL } from '../constant';
import { clearBatchResponses, createBatch, deleteBatch, deleteCandidateFromBatch, extendEndDate, fetchBatchesBySectorJobRole, setSelectedJobRole, setSelectedSector, updateBatch } from '../features/batchSlice';
import { fetchAllCountries } from '../features/countrySlice';
import { fetchJobRolesBySector } from '../features/jobRoleSlice';
import { fetchSectors } from '../features/subAdminSlice';




const ManageBatch = () => {

    const dispatch = useDispatch();
    const [isExtendEndDateVisible, setExtendEndDateVisible] = useState(false);
    const [batchName, setBatchName] = useState('');
    const [batchType, setBatchType] = useState('');
    const [batchNo, setBatchNo] = useState('');
    const [assessmentStartDate, setAssessmentStartDate] = useState('');
    const [assessmentEndDate, setAssessmentEndDate] = useState('');
    const [assessmentDuration, setAssessmentDuration] = useState('');
    const [numberOfCandidates, setNumberOfCandidates] = useState('');
    const [globalFilter, setGlobalFilter] = useState('');
    const [formVisible, setFormVisible] = useState(false);
    const [isBulkUploadVisible, setBulkUploadVisible] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);
    const [isEditFormVisible, setIsEditFormVisible] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [isViewFormVisible, setIsViewFormVisible] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [viewData, setViewData] = useState(null);
    const [editFormData, setEditFormData] = useState({
        _id: '',
        name: '',
        type: '',
        no: '',
        startDate: '',
        endDate: '',
        durationInMin: '',
        noOfCandidates: '',
        isPracticalVisibleToCandidate: false,
        isAssessorEvidenceRequired: true,

    });

    const [editEndDate, setEditEndDate] = useState({
        _id: '',
        endDate: '',
    });

    const [editFormId, setEditFormId] = useState(null);
    const [scheme, setScheme] = useState('');
    const [subScheme, setSubScheme] = useState('');
    const [isPracticalVisible, setIsPracticalVisible] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [isAssessorEvidenceRequired, setIsAssessorEvidenceRequired] = useState(true);
    const { sectors, jobRoles, selectedSector, selectedJobRole, batches } = useSelector(state => state.batch);

    const showButtons = selectedSector && selectedJobRole && !formVisible;

    const type = sessionStorage.getItem('type');

    console.log('type', type);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedSector) {
            // toast.error('Please select a Sector');
            Swal.fire({
                html:`<div class="custon-error-container">
                              <div class="custom-swal-icon-wrapper">
                              <i class="fas fa-exclamation-circle custom-error-icon"></i>
                              </div>
                              <hr class="custom-error-divider" />
                              <div class="custom-error-message capitalize">please select a sector</div>
                              </div>`,
                              toast:false,
                              position:"center",
                              color:"#000",
                              timer: 3000,
                              timerProgressBar: true,
                              backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: false, 
                              customClass: {
                                popup: "custom-swal-popup",
                                actions: "swal-center-actions",
                                icon: "custom-swal-icon",
                              }
            })
            return;
        }
        if (!selectedJobRole) {
            // toast.error('Please select a Job Role');
            Swal.fire({
                html:`<div class="custon-error-container">
                              <div class="custom-swal-icon-wrapper">
                              <i class="fas fa-exclamation-circle custom-error-icon"></i>
                              </div>
                              <hr class="custom-error-divider" />
                              <div class="custom-error-message capitalize">please select a job role</div>
                              </div>`,
                              toast:false,
                              position:"center",
                              color:"#000",
                              timer: 3000,
                              timerProgressBar: true,
                              backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: false, 
                              customClass: {
                                popup: "custom-swal-popup",
                                actions: "swal-center-actions",
                                icon: "custom-swal-icon",
                              }
            })
            return;
        }

        if (!batchName) {
            // toast.error('Please enter a Batch Name');
            Swal.fire({
                html:`<div class="custon-error-container">
                              <div class="custom-swal-icon-wrapper">
                               <i class="fas fa-exclamation-circle custom-error-icon"></i>
                              </div>
                              <hr class="custom-error-divider" />
                              <div class="custom-error-message capitalize">please enter a batch  name</div>
                              </div>`,
                              toast:false,
                              position:"center",
                              color:"#000",
                              timer: 3000,
                              timerProgressBar: true,
                              backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: false, 
                              customClass: {
                                popup: "custom-swal-popup",
                                actions: "swal-center-actions",
                                icon: "custom-swal-icon",
                              }
            })
            return;
        }
        if (!batchType) {
            // toast.error('Please select a Batch Type');
            Swal.fire({
                html:`<div class="custon-error-container">
                              <div class="custom-swal-icon-wrapper">
                               <i class="fas fa-exclamation-circle custom-error-icon"></i>
                              </div>
                              <hr class="custom-error-divider" />
                              <div class="custom-error-message capitalize">please select a batch type</div>
                              </div>`,
                              toast:false,
                              position:"center",
                              color:"#000",
                              timer: 3000,
                              timerProgressBar: true,
                              backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: false, 
                              customClass: {
                                popup: "custom-swal-popup",
                                actions: "swal-center-actions",
                                icon: "custom-swal-icon",
                              }
            })
            return;
        }
        if (!batchNo) {
            // toast.error('Please enter a Batch No');
            Swal.fire({
                html:`<div class="custon-error-container">
                              <div class="custom-swal-icon-wrapper">
                               <i class="fas fa-exclamation-circle custom-error-icon"></i>
                              </div>
                              <hr class="custom-error-divider" />
                              <div class="custom-error-message capitalize">please enter a batch no</div>
                              </div>`,
                              toast:false,
                              position:"center",
                              color:"#000",
                              timer: 3000,
                              timerProgressBar: true,
                              backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: false, 
                              customClass: {
                                popup: "custom-swal-popup",
                                actions: "swal-center-actions",
                                icon: "custom-swal-icon",
                              }
            })
            return;
        }
        if (!assessmentStartDate) {
            // toast.error('Please select an Assessment Start Date');
            Swal.fire({
                html:`<div class="custon-error-container">
                              <div class="custom-swal-icon-wrapper">
                               <i class="fas fa-exclamation-circle custom-error-icon"></i>
                              </div>
                              <hr class="custom-error-divider" />
                              <div class="custom-error-message capitalize">please select an assessment start date</div>
                              </div>`,
                              toast:false,
                              position:"center",
                              color:"#000",
                              timer: 3000,
                              timerProgressBar: true,
                              backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: false, 
                              customClass: {
                                popup: "custom-swal-popup",
                                actions: "swal-center-actions",
                                icon: "custom-swal-icon",
                              }
            })
            return;
        }
        if (!assessmentEndDate) {
            // toast.error('Please select an Assessment End Date');
            Swal.fire({
                html:`<div class="custon-error-container">
                              <div class="custom-swal-icon-wrapper">
                               <i class="fas fa-exclamation-circle custom-error-icon"></i>
                              </div>
                              <hr class="custom-error-divider" />
                              <div class="custom-error-message capitalize">please select an assessment end date</div>
                              </div>`,
                              toast:false,
                              position:"center",
                              color:"#000",
                              timer: 3000,
                              timerProgressBar: true,
                              backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: false, 
                              customClass: {
                                popup: "custom-swal-popup",
                                actions: "swal-center-actions",
                                icon: "custom-swal-icon",
                              }
            })
            return;
        }
        if (!assessmentDuration) {
            // toast.error('Please enter an Assessment Duration');
            Swal.fire({
                html:`<div class="custon-error-container">
                              <div class="custom-swal-icon-wrapper">
                               <i class="fas fa-exclamation-circle custom-error-icon"></i>
                              </div>
                              <hr class="custom-error-divider" />
                              <div class="custom-error-message capitalize">please enter an assessment duration</div>
                              </div>`,
                              toast:false,
                              position:"center",
                              color:"#000",
                              timer: 3000,
                              timerProgressBar: true,
                              backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: false, 
                              customClass: {
                                popup: "custom-swal-popup",
                                actions: "swal-center-actions",
                                icon: "custom-swal-icon",
                              }
            })
            return;
        }
        if (!numberOfCandidates) {
            // toast.error('Please enter the Number of Candidates');
            Swal.fire({
                html:`<div class="custon-error-container">
                              <div class="custom-swal-icon-wrapper">
                               <i class="fas fa-exclamation-circle custom-error-icon"></i>
                              </div>
                              <hr class="custom-error-divider" />
                              <div class="custom-error-message capitalize">please enter the number of candidates</div>
                              </div>`,
                              toast:false,
                              position:"center",
                              color:"#000",
                              timer: 3000,
                              timerProgressBar: true,
                              backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: false, 
                              customClass: {
                                popup: "custom-swal-popup",
                                actions: "swal-center-actions",
                                icon: "custom-swal-icon",
                              }
            })
            return;
        }

        const payload = {
            sector: selectedSector._id,
            jobRole: selectedJobRole._id,
            scheme: scheme,
            subScheme: subScheme,
            name: batchName,
            type: batchType,
            no: batchNo,
            isPracticalVisibleToCandidate: isPracticalVisible,
            startDate: convertToISTWithoutChangingTime(assessmentStartDate),
            endDate: convertToISTWithoutChangingTime(assessmentEndDate),
            durationInMin: Number(assessmentDuration),
            noOfCandidates: Number(numberOfCandidates),
            isAssessorEvidenceRequired: isAssessorEvidenceRequired,

        };

        console.log('payload = ', payload);

        try {
            await dispatch(createBatch(payload)).unwrap();

            // toast.success('Batch created successfully');
            Swal.fire({
                html:`<div class="custon-error-container">
                              <div class="custom-swal-icon-wrapper">
                              <i class="fa fa-check-circle custom-success-icon"></i>
                              </div>
                              <hr class="custom-error-divider" />
                              <div class="custom-error-message capitalize">batch created successfully</div>
                              </div>`,
                              toast:false,
                              position:"center",
                              color:"#000",
                              timer: 3000,
                              timerProgressBar: true,
                              backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: false, 
                              customClass: {
                                popup: "custom-swal-popup",
                                actions: "swal-center-actions",
                                icon: "custom-swal-icon",
                              }
            })
            dispatch(fetchBatchesBySectorJobRole({ sectorId: selectedSector?._id, jobRoleId: selectedJobRole._id }));
            setBatchName('');
            setBatchType('');
            setBatchNo('');
            setScheme('');
            setSubScheme('');
            setAssessmentStartDate('');
            setAssessmentEndDate('');
            setAssessmentDuration('');
            setNumberOfCandidates('');

        } catch (error) {
            // toast.error('Failed to create batch');
            Swal.fire({
                html:`<div class="custon-error-container">
                              <div class="custom-swal-icon-wrapper">
                               <i class="fas fa-exclamation-circle custom-error-icon"></i>
                              </div>
                              <hr class="custom-error-divider" />
                              <div class="custom-error-message capitalize">failed to create batch</div>
                              </div>`,
                              toast:false,
                              position:"center",
                              color:"#000",
                              timer: 3000,
                              timerProgressBar: true,
                              backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: false, 
                              customClass: {
                                popup: "custom-swal-popup",
                                actions: "swal-center-actions",
                                icon: "custom-swal-icon",
                              }
            })
            console.error("Error creating batch:", error);
        }
    };
    const handleDownload = () => {
        const sampleData = [
            {
                "Batch No": "1234",
                "Batch Name": "name",
                "Batch Type": "regular/reassessment",
                "Scheme": "abcd",
                "Sub Scheme": "abcd",
                "Duration (Min)": "10",
                "No of Candidates": "5",
                "Start Date-Time(mm/dd/yyyy hh:mm)": "10/3/2024 11:42 AM",
                "End Date-Time(mm/dd/yyyy hh:mm)": "10/10/2024 5:30:00 PM",
                "Practical Visible To Candidate": "no",
                "Assessor Evidence Required": "yes"
            },
        ];

        const worksheet = XLSX.utils.json_to_sheet(sampleData);

        const columnWidths = [
            { wpx: 200 },
            { wpx: 200 },
            { wpx: 200 },
            { wpx: 200 },
            { wpx: 200 },
            { wpx: 200 },
            { wpx: 200 },
            { wpx: 200 },
            { wpx: 200 },
            { wpx: 200 },
            { wpx: 200 },
            { wpx: 200 },
            { wpx: 200 },
            { wpx: 200 },
            { wpx: 100 },
            { wpx: 100 },
            { wpx: 100 },
            { wpx: 10 },

        ];

        worksheet['!cols'] = columnWidths;

        Object.keys(worksheet).forEach(cell => {
            if (worksheet[cell] && typeof worksheet[cell] === 'object') {
                worksheet[cell].s = { alignment: { wrapText: true } };
            }
        });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, selectedJobRole?._id);

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array', cellStyles: true });

        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'sample_bulk_upload_batches.xlsx');
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
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const transformedData = jsonData.map((row) => {
                const {
                    "Batch Name": name,
                    "Batch Type": type,
                    "Batch No": no,
                    "Scheme": scheme,
                    "Sub Scheme": subScheme,
                    "Duration (Min)": durationInMin,
                    "No of Candidates": noOfCandidates,
                    "Start Date-Time(mm/dd/yyyy hh:mm)": startDate,
                    "End Date-Time(mm/dd/yyyy hh:mm)": endDate,
                    "Practical Visible To Candidate": isPracticalVisibleToCandidate,
                    "Assessor Evidence Required": isAssessorEvidenceRequired,

                } = row;

                const batchType = type && (type.toLowerCase() === 'regular' || type.toLowerCase() === 'reassessment') ? type.toLowerCase() : 'regular';

                return {
                    name: name || '',
                    type: batchType,
                    no: String(no) !== undefined ? no : 0,
                    scheme: scheme || '',
                    subScheme: subScheme || '',
                    durationInMin: durationInMin !== undefined ? durationInMin : 0,
                    noOfCandidates: noOfCandidates !== undefined ? noOfCandidates : 0,
                    startDate: startDate ? convertToISTWithoutChangingTimeBulk(startDate) : '',
                    endDate: endDate ? convertToISTWithoutChangingTimeBulk(endDate) : '',
                    sector: selectedSector?._id || '',
                    jobRole: selectedJobRole?._id || '',
                    isPracticalVisibleToCandidate: isPracticalVisibleToCandidate?.toLowerCase() === 'yes' ? true : isPracticalVisibleToCandidate?.toLowerCase() === 'no' ? false : undefined,
                    isAssessorEvidenceRequired: isAssessorEvidenceRequired?.toLowerCase() === 'yes' ? true : isAssessorEvidenceRequired?.toLowerCase() === 'no' ? false : undefined,
                };
            });

            console.log('transformed', transformedData);

            const missingFields = transformedData.map((batch, index) => {
                const fields = [];
                if (!batch.name) fields.push('Batch Name');
                if (!batch.type) fields.push('Batch Type');
                if (batch.no === 0) fields.push('Batch No');
                if (batch.durationInMin === 0) fields.push('Duration (Min)');
                if (batch.noOfCandidates === 0) fields.push('No of Candidates');
                if (!batch.jobRole) fields.push('Job Role');
                if (!batch.scheme) fields.push('Scheme');
                if (!batch.startDate) fields.push('Start Date-Time(mm/dd/yyyy hh:mm)');
                if (!batch.endDate) fields.push('End Date-Time(mm/dd/yyyy hh:mm)');
                if (batch.isPracticalVisibleToCandidate === undefined) fields.push('Practical Visible To Candidate');
                if (batch.isAssessorEvidenceRequired === undefined) fields.push('Assessor Evidence Required');

                return { index, fields };
            }).filter(batch => batch.fields.length > 0);

            const batchNumbers = transformedData.map(batch => batch.no);
            const hasDuplicateBatchNumbers = new Set(batchNumbers).size !== batchNumbers.length;

            if (missingFields.length > 0) {
                const missingFieldsMessage = missingFields.map(batch => `Batch ${batch.index + 1}: ${batch.fields.join(', ')}`).join('\n');
                // toast.error(`Please ensure all required fields are filled in the uploaded file:\n${missingFieldsMessage}`);
                Swal.fire({
                    html:`<div class="custon-error-container">
                                  <div class="custom-swal-icon-wrapper">
                                  <i class="fa fa-check-circle custom-success-icon"></i>
                                  </div>
                                  <hr class="custom-error-divider" />
                                  <div class="custom-error-message capitalize">${`Please ensure all required fields are filled in the uploaded file:\n${missingFieldsMessage}`}</div>
                                  </div>`,
                                  toast:false,
                                  position:"center",
                                  color:"#000",
                                  timer: 3000,
                                  timerProgressBar: true,
                                  confirmButton: true,
                                  backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: false, 
                                  customClass: {
                                    popup: "custom-swal-popup",
                                    confirmButton: "custom-confirm-button",
                                    actions: "swal-center-actions",
                                    icon: "custom-swal-icon",
                                  }
                })
                return;
            }

            if (hasDuplicateBatchNumbers) {
                // toast.error('Duplicate batch numbers found in the uploaded file.');
                Swal.fire({
                    html:`<div class="custon-error-container">
                                  <div class="custom-swal-icon-wrapper">
                                  <i class="fas fa-exclamation-circle custom-error-icon"></i>
                                  </div>
                                  <hr class="custom-error-divider" />
                                  <div class="custom-error-message capitalize">Duplicate batch numbers found in the uploaded file.</div>
                                  </div>`,
                                  toast:false,
                                  position:"center",
                                  color:"#000",
                                  timer: 3000,
                                  timerProgressBar: true,
                                  backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: false, 
                                  customClass: {
                                    popup: "custom-swal-popup",
                                    actions: "swal-center-actions",
                                    icon: "custom-swal-icon",
                                  }
                })
                return;
            }

            try {
                const response = await axios.post(`${BASE_URL}company/batches/bulk-insert`, { batches: transformedData }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': "Bearer " + sessionStorage.getItem("token"),
                    },
                });

                if (response.status === 200) {
                    // toast.success('Data uploaded successfully!');
                    Swal.fire({
                        html:`<div class="custon-error-container">
                                      <div class="custom-swal-icon-wrapper">
                                      <i class="fa fa-check-circle custom-success-icon"></i>
                                      </div>
                                      <hr class="custom-error-divider" />
                                      <div class="custom-error-message capitalize">data uploaded successfully!</div>
                                      </div>`,
                                      toast:false,
                                      position:"center",
                                      color:"#000",
                                      timer: 3000,
                                      timerProgressBar: true,
                                      backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: false, 
                                      customClass: {
                                        popup: "custom-swal-popup",
                                        actions: "swal-center-actions",
                                        icon: "custom-swal-icon",
                                      }
                    })
                    dispatch(fetchBatchesBySectorJobRole({ sectorId: selectedSector?._id, jobRoleId: selectedJobRole._id }));
                } else {
                    // toast.error(response.data.error.description || 'Error uploading data');
                    Swal.fire({
                        html:`<div class="custon-error-container">
                                      <div class="custom-swal-icon-wrapper">
                                      <i class="fas fa-exclamation-circle custom-error-icon"></i>
                                      </div>
                                      <hr class="custom-error-divider" />
                                      <div class="custom-error-message capitalize">${response.data.error.description || 'Error uploading data'}</div>
                                      </div>`,
                                      toast:false,
                                      position:"center",
                                      color:"#000",
                                      timer: 3000,
                                      timerProgressBar: true,
                                      confirmButton: true,
                                      backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: false, 
                                      customClass: {
                                        popup: "custom-swal-popup",
                                        confirmButton: "custom-confirm-button",
                                        actions: "swal-center-actions",
                                        icon: "custom-swal-icon",
                                      }
                    })
                }
            } catch (error) {
                console.error('Error uploading data:', error);
                // toast.error(error.response.data.message || 'Error uploading data');
                Swal.fire({
                    html:`<div class="custon-error-container">
                                  <div class="custom-swal-icon-wrapper">
                                  <i class="fas fa-exclamation-circle custom-error-icon"></i>
                                  </div>
                                  <hr class="custom-error-divider" />
                                  <div class="custom-error-message capitalize">${error.response.data.message || 'Error uploading data'}</div>
                                  </div>`,
                                  toast:false,
                                  position:"center",
                                  color:"#000",
                                  timer: 3000,
                                  timerProgressBar: true,
                                  confirmButton: true,
                                  backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: false, 
                                  customClass: {
                                    popup: "custom-swal-popup",
                                    confirmButton: "custom-confirm-button",
                                    actions: "swal-center-actions",
                                    icon: "custom-swal-icon",
                                  }
                })
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


    useEffect(() => {
        dispatch(fetchSectors());
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchAllCountries());
    }, [dispatch]);

    useEffect(() => {
        if (selectedSector) {
            dispatch(fetchJobRolesBySector(selectedSector._id));
        }
    }, [dispatch, selectedSector]);


    useEffect(() => {
        if (selectedSector && selectedJobRole) {
            dispatch(fetchBatchesBySectorJobRole({ sectorId: selectedSector?._id, jobRoleId: selectedJobRole._id }));
        }
    }, [dispatch, selectedSector, selectedJobRole]);

    const handleClear = () => {
        dispatch(setSelectedJobRole(null));
        dispatch(setSelectedSector(null));
        setBatchName('');
        setBatchType('');
        setBatchNo('');
        setAssessmentStartDate('');
        setAssessmentEndDate('');
        setAssessmentDuration('');
        setNumberOfCandidates('');
        setSelectedFile(null);

    };

    const handleSectorChange = (selectedOption) => {
        dispatch(setSelectedSector(selectedOption));

    };

    const handleJobRoleChange = (selectedOption) => {
        dispatch(setSelectedJobRole(selectedOption));
    };


    const convertToISTWithoutChangingTime = (inputDateTime) => {
        const [date, time] = inputDateTime.split('T');

        const formattedIST = `${date}T${time}:00.000+05:30`;

        return formattedIST;
    };

    const convertToISTWithoutChangingTimeBulk = (inputDateTime) => {
        console.log('Received inputDateTime:', inputDateTime);

        let dateTimeStr;

        if (typeof inputDateTime === 'number') {
            const date = new Date((inputDateTime - 25569) * 86400000);
            dateTimeStr = date.toISOString().split('.')[0];
        } else if (typeof inputDateTime === 'string') {
            const dateTimeRegex = /(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{2}):(\d{2}) (AM|PM)/;
            const match = inputDateTime.match(dateTimeRegex);

            if (!match) {
                throw new Error('Invalid inputDateTime format. Expected format: MM/DD/YYYY HH:MM:SS AM/PM');
            }

            const [, month, day, year, hours, minutes, seconds, meridian] = match;
            let hours24 = parseInt(hours, 10);

            if (meridian.toLowerCase() === 'pm' && hours !== '12') {
                hours24 += 12;
            } else if (meridian.toLowerCase() === 'am' && hours === '12') {
                hours24 = 0;
            }

            dateTimeStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours24.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
        } else {
            throw new TypeError('Expected a string or number as inputDateTime');
        }

        const dateTimeParts = dateTimeStr.split('T');
        if (dateTimeParts.length !== 2) {
            throw new Error('Invalid inputDateTime format. Expected format: YYYY-MM-DDTHH:MM:SS');
        }

        const [date, time] = dateTimeParts;
        const formattedTime = time.length === 8 ? time : time.slice(0, 8);

        const formattedIST = `${date}T${formattedTime}.000+05:30`;

        return formattedIST;
    };


    function convertToIST(utcTimeStr) {
        const utcDate = new Date(utcTimeStr);
        const utcTime = utcDate.getTime();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istTime = new Date(utcTime + istOffset);

        const year = istTime.getUTCFullYear();
        const month = String(istTime.getUTCMonth() + 1).padStart(2, '0');
        const day = String(istTime.getUTCDate()).padStart(2, '0');

        let hours = istTime.getUTCHours();
        const minutes = String(istTime.getUTCMinutes()).padStart(2, '0');
        const seconds = String(istTime.getUTCSeconds()).padStart(2, '0');

        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        hours = String(hours).padStart(2, '0');

        return `${year}-${month}-${day}, ${hours}:${minutes}:${seconds} ${ampm}`;
    }

    const handleStartDateChange = (e) => {
        const assessmentStartDate = e.target.value;
        console.log(assessmentStartDate);
        const result = convertToISTWithoutChangingTime(assessmentStartDate);
        console.log(result);
        setAssessmentStartDate(e.target.value);

    };

    const handleEndDateChange = (e) => {
        const assessmentEndDate = e.target.value;
        const result = convertToISTWithoutChangingTime(assessmentEndDate);
        console.log(result);
        setAssessmentEndDate(e.target.value);
    };

    const startDateBodyTemplate = (rowData) => {
        return <span>{convertToIST(rowData.startDate)}</span>;
    };

    const endDateBodyTemplate = (rowData) => {
        return <span>{convertToIST(rowData.endDate)}</span>;
    };

    const handleEditClick = (rowData) => {
        const startDate = convertToISTWithoutChangingTime(rowData.startDate);
        const endDate = convertToISTWithoutChangingTime(rowData.endDate);
        setEditFormData({
            _id: rowData._id,
            name: rowData.name,
            type: rowData.type,
            no: rowData.no,
            startDate: startDate,
            endDate: endDate,
            durationInMin: rowData.durationInMin,
            noOfCandidates: rowData.noOfCandidates,
            isPracticalVisibleToCandidate: rowData.isPracticalVisibleToCandidate,
            isAssessorEvidenceRequired: rowData.isAssessorEvidenceRequired,

        });

        setEditFormId(rowData._id);
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
        const updatedBatch = {
            ...editFormData,
            no: String(editFormData.no),
            startDate: convertToISTWithoutChangingTime(editFormData.startDate),
            endDate: convertToISTWithoutChangingTime(editFormData.endDate),
            durationInMin: Number(editFormData.durationInMin),
            noOfCandidates: Number(editFormData.noOfCandidates),
            isPracticalVisibleToCandidate: editFormData.isPracticalVisibleToCandidate,
            isAssessorEvidenceRequired: editFormData.isAssessorEvidenceRequired
        };

        console.log('Submitting Update for batch:', updatedBatch);
        const resultAction = await dispatch(updateBatch(updatedBatch));
        if (updateBatch.fulfilled.match(resultAction)) {
            console.log('Update successful:', resultAction);
            setIsEditFormVisible(false);
            dispatch(fetchBatchesBySectorJobRole({ sectorId: selectedSector?._id, jobRoleId: selectedJobRole._id }));
        } else {
            console.log('Update failed:', resultAction);
        }
        console.log('Update result:', resultAction);
    };

    const handleView = (rowData) => {
        setViewData(rowData);
        setIsViewFormVisible(true);
    };

    const handleDeleteClick = (rowData) => {
        setSelectedBatch(rowData);
        setConfirmAction('Delete Batch');
        setIsConfirmVisible(true);
    };

    const handleDeleteCandidates = (rowData) => {
        setSelectedBatch(rowData);
        setConfirmAction('Delete Candidates');
        setIsConfirmVisible(true);
    };

    const handleClearResponses = (rowData) => {    
        setSelectedBatch(rowData);
        setConfirmAction('Clear Responses');
        setIsConfirmVisible(true);
    };

    const handleCopyId = (rowData) => {
        if (rowData && rowData._id) {
            navigator.clipboard.writeText(rowData._id);
            // toast.success('Batch Id copied to clipboard!');
            Swal.fire({
                html:`<div class="custon-error-container">
                              <div class="custom-swal-icon-wrapper">
                              <i class="fa fa-check-circle custom-success-icon"></i>
                              </div>
                              <hr class="custom-error-divider" />
                              <div class="custom-error-message capitalize">Candidate copied to clipboard!</div>
                              </div>`,
                              toast:false,
                              position:"center",
                              color:"#000",
                              timer: 3000,
                              timerProgressBar: true,
                              backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: false, 
                              customClass: {
                                popup: "custom-swal-popup",
                                confirmButton: "custom-confirm-button",
                                actions: "swal-center-actions",
                                icon: "custom-swal-icon",
                              }
            })
        }
    };

    const confirmActionHandler = async () => {
        if (!selectedBatch || !selectedBatch._id) {
            // toast.error('Invalid Batch selected');
            Swal.fire({
                html:`<div class="custon-error-container">
                              <div class="custom-swal-icon-wrapper">
                              <i class="fas fa-exclamation-circle custom-error-icon"></i>
                              </div>
                              <hr class="custom-error-divider" />
                              <div class="custom-error-message capitalize">Candidate copied to clipboard!</div>
                              </div>`,
                              toast:false,
                              position:"center",
                              color:"#000",
                              timer: 3000,
                              timerProgressBar: true,
                              backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: false, 
                              customClass: {
                                popup: "custom-swal-popup",
                                confirmButton: "custom-confirm-button",
                                actions: "swal-center-actions",
                                icon: "custom-swal-icon",
                              }
            })
            return;
        }
        const batchId = selectedBatch._id;

        if (confirmAction === 'Delete Batch') {
            await dispatch(deleteBatch(batchId));
        } else if (confirmAction === 'Delete Candidates') {
            await dispatch(deleteCandidateFromBatch(batchId));
        } else if(confirmAction === 'Clear Responses') {
            await dispatch(clearBatchResponses(batchId))
        }
        dispatch(fetchBatchesBySectorJobRole({ sectorId: selectedSector?._id, jobRoleId: selectedJobRole._id }));
        setIsConfirmVisible(false);
        setSelectedBatch(null);

    };

    const handleExtendEndDateClick = (rowData) => {
        setEditEndDate({
            _id: rowData._id,
            endDate: convertToISTWithoutChangingTime(rowData.endDate),
        });

        setExtendEndDateVisible(true);
    };

    const handleExtendEndDateChange = (e) => {
        const { name, value } = e.target;
        console.log(`Changing ${name} to ${value}`);
        setEditEndDate(prevState => ({
            ...prevState,
            [name]: value
        }));
        console.log('Updated editEndDate:', { ...editEndDate, [name]: value });
    };

    const handleExtendEndDateSubmit = async (e) => {
        e.preventDefault();
        const updatedBatch = {
            batchId: editEndDate._id,
            endDate: convertToISTWithoutChangingTime(editEndDate.endDate),
        };

        console.log('Submitting Update for batch:', updatedBatch);
        await dispatch(extendEndDate(updatedBatch));
        setExtendEndDateVisible(false);
        dispatch(fetchBatchesBySectorJobRole({ sectorId: selectedSector?._id, jobRoleId: selectedJobRole._id }));

    };

    const menuRefs = useRef([]);
    const actionBodyTemplate = (rowData, options) => {
        const items = [
            {
                label: 'Edit',
                icon: 'pi pi-pencil',
                command: () => handleEditClick(rowData),
                disabled: type === 'sub-admin' && rowData.status !== 'not-assigned'

            },
            {
                label: 'Clear Batch Responses',
                icon: 'pi pi-trash',
                command: () => handleClearResponses(rowData),
                disabled: type === 'sub-admin'
            },
            {
                label: 'Delete Candidates',
                icon: 'pi pi-user-minus',
                command: () => handleDeleteCandidates(rowData),
                disabled: type === 'sub-admin'
                
            },
            {
                label: 'Delete Batch',
                icon: 'pi pi-trash',
                command: () => handleDeleteClick(rowData),
                disabled: type === 'sub-admin' && rowData.status !== 'not-assigned'
            },
            {
                label: 'View',
                icon: 'pi pi-eye',
                command: () => handleView(rowData)
            },
            {
                label: 'Copy Batch Id',
                icon: 'pi pi-copy',
                command: () => handleCopyId(rowData)
            },
            {
                label: 'Extend End Date',
                icon: 'pi pi-calendar-plus',
                command: () => handleExtendEndDateClick(rowData),
            }
        ];

        return (
            <>
                <Menu model={items} popup ref={el => menuRefs.current[options.rowIndex] = el} id={`popup_menu_${options.rowIndex}`} />
                <Button icon="pi pi-ellipsis-v" className="p-button-rounded p-button-secondary" onClick={(event) => menuRefs.current[options.rowIndex].toggle(event)} />
            </>
        );
    };

    const renderSectorShortName = (rowData) => {
        return rowData.sector?.sector_short_name?.toUpperCase();
    };

    const filteredBatches = batches.filter(batch => {
        const matchesJobRole = selectedJobRole ? batch.jobRole?._id === selectedJobRole._id : [];
        const matchesStatus = selectedStatus === 'All' ? true : batch.status === selectedStatus;
        return matchesJobRole && matchesStatus;
    });
    const handleStatusChange = (event) => {
        setSelectedStatus(event.target.value);
    };
    const navigate = useNavigate();

    const addCandidateTemplate = (rowData) => {

        if (rowData.status === 'not-assigned') {
            const style = {
                color: 'green',
                boxShadow: `0 0 5px green`,
                padding: '1px',
                borderRadius: '5px',
                textAlign: 'center'
            };
            return (
                <div style={style} onClick={() => navigate(`/manageCandidate`)}>
                    Add
                </div>
            );
        }

        const style = {
            color: 'red',
            boxShadow: `0 0 5px red`,
            padding: '1px',
            borderRadius: '5px',
            textAlign: 'center'
        };
        return <div style={style}>Batch Full</div>;
    };

    const batchStatusTemplate = (rowData) => {
        if (rowData.status === 'not-assigned') {
            const style = {
                color: 'red',
                boxShadow: `0 0 5px red`,
                padding: '1px',
                borderRadius: '5px',
                textAlign: 'center'
            }
            return <div style={style}>NotAssigned</div>;
        } else if (rowData.status === 'assigned') {
            const style = {
                color: 'green',
                boxShadow: `0 0 5px green`,
                padding: '2px',
                borderRadius: '5px',
                textAlign: 'center'
            }
            return <div style={style}>Assigned</div>;
        }
        else if (rowData.status === 'completed') {
            const style = {
                color: 'blue',
                boxShadow: `0 0 5px blue`,
                padding: '1px',
                borderRadius: '5px',
                textAlign: 'center'
            }
            return <div style={style}>Completed</div>;
        }
        else {
            const style = {
                color: 'orange',
                boxShadow: `0 0 5px orange`,
                padding: '1px',
                borderRadius: '5px',
                textAlign: 'center'
            }
            return <div style={style}>Ongoing</div>;
        }

    }

    return (
        <div className="max-w-[20rem]  xs:max-w-[23rem] sm:max-w-[60rem] my-2  md:max-w-[86rem]  lg:max-w-[100%] xl:w-[100%]
        mx-auto mt-14 sm:mt-5 p-0 sm:p-2  py-8 bg-white border-2 border-white/10 backdrop-blur-[20px] items-center overflow-hidden duration-200 ease-in-out text-black rounded-lg shadow-lg flex-grow-0 ">
            <h2 className="text-xl font-bold mb-4 ml-1  p-2 text-center sm:text-left"> Manage Batch </h2>
            <div className="flex flex-col  space-y-2">
                <div className="grid grid-cols-1 p-2  md:grid-cols-3 gap-4 bg-gray-100 rounded-lg py-2">
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
                            className="w-full text-sm border-2 border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition z-50"
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
                            className="w-full text-sm border-2 border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition z-10"

                        />
                    </div>
                </div>

                {showButtons && (
                    <div className="flex flex-col md:flex-row items-center mb-4 space-y-2 md:space-y-0 md:space-x-4">
                        <Button
                            label="Add New"
                            icon={<IoMdAdd />}
                            onClick={() => setFormVisible(true)}
                            className="p-button-primary bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-md transition-all ease-in-out duration-300 shadow-lg flex items-center space-x-2 text-sm"
                        />

                        <Button
                            label="Bulk Upload"
                            icon={<MdOutlineNoteAdd />}
                            onClick={() => setBulkUploadVisible(!isBulkUploadVisible)}
                            className="p-button-success bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-all ease-in-out duration-300 shadow-lg flex items-center space-x-2 text-sm"
                        />

                        <Button
                            label='Download Sample Excel'
                            onClick={handleDownload}
                            className="p-button-primary bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-all ease-in-out duration-300 shadow-lg flex items-center space-x-2 text-sm" />

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

            <div className="flex flex-col mt-2 space-y-2">

                {formVisible && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                            <div className="flex flex-col flex-1">
                                <label htmlFor="batchName" className="font-semibold">Batch Name</label>
                                <input
                                    type="text"
                                    id="batchName"
                                    value={batchName}
                                    onChange={(e) => setBatchName(e.target.value)}
                                    placeholder='Enter Batch Name'
                                    className="px-2 py-2 text-sm md:px-3 md:py-2 border-2 rounded-md focus:outline-none"
                                />
                            </div>

                            <div className="flex flex-col flex-1">
                                <label htmlFor="batchNo" className="font-semibold">Batch No</label>
                                <input
                                    type="text"
                                    id="batchNo"
                                    value={batchNo}
                                    onChange={(e) => setBatchNo(e.target.value)}
                                    onWheel={(e) => e.target.blur()}
                                    placeholder='Enter Batch No'
                                    className="px-2 py-2 text-sm md:px-3 md:py-2 border-2 rounded-md focus:outline-none"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="batchtype" className=" font-semibold">Batch Type</label>
                                <select id="batchtype"
                                    value={batchType}
                                    onChange={(e) => setBatchType(e.target.value)} className="px-2 py-2 text-sm md:px-3 md:py-2 border-2 rounded-md focus:outline-none">
                                    <option value="">Select</option>
                                    <option value="regular">regular</option>
                                    <option value="reassessment">reassessment</option>
                                </select>
                            </div>

                            <div className="flex flex-col flex-1">
                                <label htmlFor="scheme" className="font-semibold ">Scheme Name</label>
                                <input
                                    type="text"
                                    id="scheme"
                                    value={scheme}
                                    onChange={(e) => setScheme(e.target.value)}
                                    placeholder='Enter Scheme Name'
                                    className="px-2 py-2 text-sm md:px-3 md:py-2 border-2 rounded-md focus:outline-none"
                                />
                            </div>

                            <div className="flex flex-col flex-1">
                                <label htmlFor="subscheme" className=" font-semibold">Sub-Scheme</label>
                                <input
                                    type="text"
                                    id="subscheme"
                                    value={subScheme}
                                    onChange={(e) => setSubScheme(e.target.value)}
                                    placeholder='Enter Sub-Scheme'
                                    className="px-2 py-2 text-sm md:px-3 md:py-2 border-2 rounded-md focus:outline-none"
                                />
                            </div>

                            <div className="flex flex-col flex-1">
                                <label htmlFor="assessmentStartDate" className="font-semibold">Assessment Start Date Time</label>
                                <input
                                    type="datetime-local"
                                    id="startdatetime"
                                    value={assessmentStartDate}
                                    onChange={handleStartDateChange}
                                    className="px-2 py-2 text-sm md:px-3 md:py-2 border-2 rounded-md focus:outline-none"
                                />

                            </div>
                            <div className="flex flex-col flex-1">
                                <label htmlFor="assessmentEndDate" className="font-semibold ">Assessment End Date Time</label>
                                <input
                                    type="datetime-local"
                                    id="enddatetime"
                                    value={assessmentEndDate}
                                    onChange={handleEndDateChange}
                                    className="px-2 py-2 text-sm md:px-3 md:py-2 border-2 rounded-md focus:outline-none"
                                />
                            </div>


                            <div className="flex flex-col flex-1">
                                <label htmlFor="assessmentDuration" className="font-semibold">Assessment Duration(Minutes)</label>
                                <input
                                    type="number"
                                    id="assessmentDuration"
                                    value={assessmentDuration}
                                    onChange={(e) => setAssessmentDuration(e.target.value)}
                                    onWheel={(e) => e.target.blur()}
                                    placeholder='Enter Assessment Duration'
                                    className="px-2 py-2 text-sm md:px-3 md:py-2 border-2 rounded-md focus:outline-none"
                                />
                            </div>
                            <div className="flex flex-col flex-1">
                                <label htmlFor="numberOfCandidates" className="font-semibold">Number of Candidates</label>
                                <input
                                    type="number"
                                    id="numberOfCandidates"
                                    value={numberOfCandidates}
                                    onChange={(e) => setNumberOfCandidates(e.target.value)}
                                    onWheel={(e) => e.target.blur()}
                                    placeholder='Enter Number of Candidates'
                                    className="px-2 py-2 text-sm md:px-3 md:py-2 border-2 rounded-md focus:outline-none"
                                />
                            </div>

                            <div className="flex flex-col flex-1 mb-5 mt-2">
                                <label className="flex items-center relative w-max cursor-pointer select-none">
                                    <span className="font-semibold mr-3">Assessor Evidence Required</span>

                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={isAssessorEvidenceRequired}
                                        onChange={(e) => setIsAssessorEvidenceRequired(e.target.checked)}
                                    />

                                    <div
                                        className={`w-14 h-7 rounded-md relative transition-colors ${isAssessorEvidenceRequired ? 'bg-green-500' : 'bg-red-500'
                                            }`}
                                    >
                                        <div
                                            className={`w-7 h-7 rounded-md bg-gray-200 absolute top-0 transform transition-transform ${isAssessorEvidenceRequired ? 'translate-x-7' : ''
                                                }`}
                                        />
                                    </div>

                                    <span className="absolute font-medium text-xs uppercase right-1 text-white">NO</span>
                                    <span className="absolute font-medium text-xs uppercase right-8 text-white">YES</span>
                                </label>
                            </div>
                            <div className="flex flex-col flex-1 mb-5 mt-2">
                                <label className="flex items-center relative w-max cursor-pointer select-none">
                                    <span className="font-semibold mr-3">Practical Visible Candidate</span>

                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={isPracticalVisible}
                                        onChange={(e) => setIsPracticalVisible(e.target.checked)}
                                    />

                                    <div
                                        className={`w-14 h-7 rounded-md relative transition-colors ${isPracticalVisible ? 'bg-green-500' : 'bg-red-500'
                                            }`}
                                    >
                                        <div
                                            className={`w-7 h-7 rounded-md bg-gray-200 absolute top-0 transform transition-transform ${isPracticalVisible ? 'translate-x-7' : ''
                                                }`}
                                        />
                                    </div>

                                    <span className="absolute font-medium text-xs uppercase right-1 text-white">NO</span>
                                    <span className="absolute font-medium text-xs uppercase right-8 text-white">YES</span>
                                </label>
                            </div>
                        </div>
                        {!selectedSector && (
                            <div className="text-red-500 text-md mt-2">
                                Please select a Sector, Job Role before entering batch information.
                            </div>
                        )}
                        <div className="flex space-x-4">
                            <button type="submit" className="w-32 py-2 text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br  shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-md text-sm px-5 text-center transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 flex items-center justify-center">
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
            </div>

            {viewData && (
                <Dialog
                    header="Batch Details"
                    visible={isViewFormVisible}
                    style={{ width: '60vw', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#f9f9f9' }}
                    className="p-fluid custom-dialog"
                    onHide={() => setIsViewFormVisible(false)}
                    dismissableMask
                >
                    <div
                        className="p-grid p-align-start p-justify-between"
                        style={{ lineHeight: '2rem', gap: '1rem' }}
                    >
                        <div className="p-col-6" style={{ padding: '1rem', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                            <p><strong><i className="pi pi-hashtag" style={{ marginRight: '8px', color: '#007ad9' }}></i>Batch Number:</strong> {viewData.no}</p>
                            <p><strong><i className="pi pi-book" style={{ marginRight: '8px', color: '#007ad9' }}></i>Batch Name:</strong> {viewData.name}</p>
                            <p><strong><i className="pi pi-th-large" style={{ marginRight: '8px', color: '#007ad9' }}></i>Batch Type:</strong> {viewData.type}</p>
                            <p><strong><i className="pi pi-calendar" style={{ marginRight: '8px', color: '#007ad9' }}></i>Start Date:</strong> {convertToIST(viewData.startDate)}</p>
                            <p><strong><i className="pi pi-calendar-times" style={{ marginRight: '8px', color: '#007ad9' }}></i>End Date:</strong> {convertToIST(viewData.endDate)}</p>
                            <p><strong><i className="pi pi-users" style={{ marginRight: '8px', color: '#007ad9' }}></i>No. of Candidates:</strong> {viewData.noOfCandidates}</p>
                            <p><strong><i className="pi pi-check-circle" style={{ marginRight: '8px', color: '#007ad9' }}></i>Status:</strong> {viewData.status}</p>
                            <p><strong><i className="pi pi-briefcase" style={{ marginRight: '8px', color: '#007ad9' }}></i>Sector:</strong> {viewData.sector.name.toUpperCase()}</p>
                            <p><strong><i className="pi pi-cog" style={{ marginRight: '8px', color: '#007ad9' }}></i>Job Role:</strong> {viewData.jobRole.name}</p>
                            <p><strong><i className="pi pi-user" style={{ marginRight: '8px', color: '#007ad9' }}></i>Assessor:</strong> {`${viewData.assessor?.name}-${viewData.assessor?.sipUserId}`}</p>
                            <p><strong><i className="pi pi-question-circle" style={{ marginRight: '8px', color: '#007ad9' }}></i>Theory Question Bank:</strong> {viewData.theoryQuestionBank ? viewData.theoryQuestionBank.name : "N/A"}</p>
                            <p><strong><i className="pi pi-question-circle" style={{ marginRight: '8px', color: '#007ad9' }}></i>Practical Question Bank:</strong> {viewData.practicalQuestionBank ? viewData.practicalQuestionBank.name : "N/A"}</p>
                            <p><strong><i className="pi pi-question-circle" style={{ marginRight: '8px', color: '#007ad9' }}></i>Viva Question Bank:</strong> {viewData.vivaQuestionBank ? viewData.vivaQuestionBank.name : "N/A"}</p>
                            <p><strong><i className="pi pi-eye" style={{ marginRight: '8px', color: '#007ad9' }}></i>Practical Visible to Candidate:</strong> {viewData.isPracticalVisibleToCandidate ? 'Yes' : 'No'}</p>
                            <p><strong><i className="pi pi-id-card" style={{ marginRight: '8px', color: '#007ad9' }}></i>Candidate Aadhar Required:</strong> {viewData.isCandidateAdharRequired ? 'Yes' : 'No'}</p>
                            <p><strong><i className="pi pi-map-marker" style={{ marginRight: '8px', color: '#007ad9' }}></i>Candidate Location Required:</strong> {viewData.isCandidateLocationRequired ? 'Yes' : 'No'}</p>
                            <p><strong><i className="pi pi-camera" style={{ marginRight: '8px', color: '#007ad9' }}></i>Candidate Selfie Required:</strong> {viewData.isCandidateSelfieRequired ? 'Yes' : 'No'}</p>
                            <p><strong><i className="pi pi-image" style={{ marginRight: '8px', color: '#007ad9' }}></i>Random Photo Required:</strong> {viewData.isCandidatePhotosRequired ? 'Yes' : 'No'}</p>
                            <p><strong><i className="pi pi-video" style={{ marginRight: '8px', color: '#007ad9' }}></i>Random Video Required:</strong> {viewData.isCandidateVideoRequired ? 'Yes' : 'No'}</p>
                            <p><strong><i className="pi pi-bolt" style={{ marginRight: '8px', color: '#007ad9' }}></i>AI Required:</strong> {viewData.isSuspiciousActivityDetectionRequired ? 'Yes' : 'No'}</p>
                            <p><strong><i className="pi pi-file" style={{ marginRight: '8px', color: '#007ad9' }}></i>Assessor Evidence Required:</strong> {viewData.isAssessorEvidenceRequired ? 'Yes' : 'No'}</p>
                        </div>
                    </div>
                </Dialog>


            )}

            <Dialog header="Edit Batch" visible={isEditFormVisible} style={{ width: '50vw' }} onHide={() => setIsEditFormVisible(false)} dismissableMask>
                <form onSubmit={handleEditFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex flex-col">
                            <label htmlFor="name" className="mb-1 font-semibold text-md ml-1">Batch Name</label>
                            <input
                                type="text"
                                id="name"
                                value={editFormData.name}
                                placeholder="Enter Batch Name"
                                onChange={handleEditFormChange}
                                name="name"
                                className="px-3 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-transparent border-2"
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="type" className="mb-1 font-semibold text-md ml-1">Batch Type</label>
                            <select id="type"
                                value={editFormData.type}
                                onChange={handleEditFormChange}
                                name="type"
                                className='px-3 py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition'>
                                <option value="">Select</option>
                                <option value="regular">Regular</option>
                                <option value="reassessment">Re-Assessment</option>
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="no" className="mb-1 font-semibold text-md ml-1">Batch Number</label>
                            <input
                                type="text"
                                id="no"
                                value={editFormData.no}
                                placeholder="Enter Batch Number"
                                onChange={handleEditFormChange}
                                onWheel={(e) => e.target.blur()}
                                name="no"
                                className="px-3 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-transparent border-2"
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="assessmentDuration" className="mb-1 font-semibold text-md ml-1">Assessment Duration</label>
                            <input
                                type="number"
                                id="durationInMin"
                                value={editFormData.durationInMin}
                                placeholder="Enter Assessment Duration"
                                onChange={handleEditFormChange}
                                onWheel={(e) => e.target.blur()}
                                name="durationInMin"
                                className="px-3 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-transparent border-2"
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="assessmentStartDate" className="mb-1 font-semibold text-md ml-1">Assessment Start Date</label>
                            <input
                                type="datetime-local"
                                id="startDate"
                                value={editFormData.startDate}
                                onChange={handleEditFormChange}
                                name="startDate"
                                className="px-3 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-transparent border-2"
                                required
                            />

                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="assessmentEndDate" className="mb-1 font-semibold text-md ml-1">Assessment End Date</label>
                            <input
                                type="datetime-local"
                                id="endDate"
                                value={editFormData.endDate}
                                onChange={handleEditFormChange}
                                name="endDate"
                                className="px-3 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-transparent border-2"
                                required
                            />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="noOfCandidates" className="mb-1 font-semibold text-md ml-1">Number of Candidates</label>
                            <input
                                type="number"
                                id="noOfCandidates"
                                value={editFormData.noOfCandidates}
                                placeholder="Enter Number of Candidates"
                                onChange={handleEditFormChange}
                                onWheel={(e) => e.target.blur()}
                                name="noOfCandidates"
                                className="px-3 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-transparent border-2"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-4 mt-2 ml-3">
                            <label className="flex items-center relative w-max cursor-pointer select-none">
                                <span className="font-semibold mr-3">Assessor Evidence Required</span>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={editFormData.isAssessorEvidenceRequired}
                                    onChange={(e) => setEditFormData(prevState => ({ ...prevState, isAssessorEvidenceRequired: e.target.checked }))}
                                />
                                <div
                                    className={`w-14 h-7 rounded-md relative transition-colors ${editFormData.isAssessorEvidenceRequired ? 'bg-green-500' : 'bg-red-500'
                                        }`}
                                >
                                    <div
                                        className={`w-7 h-7 rounded-md bg-gray-200 absolute top-0 transform transition-transform ${editFormData.isAssessorEvidenceRequired ? 'translate-x-7' : ''
                                            }`}
                                    />

                                </div>
                                <span className="absolute font-medium text-xs uppercase right-1 text-white">NO</span>
                                <span className="absolute font-medium text-xs uppercase right-8 text-white">YES</span>
                            </label>

                            <label className="flex items-center relative w-max cursor-pointer select-none">
                                <span className="font-semibold mr-3">Practical Visible Candidate</span>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={editFormData.isPracticalVisibleToCandidate}
                                    onChange={(e) => setEditFormData(prevState => ({ ...prevState, isPracticalVisibleToCandidate: e.target.checked }))}
                                />
                                <div
                                    className={`w-14 h-7 rounded-md relative transition-colors ${editFormData.isPracticalVisibleToCandidate ? 'bg-green-500' : 'bg-red-500'
                                        }`}
                                >
                                    <div
                                        className={`w-7 h-7 rounded-md bg-gray-200 absolute top-0 transform transition-transform ${editFormData.isPracticalVisibleToCandidate ? 'translate-x-7' : ''
                                            }`}
                                    />

                                </div>
                                <span className="absolute font-medium text-xs uppercase right-1 text-white">NO</span>
                                <span className="absolute font-medium text-xs uppercase right-8 text-white">YES</span>
                            </label>
                        </div>

                    </div>
                    <div className="flex space-x-4 mt-4">
                        <button type="submit" className="w-28 py-2 text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br font-medium rounded-md text-sm px-5 text-center me-2 mb-2 ">
                            Update
                        </button>

                        <button type="button" onClick={() => setIsEditFormVisible(false)} className="w-28 py-2 text-white bg-red-600 hover:bg-red-700  font-medium rounded-md text-sm px-5 text-center me-2 mb-2 ">Close</button>
                    </div>
                </form>
            </Dialog>

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

            <Dialog header="Extend End Date" visible={isExtendEndDateVisible} style={{ width: '50vw' }} onHide={() => setExtendEndDateVisible(false)} dismissableMask>
                <form onSubmit={handleExtendEndDateSubmit} className="space-y-4">
                    <div className="flex flex-col">
                        <label htmlFor="assessmentEndDate" className="mb-1 font-semibold text-md ml-1">Assessment End Date</label>
                        <input
                            type="datetime-local"
                            id="endDate"
                            value={editEndDate.endDate}
                            onChange={handleExtendEndDateChange}
                            name="endDate"
                            className="px-3 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-transparent border-2"
                            required
                        />
                    </div>

                    <div className="flex space-x-4 mt-4">
                        <button type='submit' className="w-30 py-2 text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br font-medium rounded-md text-sm px-5 text-center me-2 mb-2 ">
                            Extend
                        </button>

                        <button type="button" onClick={() => setExtendEndDateVisible(false)} className="w-30 py-2 text-white bg-red-600 hover:bg-red-700  font-medium rounded-md text-sm px-5 text-center me-2 mb-2 ">Close</button>
                    </div>
                </form>
            </Dialog>


            <div className="min-w-full inline-block align-middle overflow-x-auto mt-10">
                <div className="flex flex-col  sm:flex-col justify-between items-start  mb-4 gap-4 px-2">
                    <h3 className="text-xl font-bold">Batches List</h3>
                    <div className="">
                        <label htmlFor="statusFilter" className="mr-2 font-semibold">Filter by Status:</label>
                        <select id="statusFilter" value={selectedStatus} onChange={handleStatusChange} className="py-1 pr-6 border rounded-md">
                            <option value="All" >All</option>
                            <option value="completed">Completed</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="assigned">Assigned</option>
                            <option value="not-assigned">Not Assigned</option>
                        </select>
                    </div>
                    <span className="p-input-icon-left w-auto sm:w-auto">
                        <i className="pi pi-search px-2" />
                        <InputText
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Search..."
                            className=" px-10 w-full sm:w-72 rounded-md"
                        />
                    </span>
                </div>
                <div className="max-w-[23rem] p-1 md:max-w-[29rem] sm:max-w-[42rem] lg:max-w-[44rem] xl:max-w-[85rem]">

                    <DataTable
                        value={filteredBatches}
                        paginator rows={10}
                        rowsPerPageOptions={[5, 10, 20, 50, 100,]}
                        responsiveLayout="scroll"
                        scrollable={true}
                        globalFilter={globalFilter}
                        className="min-w-full bg-white border border-gray-200"
                    >
                        <Column body={actionBodyTemplate} header="Actions" className="py-2 px-4 border-b" />
                        <Column body={addCandidateTemplate} header="Add Candidate" className="py-2 px-4 border-b text-center" />
                        <Column field="_id" header="Batch Id" className="py-2 px-4 border-b" />
                        <Column field="no" header="Batch No" className="py-2 px-4 border-b" />
                        <Column field="name" header="Batch Name" className="py-2 px-4 border-b" />
                        <Column body={batchStatusTemplate} header="Batch Status" className="py-2 px-4 border-b text-center" />
                        <Column field="assessor.name" header="Assessor" className="py-2 px-4 border-b text-center" />
                        <Column field="type" header="Batch Type" className="py-2 px-4 border-b text-center" />
                        <Column field="noOfCandidates" header="Candidates" className="py-2 px-4 border-b text-center" />
                        <Column body={startDateBodyTemplate} header="Start Date(yyyy-mm-dd)" className="py-2 px-3 border-b" style={{ width: '200px' }} />
                        <Column body={endDateBodyTemplate} header="End Date(yyyy-mm-dd)" className="py-2 px-3 border-b" style={{ width: '200px' }} />
                        <Column field="durationInMin" header="Duration" className="py-2 px-4 border-b text-center" />
                        <Column header="Sector" body={renderSectorShortName} className="py-2 px-4 border-b" />
                        <Column field="jobRole.name" header="Job Role" className="py-2 px-4 border-b" />

                    </DataTable>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center font-semibold p-4 gap-80">
                    <span> Total Records: {filteredBatches.length}</span>
                </div>
            </div>

        </div>
    );
};

export default ManageBatch;