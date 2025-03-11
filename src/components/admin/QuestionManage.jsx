
import axios from 'axios';
import DOMPurify from 'dompurify';
import { saveAs } from 'file-saver';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Menu } from 'primereact/menu';
import { useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaEdit } from 'react-icons/fa';
import { IoMdAdd, IoMdClose, IoMdCloudUpload } from 'react-icons/io';
import { MdOutlineNoteAdd } from 'react-icons/md';
import { VscClearAll } from 'react-icons/vsc';
import 'react-quill/dist/quill.snow.css';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { BASE_URL } from '../constant';
import { fetchJobRolesBySector } from '../features/jobRoleSlice';
import { fetchNos } from '../features/nosSlice';
import { fetchPCs } from '../features/pcSlice';
import { createQuestion, deleteQuestion, fetchQuestionsByQuestionSet, setSelectedJobRole, setSelectedNOS, setSelectedPaperSet, setSelectedPcName, setSelectedSector, updateQuestion } from '../features/questionManageSlice';
import { fetchQuestionSetsBySectorJobRole } from '../features/questionSetSlice';
import { fetchSectors } from '../features/subAdminSlice';
import MediaTextEditor from './TextEditor';
import './TooltipContainer.css';

const ManageQuestion = () => {
 
    const dispatch = useDispatch();
    const [selectedLang, setSelectedLang] = useState('en');
    const [totalMarks, setTotalMarks] = useState('');
    const [difficultyLevel, setDifficultyLevel] = useState('');
    const [questionType, setQuestionType] = useState('');
    const [options, setOptions] = useState([
        { option: '', isCorrect: false },
        { option: '', isCorrect: false },
        { option: '', isCorrect: false },
        { option: '', isCorrect: false },
    ]);

    const [isTranslating, setIsTranslating] = useState(false);

    const [optionA, setOptionA] = useState("");
    const [optionB, setOptionB] = useState("");
    const [optionC, setOptionC] = useState("");
    const [optionD, setOptionD] = useState("");

    const [formVisible, setFormVisible] = useState(false);
    const [correctAnswerIndex, setCorrectAnswerIndex] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [isBulkUploadVisible, setBulkUploadVisible] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);
    const [isEditFormVisible, setIsEditFormVisible] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [isViewFormVisible, setIsViewFormVisible] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [viewData, setViewData] = useState(null);
    const [editFormData, setEditFormData] = useState({
        _id: '',
        title: '',
        questionType: '',
        difficultyLevel: '',
        options: [{ option: '', isCorrect: false }, { option: '', isCorrect: false }, { option: '', isCorrect: false }, { option: '', isCorrect: false }],
        marks: '',

    })
    const quillRef = useRef(null);
    const [questionContent, setQuestionContent] = useState('');

    const [isPreviewVisible, setIsPreviewVisible] = useState(false);

    const { noses, sectors, jobRoles, pcNames, paperSets, selectedNOS, selectedPaperSet, selectedPcName, selectedSector, selectedJobRole, questions } = useSelector(state => state.questionManage);

    const showButtons = selectedSector && selectedJobRole && selectedPaperSet && !formVisible;

    const isTranslated = questions.map(question => question.translations && question.translations[selectedLang]).filter(Boolean).length > 0;

    useEffect(() => {
        dispatch(fetchSectors())
    }, [dispatch]);

    useEffect(() => {
        if (selectedSector) {
            dispatch(fetchJobRolesBySector(selectedSector._id));
        }
    }, [dispatch, selectedSector]);

    useEffect(() => {
        if (selectedJobRole) {
            dispatch(fetchQuestionSetsBySectorJobRole({ sectorId: selectedSector?._id, jobRoleId: selectedJobRole._id }))
        }
    }, [dispatch, selectedJobRole]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (
            questionContent && difficultyLevel && questionType &&
            totalMarks && selectedNOS &&
            selectedPaperSet && selectedSector && selectedJobRole
        ) {
            const filteredOptions = options ? options.filter(option => option.option !== '') : [];

            const isViva = selectedPaperSet?.type === 'viva';

            let hasCorrectAnswer = false;

            if (isViva) {
                hasCorrectAnswer = options.length > 0 && options.some(option => option.isCorrect);

                if (!hasCorrectAnswer) {
                    // toast.error("Please provide at least one correct answer for practical/viva question.");
                    Swal.fire({
                        html:`<div class="custon-error-container">
                                      <div class="custom-swal-icon-wrapper">
                                      <i class="fas fa-exclamation-circle custom-error-icon"></i>
                                      </div>
                                      <hr class="custom-error-divider" />
                                      <div class="custom-error-message capitalize">Please provide at least one correct answer for practical/viva question.</div>
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
            } else {
                hasCorrectAnswer = options.some(option => option.isCorrect);
                if (!hasCorrectAnswer) {
                    // toast.error("Please select at least one correct option.");
                    Swal.fire({
                        html:`<div class="custon-error-container">
                                      <div class="custom-swal-icon-wrapper">
                                      <i class="fas fa-exclamation-circle custom-error-icon"></i>
                                      </div>
                                      <hr class="custom-error-divider" />
                                      <div class="custom-error-message capitalize">Please select at least one correct option.</div>
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
            }

            const sanitizedTitle = DOMPurify.sanitize(questionContent);

            let formattedOptions;

            if (isViva) {
                const firstOption = filteredOptions[0];
                const firstCorrectOption = filteredOptions.find(opt => opt.isCorrect);

                formattedOptions = [];

                if (firstOption) {
                    formattedOptions.push({
                        option: firstOption.option.replace(/<\/?p>/g, ''),
                        isCorrect: firstOption.isCorrect,
                        _id: firstOption._id
                    });
                }

                if (firstCorrectOption && !formattedOptions.some(opt => opt.isCorrect)) {
                    formattedOptions.push({
                        option: firstCorrectOption.option.replace(/<\/?p>/g, ''),
                        isCorrect: firstCorrectOption.isCorrect,
                        _id: firstCorrectOption._id
                    });
                }
            } else {
                formattedOptions = filteredOptions.map((opt, index) => ({
                    option: opt?.option,
                    isCorrect: opt.isCorrect,
                    _id: opt._id
                }));
            }
            const question = {
                title: sanitizedTitle,
                difficultyLevel: difficultyLevel,
                questionType: questionType,
                options: formattedOptions,
                marks: Number(totalMarks),
                nos: selectedNOS._id,
                questionBank: selectedPaperSet._id,
                sector: selectedSector._id,
                jobRole: selectedJobRole._id,
            };

            if (selectedPcName) {
                question.pc = selectedPcName._id;
            }

            console.log("Question object:", question);

            await dispatch(createQuestion(question)).unwrap();
            handleClear();
            dispatch(fetchQuestionsByQuestionSet(selectedPaperSet._id));
        } else {
            // toast.error("Please fill in all required fields.");
            Swal.fire({
                html:`<div class="custon-error-container">
                              <div class="custom-swal-icon-wrapper">
                              <i class="fas fa-exclamation-circle custom-error-icon"></i>
                              </div>
                              <hr class="custom-error-divider" />
                              <div class="custom-error-message capitalize">Please fill in all required fields.</div>
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
        }
    };


    const handleClear = () => {
        setQuestionContent('');
        setDifficultyLevel('');
        setQuestionType('');
        setOptionA('');
        setOptionB('');
        setOptionC('');
        setOptionD('');
        setTotalMarks('');
        setSelectedNOS(null);
        setSelectedPaperSet(null);
        setSelectedSector(null);
        setSelectedJobRole(null);
        setSelectedPcName(null);
        setOptions([
            { option: '', isCorrect: false },
            { option: '', isCorrect: false },
            { option: '', isCorrect: false },
            { option: '', isCorrect: false },
        ]);
        setCorrectAnswerIndex(null);
        setFormVisible(false);
        setIsEditFormVisible(false);
    };

    const downloadQuestions = () => {
        if (!selectedQuestion || selectedQuestion.length === 0) {
            // toast.error('No questions selected to download.');
            Swal.fire({
                html:`<div class="custon-error-container">
                              <div class="custom-swal-icon-wrapper">
                              <i class="fas fa-exclamation-circle custom-error-icon"></i>
                              </div>
                              <hr class="custom-error-divider" />
                              <div class="custom-error-message capitalize">No questions selected to download.</div>
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
        const data = selectedQuestion?.length > 0 ? selectedQuestion : questions;
        const languages = new Set(['en']);

        data.forEach(question => {
            if (question.translations) {
                Object.keys(question.translations).forEach(lang => languages.add(lang));
            }
            question.options.forEach(option => {
                if (option.translations) {
                    Object.keys(option.translations).forEach(lang => languages.add(lang));
                }
            });
        });

        const headers = [
            ['Question Set', 'Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Option', 'Marks', 'Difficulty Level', 'NOS']
        ];

        const workbook = XLSX.utils.book_new();

        if (languages.size === 0) {
            const worksheet = XLSX.utils.aoa_to_sheet(headers);
            const formattedData = data.map(question => {
                const options = question.options.map(option => option.option);
                const correctOption = question.options.find(option => option.isCorrect);
                const correctOptionAlphabet = correctOption ? String.fromCharCode(65 + question.options.indexOf(correctOption)) : '';
                return {
                    'Question Set': question.questionBank.name,
                    'Question': question.title,
                    'Option A': options[0] || '',
                    'Option B': options[1] || '',
                    'Option C': options[2] || '',
                    'Option D': options[3] || '',
                    'Correct Option': correctOptionAlphabet,
                    'Marks': question.marks,
                    'Difficulty Level': question.difficultyLevel,
                    'NOS': question.nos.nosCode,
                };
            });

            XLSX.utils.sheet_add_json(worksheet, formattedData, { origin: 'A2', skipHeader: true });

            const colWidths = [
                { wch: 20 },
                { wch: 50 },
                { wch: 20 },
                { wch: 20 },
                { wch: 20 },
                { wch: 20 },
                { wch: 15 },
                { wch: 10 },
                { wch: 15 },
            ];
            worksheet['!cols'] = colWidths;

            worksheet['!rows'] = [{ hpt: 20 }];

            XLSX.utils.book_append_sheet(workbook, worksheet, `questionset`);
        }

        languages.forEach(lang => {
            const worksheet = XLSX.utils.aoa_to_sheet(headers);
            const formattedData = data.map(question => {
                const options = question.options.map(option => option.translations[lang] || option.option);
                const correctOption = question.options.find(option => option.isCorrect);
                const correctOptionAlphabet = correctOption ? String.fromCharCode(65 + question.options.indexOf(correctOption)) : '';
                return {
                    'Question Set': question.questionBank.name,
                    'Question': question.translations[lang] || question.title,
                    'Option A': options[0] || '',
                    'Option B': options[1] || '',
                    'Option C': options[2] || '',
                    'Option D': options[3] || '',
                    'Correct Option': correctOptionAlphabet,
                    'Marks': question.marks,
                    'Difficulty Level': question.difficultyLevel,
                    'NOS': question.nos.nosCode,
                };
            });

            XLSX.utils.sheet_add_json(worksheet, formattedData, { origin: 'A2', skipHeader: true });

            const colWidths = [
                { wch: 20 },
                { wch: 50 },
                { wch: 20 },
                { wch: 20 },
                { wch: 20 },
                { wch: 20 },
                { wch: 15 },
                { wch: 10 },
                { wch: 15 },
            ];
            worksheet['!cols'] = colWidths;

            worksheet['!rows'] = [{ hpt: 20 }];

            XLSX.utils.book_append_sheet(workbook, worksheet, lang.toUpperCase());
        });

        // Write the workbook to a file
        XLSX.writeFile(workbook, `${selectedPaperSet.name}.xlsx`);
    };


    const handleDownloadPractical = () => {
        const sampleData = [
            { "Question": "first practical question", "OptionA": "2", "OptionB": "4", "OptionC": "6", "OptionD": "7", "Correct Option": "A", "Marks": "2", "Difficulty Level": "easy", "Question Type": "practical" },

        ];

        const workbook = XLSX.utils.book_new();
        if (noses && noses.length > 0) {
            noses.forEach(nos => {
                const worksheet = XLSX.utils.json_to_sheet(sampleData);

                const columnWidths = [
                    { wpx: 200 },
                    { wpx: 100 },
                    { wpx: 100 },
                    { wpx: 100 },
                    { wpx: 100 },
                    { wpx: 100 },
                    { wpx: 150 },
                    { wpx: 100 },
                ];

                worksheet['!cols'] = columnWidths;

                Object.keys(worksheet).forEach(cell => {
                    if (worksheet[cell] && typeof worksheet[cell] === 'object') {
                        worksheet[cell].s = { alignment: { wrapText: true } };
                    }
                });
                const sanitizedNosCode = nos.nosCode.replace(/[:\\/?*[\]]/g, '');
                XLSX.utils.book_append_sheet(workbook, worksheet, sanitizedNosCode);
            });

            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array', cellStyles: true });

            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `practicalQuestionset:${selectedPaperSet._id}.xlsx`);
        } else {
            // toast.error('No NOS available in this job role to create the workbook.');
            Swal.fire({
                html:`<div class="custon-error-container">
                              <div class="custom-swal-icon-wrapper">
                              <i class="fas fa-exclamation-circle custom-error-icon"></i>
                              </div>
                              <hr class="custom-error-divider" />
                              <div class="custom-error-message capitalize">No NOS available in this job role to create the workbook.</div>
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
        }
    };
    const handleDownloadViva = () => {
        const sampleData = [
            { "Question": "first viva question", "Answer": "answer", "Marks": "2", "Difficulty Level": "easy", "Question Type": "viva" },
        ];

        const workbook = XLSX.utils.book_new();
        if (noses && noses.length > 0) {
            noses.forEach(nos => {
                const worksheet = XLSX.utils.json_to_sheet(sampleData);

                const columnWidths = [
                    { wpx: 200 },
                    { wpx: 100 },
                    { wpx: 100 },
                    { wpx: 100 },
                    { wpx: 100 },
                    { wpx: 100 },
                    { wpx: 150 },
                    { wpx: 100 },
                ];

                worksheet['!cols'] = columnWidths;

                Object.keys(worksheet).forEach(cell => {
                    if (worksheet[cell] && typeof worksheet[cell] === 'object') {
                        worksheet[cell].s = { alignment: { wrapText: true } };
                    }
                });
                const sanitizedNosCode = nos.nosCode.replace(/[:\\/?*[\]]/g, '');
                XLSX.utils.book_append_sheet(workbook, worksheet, sanitizedNosCode);
            });

            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array', cellStyles: true });

            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `vivaQuestionset:${selectedPaperSet._id}.xlsx`);
        } else {
            // toast.error('No NOS available in this job role to create the workbook.');
            Swal.fire({
                html:`<div class="custon-error-container">
                              <div class="custom-swal-icon-wrapper">
                              <i class="fas fa-exclamation-circle custom-error-icon"></i>
                              </div>
                              <hr class="custom-error-divider" />
                              <div class="custom-error-message capitalize">No NOS available in this job role to create the workbook.</div>
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
        }
    };

    const handleDownload = () => {
        const sampleData = [
            { "Question": "first question", "OptionA": "2", "OptionB": "4", "OptionC": "6", "OptionD": "7", "Correct Option": "A", "Marks": "2", "Difficulty Level": "easy", "Question Type": "mcq" },
        ];

        const workbook = XLSX.utils.book_new();
        if (noses && noses.length > 0) {
            noses.forEach(nos => {
                const worksheet = XLSX.utils.json_to_sheet(sampleData);

                const columnWidths = [
                    { wpx: 200 },
                    { wpx: 100 },
                    { wpx: 120 },
                    { wpx: 100 },
                    { wpx: 100 },
                    { wpx: 100 },
                    { wpx: 150 },
                    { wpx: 100 },
                ];

                worksheet['!cols'] = columnWidths;

                Object.keys(worksheet).forEach(cell => {
                    if (worksheet[cell] && typeof worksheet[cell] === 'object') {
                        worksheet[cell].s = { alignment: { wrapText: true } };
                    }
                });

                const sanitizedNosCode = nos.nosCode.replace(/[:\\/?*[\]]/g, '');
                XLSX.utils.book_append_sheet(workbook, worksheet, sanitizedNosCode);
            });

            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array', cellStyles: true });

            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `theoryQuestionset:${selectedPaperSet._id}.xlsx`);
        } else {
            // toast.error('No NOS available in this job role to create the workbook.');
            Swal.fire({
                html:`<div class="custon-error-container">
                              <div class="custom-swal-icon-wrapper">
                              <i class="fas fa-exclamation-circle custom-error-icon"></i>
                              </div>
                              <hr class="custom-error-divider" />
                              <div class="custom-error-message capitalize">'No NOS available in this job role to create the workbook.</div>
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
        }
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

            const validationErrors = [];
            const transformedData = workbook.SheetNames.flatMap(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                return jsonData.map((row, index) => {
                    const {
                        "Question": title,
                        "OptionA": option1,
                        "OptionB": option2,
                        "OptionC": option3,
                        "OptionD": option4,
                        "Correct Option": correctOption,
                        "Marks": marks,
                        "Difficulty Level": difficultyLevel,
                        "Question Type": questionType,
                        "Answer": answer
                    } = row;


                    const validTitle = title ? `${title}`.trim() : '';
                    let validOption1 = option1 !== undefined ? `${option1}`.trim() : '';
                    const validOption2 = option2 !== undefined ? `${option2}`.trim() : '';
                    const validOption3 = option3 !== undefined ? `${option3}`.trim() : '';
                    const validOption4 = option4 !== undefined ? `${option4}`.trim() : '';
                    const validCorrectOption = correctOption ? `${correctOption}`.trim().toLowerCase() : '';
                    const validMarks = marks !== undefined ? Number(marks) : null;
                    const validDifficultyLevel = difficultyLevel ? `${difficultyLevel}`.trim().toLowerCase() : '';
                    let validQuestionType = questionType ? `${questionType}`.trim().toLowerCase() : '';

                    if (!validTitle || !validDifficultyLevel || !validQuestionType || validMarks === null) {
                        validationErrors.push(`Row ${index + 1} in sheet ${sheetName}: Missing or invalid values.`);
                        return null;
                    }


                    let options = [];
                    if (validQuestionType === 'mcq' || validQuestionType === 'practical') {
                        validQuestionType = 'mcq'
                        options = [
                            { option: validOption1, isCorrect: validCorrectOption === "a" },
                            { option: validOption2, isCorrect: validCorrectOption === "b" },
                            { option: validOption3, isCorrect: validCorrectOption === "c" },
                            { option: validOption4, isCorrect: validCorrectOption === "d" },
                        ].filter(opt => opt.option !== undefined && opt.option !== '');
                    }


                    if (validQuestionType === 'viva') {
                        validQuestionType = 'mcq';
                        validOption1 = answer ? `${answer}`.trim() : '';
                        options = [{ option: validOption1, isCorrect: true }];
                    }

                    if (options.length > 0 && !options.some(opt => opt.isCorrect)) {
                        validationErrors.push(`Row ${index + 1} in sheet ${sheetName}: There should be at least one correct answer.`);
                        return null;
                    }

                    const nos = noses.find(n => n.nosCode.replace(/[:\\/?*[\]]/g, '') === sheetName);

                    if (!nos) {
                        validationErrors.push(`Row ${index + 1} in sheet ${sheetName}: No matching NOS found for sheet name.`);
                        return null;
                    }

                    return {
                        title: validTitle,
                        options,
                        marks: validMarks,
                        difficultyLevel: validDifficultyLevel,
                        questionType: validQuestionType,
                        questionBank: selectedPaperSet._id,
                        nos: nos?._id,
                    };
                }).filter(item => item !== null);
            });

            if (validationErrors.length > 0) {
                setErrorMessage(validationErrors.join('\n'));
                return;
            }
            try {
                await axios.post(`${BASE_URL}company/questions/bulk-insert`, { questions: transformedData }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': "Bearer " + sessionStorage.getItem("token")
                    },
                });

                dispatch(fetchQuestionsByQuestionSet(selectedPaperSet?._id));
                // toast.success('Data uploaded successfully!');
                Swal.fire({
                    html:`<div class="custon-error-container">
                                  <div class="custom-swal-icon-wrapper">
                                  <i class="fa fa-check-circle custom-success-icon"></i>
                                  </div>
                                  <hr class="custom-error-divider" />
                                  <div class="custom-error-message capitalize">Data uploaded successfully!</div>
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

            } catch (error) {
                console.error('Error uploading data:', error);
                // toast.error(error.response?.data?.message || 'Error uploading data.');
                Swal.fire({
                    html:`<div class="custon-error-container">
                                  <div class="custom-swal-icon-wrapper">
                                  <i class="fas fa-exclamation-circle custom-error-icon"></i>
                                  </div>
                                  <hr class="custom-error-divider" />
                                  <div class="custom-error-message capitalize">${error.response?.data?.message || 'Error uploading data.'}</div>
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
            }
        };

        reader.readAsArrayBuffer(selectedFile);
    };
    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        setErrorMessage('');
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
    });

    const handleEditClick = (rowData) => {
        const sanitizedTitle = DOMPurify.sanitize(rowData.title)
        const sanitizedOptions = rowData.options.map(option => ({
            option: DOMPurify.sanitize(option.option) || '',
            isCorrect: typeof option.isCorrect === 'boolean' ? option.isCorrect : false,
        }));
        setEditFormData({
            _id: rowData._id,
            title: sanitizedTitle,
            difficultyLevel: rowData.difficultyLevel,
            marks: rowData.marks,
            options: sanitizedOptions,
            questionType: rowData.questionType,
        });

        const quill = quillRef.current?.getEditor();
        if (quill) {
            quill.setText(sanitizedTitle);
        }
        setIsEditFormVisible(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        const { _id, ...updatedQuestion } = {
            ...editFormData,
            marks: Number(editFormData.marks),
        };


        const resultAction = await dispatch(updateQuestion({ _id, updatedQuestion }));
        if (updateQuestion.fulfilled.match(resultAction)) {
            setIsEditFormVisible(false);
            dispatch(fetchQuestionsByQuestionSet(selectedPaperSet._id));
        } else {
            // toast.error("Failed to update the question. Please try again.");
            Swal.fire({
                html:`<div class="custon-error-container">
                              <div class="custom-swal-icon-wrapper">
                              <i class="fas fa-exclamation-circle custom-error-icon"></i>
                              </div>
                              <hr class="custom-error-divider" />
                              <div class="custom-error-message capitalize">Failed to update the question. Please try again.</div>
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
        setSelectedQuestion(rowData);
        setConfirmAction('delete');
        setIsConfirmVisible(true);
    };

    const confirmActionHandler = async () => {
        if (!selectedQuestion || !selectedQuestion._id) {
            // toast.error('Invalid Question selected');
            Swal.fire({
                html:`<div class="custon-error-container">
                              <div class="custom-swal-icon-wrapper">
                              <i class="fas fa-exclamation-circle custom-error-icon"></i>
                              </div>
                              <hr class="custom-error-divider" />
                              <div class="custom-error-message capitalize">Invalid Question selected</div>
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
        const pcId = selectedQuestion._id;

        if (confirmAction === 'delete') {
            dispatch(deleteQuestion(pcId));
        }

        dispatch(fetchQuestionsByQuestionSet(selectedPaperSet?._id));
        setIsConfirmVisible(false);
        setSelectedQuestion(null);

    };

    const handleView = (rowData) => {
        setViewData(rowData);
        setIsViewFormVisible(true);
    };

    const handleCopyId = (rowData) => {
        if (rowData && rowData._id) {
            navigator.clipboard.writeText(rowData._id);
            // toast.success('Question Id copied to clipboard!');
            Swal.fire({
                html:`<div class="custon-error-container">
                              <div class="custom-swal-icon-wrapper">
                              <i class="fa fa-check-circle custom-success-icon"></i>
                              </div>
                              <hr class="custom-error-divider" />
                              <div class="custom-error-message capitalize">Question Id copied to clipboard!</div>
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
                label: 'Copy',
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

   

    const handleSectorChange = (e) => {
        const sectorId = e.target.value;
        const sector = sectors.find(c => c._id === sectorId);
        dispatch(setSelectedSector(sector));

    };

    const handleJobRoleChange = (e) => {
        const jobRoleId = e.target.value;
        const jobRole = jobRoles.find(c => c._id === jobRoleId);
        dispatch(setSelectedJobRole(jobRole));
        if (jobRole) {
            dispatch(fetchNos(jobRole._id));
            dispatch(fetchQuestionSetsBySectorJobRole({ sectorId: selectedSector?._id, jobRoleId: jobRole._id }));
        }
    };

    const handleNOSChange = (e) => {
        const nosId = e.target.value;
        const nos = noses.find(c => c._id === nosId);
        dispatch(setSelectedNOS(nos));
        if (nos) {
            dispatch(fetchPCs(nos._id));
        }
    };


    const handlePcNameChange = (e) => {
        const pcNameId = e.target.value;
        const pcName = pcNames.find(c => c._id === pcNameId);
        dispatch(setSelectedPcName(pcName));
    };

    const handlePaperSetChange = (e) => {
        const paperSetId = e.target.value;
        const paperSet = paperSets.find(c => c._id === paperSetId);
        dispatch(setSelectedPaperSet(paperSet));
        if (paperSet) {
            dispatch(fetchQuestionsByQuestionSet(paperSet._id))
        }
        setSelectedQuestion([]);
    };


    const handlePreview = () => {
        event.preventDefault();
        setIsPreviewVisible(true);
    };

    const previewFooter = (
        <div>
            <Button label="Close" icon="pi pi-times" onClick={() => setIsPreviewVisible(false)} />
        </div>
    );

    const filteredQuestions = selectedPaperSet ? questions.filter(question => question.questionBank._id === selectedPaperSet._id) : [];
    const handleLangChange = (e) => {
        setSelectedLang(e.target.value);
        dispatch(fetchQuestionsByQuestionSet(selectedPaperSet._id));
        setIsTranslating(false);
    };

    const renderHTMLContent = (rowData) => {
        const title = rowData.translations ? !Object.keys(rowData.translations).includes(selectedLang) ? rowData.title  : rowData.translations[selectedLang] : rowData.title;
        return <div dangerouslySetInnerHTML={{ __html: title }} />;
    };

  const handleTranslate = async () => {

        try {
            const response = await axios.patch(`${BASE_URL}company/question-banks/${selectedPaperSet._id}/translate`, { targetLang: selectedLang }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + sessionStorage.getItem("token")
                },
            });

            if(response.status === 200){

                // toast.success('Your Translation in under Process.');
                Swal.fire({
                    html:`<div class="custon-error-container">
                                  <div class="custom-swal-icon-wrapper">
                                  <i class="fa fa-check-circle custom-success-icon"></i>
                                  </div>
                                  <hr class="custom-error-divider" />
                                  <div class="custom-error-message capitalize">Your Translation in under Process.</div>
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
                dispatch(fetchQuestionsByQuestionSet(selectedPaperSet._id));
                setIsTranslating(true);
            }
           
        }
        catch (error) {
            console.error('Error translating question:', error);
            // toast.error(error.response?.data?.message || 'Error translating question.');
            Swal.fire({
                html:`<div class="custon-error-container">
                              <div class="custom-swal-icon-wrapper">
                              <i class="fas fa-exclamation-circle custom-error-icon"></i>
                              </div>
                              <hr class="custom-error-divider" />
                              <div class="custom-error-message capitalize">${error.response?.data?.message || 'Error translating question.'}</div>
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
        }
    }


    return (
        <div className="max-w-[20rem]  xs:max-w-[23rem] sm:max-w-[60rem] my-2  md:max-w-[86rem]  lg:max-w-[100%] xl:w-[100%]
        mx-auto mt-14 sm:mt-5 p-0 sm:p-2  py-8 bg-white border-2 border-white/10 backdrop-blur-[20px] items-center overflow-hidden duration-200 ease-in-out text-black rounded-lg shadow-lg flex-grow-0 ">
            <h2 className="text-xl font-bold mb-4 ml-1  p-2 text-center sm:text-left">Manage Question </h2>
            <div className="flex flex-col space-y-4 my-2">
                {!formVisible && (
                    <div className="grid grid-cols-1 p-2 md:grid-cols-3 gap-4 bg-gray-100 rounded-lg py-2 pb-6">
                        <div className="flex flex-col space-y-4 my-2">
                            <label htmlFor="sector" className="font-semibold">Select Sector</label>
                            <select
                                id="sector"
                                value={selectedSector ? selectedSector._id : ''}
                                onChange={handleSectorChange}
                                className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            >
                                <option value="">Select Sector</option>
                                {sectors.map((sector) => (
                                    <option key={sector._id} value={sector._id}>{`${sector.name?.toUpperCase()} (${sector.sector_short_name?.toUpperCase()})`}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col space-y-4 my-2">
                            <label htmlFor="jobrole" className="font-semibold">Select Job Role</label>
                            <select
                                id="jobrole"
                                value={selectedJobRole ? selectedJobRole._id : ''}
                                onChange={handleJobRoleChange}
                                className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                disabled={!selectedSector}
                            >
                                <option value="">Select Job Role</option>
                                {jobRoles.map((jobRole) => (
                                    <option key={jobRole._id} value={jobRole._id}>{`${jobRole.name}-V${jobRole.version}`}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col flex-1 space-y-4 my-2">
                            <label htmlFor="questionset" className="font-semibold">Select Question set </label>
                            <select
                                id="questionset"
                                value={selectedPaperSet ? selectedPaperSet._id : ''}
                                onChange={handlePaperSetChange}
                                className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                disabled={!selectedJobRole}
                            >
                                <option value="">Select</option>
                                {paperSets && paperSets.length > 0 ? (
                                    paperSets.map((c) => (
                                        <option key={c._id} value={c._id}>{`${c.name} - (${c.type})`}</option>
                                    ))
                                ) : (
                                    <option value="" disabled>No Paper Set Available</option>
                                )}
                            </select>
                        </div>
                    </div>
                )}

                {showButtons && (
                    <div className="flex flex-col md:flex-row items-center mb-4 space-y-4 md:space-y-0 md:space-x-4">
                        <Button
                            label="Add New"
                            icon={<IoMdAdd />}
                            onClick={() => setFormVisible(true)}
                            className="p-button-primary bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-md text-sm transition-all ease-in-out duration-300 shadow-lg flex items-center space-x-2"
                        />

                        <Button
                            label="Bulk Upload"
                            icon={<MdOutlineNoteAdd />}
                            onClick={() => setBulkUploadVisible(!isBulkUploadVisible)}
                            className="p-button-success bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md text-sm transition-all ease-in-out duration-300 shadow-lg flex items-center space-x-2"
                        />

                        <Button
                            label='Download Sample Excel'
                            onClick={() => {
                                if (selectedPaperSet?.type === 'practical') {
                                    handleDownloadPractical();
                                } else if (selectedPaperSet?.type === 'viva') {
                                    handleDownloadViva();
                                } else {
                                    handleDownload();
                                }
                            }}
                            className="p-button-primary bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-all text-sm ease-in-out duration-300 shadow-lg flex items-center space-x-2"
                        />
                   
                        <select name="translation" id="tl" onChange={handleLangChange} className='p-1.5 px-5 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition'>
                            <option value="en" className='pr-2'>English</option>
                            <option value="hi" className='pr-2'>Hindi</option>
                            <option value="mr" className='pr-2'>Marathi</option>
                            <option value="ta" className='pr-2'>Tamil</option>
                            <option value="te" className='pr-2'>Telugu</option>
                            <option value="kn" className='pr-2'>Kannada</option>
                            <option value="gu" className='pr-2'>Gujarati</option>
                            <option value="bn" className='pr-2'>Bengali</option>
                            <option value="pa" className='pr-2'>Punjabi</option>
                            <option value="ml" className='pr-2'>Malayalam</option>
                            <option value="ur" className='pr-2'>Urdu</option>
                            <option value="or" className='pr-2'>Odia</option>
                            <option value="as" className='pr-2'>Assamese</option>
                        </select>
               
                    {!isTranslated && (
                        <Button
                        label={'Translate'}
                            onClick={handleTranslate}
                            disabled={isTranslating}
                            className="p-button-primary bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-all text-sm ease-in-out duration-300 shadow-lg flex items-center space-x-2 mt-2"
                        />
                    )}
        
          
                        {isBulkUploadVisible && (
                            <>
                                <div
                                    {...getRootProps()}
                                    className={`w-full md:w-2/3 lg:w-1/3 border-2 border-dashed rounded-lg p-6 mt-2 transition-all ease-in-out duration-300 ${isDragActive ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-300'} hover:bg-gray-100 hover:border-gray-400 cursor-pointer`}
                                >
                                    <input {...getInputProps()} />
                                    {isDragActive ? (
                                        <p className="text-blue-700 font-semibold text-center">Drop the files here ...</p>
                                    ) : (
                                        <p className="text-gray-700 text-center">Drag & drop a file here, or <span className="text-purple-600">click to select a file</span></p>
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
                                        className={`p-button-primary bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-md transition-all ease-in-out duration-300 shadow-lg flex items-center space-x-2`}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {formVisible && (<form onSubmit={handleSubmit} className="space-y-4 my-2 ">
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex flex-col flex-1">
                        <label htmlFor="sector" className="mb-1 font-semibold text-lg ml-1">Select Sector</label>
                        <select
                            id="sector"
                            value={selectedSector ? selectedSector._id : ''}
                            onChange={handleSectorChange}
                            className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        >
                            <option value="">Select</option>
                            {sectors && sectors.length > 0 ? (
                                sectors.map((c) => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))
                            ) : (
                                <option value="" disabled>No sectors available</option>
                            )}
                        </select>
                    </div>
                    <div className="flex flex-col flex-1">
                        <label htmlFor="jobrole" className="mb-1 font-semibold text-lg ml-1">Select Job Role</label>
                        <select
                            id="jobrole"
                            value={selectedJobRole ? selectedJobRole._id : ''}
                            onChange={handleJobRoleChange}
                            className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            disabled={!selectedSector}
                        >
                            <option value="">Select</option>
                            {jobRoles && jobRoles.length > 0 ? (
                                jobRoles.map((c) => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))
                            ) : (
                                <option value="" disabled>No Job Role available</option>
                            )}
                        </select>
                    </div>

                    <div className="grid grid-cols-1">
                        <label htmlFor="questionset" className="mb-1 font-semibold text-lg ml-1">Select Question set </label>
                        <select
                            id="questionset"
                            value={selectedPaperSet ? selectedPaperSet._id : ''}
                            onChange={handlePaperSetChange}
                            className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            disabled={!selectedJobRole}
                        >
                            <option value="">Select</option>
                            {paperSets && paperSets.length > 0 ? (
                                paperSets.map((c) => (
                                    <option key={c._id} value={c._id}>{`${c.name} (${c.type.toUpperCase()})`}</option>
                                ))
                            ) : (
                                <option value="" disabled>No Paper Set Available</option>
                            )}
                        </select>
                    </div>
                    <div className="flex flex-col flex-1 !ml-0">
                        <label htmlFor="nos" className="mb-1 font-semibold text-lg ml-1">Select NOS Code</label>
                        <select
                            id="NOS"
                            value={selectedNOS ? selectedNOS._id : ''}
                            onChange={handleNOSChange}
                            className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        >
                            <option value="">Select</option>
                            {noses && noses.length > 0 ? (
                                noses.map((c) => (
                                    <option key={c._id} value={c._id}>{c.nosCode}</option>
                                ))
                            ) : (
                                <option value="" disabled>No NOS Code available</option>
                            )}
                        </select>
                    </div>

                    <div className="flex flex-col flex-1">
                        <label htmlFor="pc" className="mb-1 font-semibold text-lg ml-1">Select PC</label>
                        <select
                            id="pc"
                            value={selectedPcName ? selectedPcName._id : ''}
                            onChange={handlePcNameChange}
                            className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            disabled={!selectedJobRole}
                        >
                            <option value="">Select</option>
                            {pcNames && pcNames.length > 0 ? (
                                pcNames.map((c) => (
                                    <option key={c._id} value={c._id}>{c.pcName}</option>
                                ))
                            ) : (
                                <option value="" disabled>No PC Available</option>
                            )}
                        </select>
                    </div>
                    <div className="flex flex-col flex-1 ">
                        <label htmlFor="questionType" className="mb-1 font-semibold text-lg ml-1">Question Type</label>
                        <select id="questionType"
                            value={questionType}
                            onChange={(e) => setQuestionType(e.target.value)} className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
                            <option >Select</option>
                            <option value="mcq">MCQ</option>


                        </select>
                    </div>

                    <div className="flex flex-col flex-1 !ml-0">
                        <label htmlFor="totalmarks" className="mb-1 font-semibold text-lg ">Marks</label>
                        <input
                            type="number"
                            id="totalmarks"
                            value={totalMarks}
                            placeholder="Enter Marks"
                            onChange={(e) => setTotalMarks(e.target.value)}
                            onWheel={(e) => e.target.blur()}
                            className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            disabled={!selectedPaperSet}
                        />
                    </div>

                    <div className="flex flex-col flex-1 ">
                        <label htmlFor="difficultyLevel" className="mb-1 font-semibold text-lg ml-1">Difficulty Level</label>
                        <select id="difficultyLevel"
                            value={difficultyLevel}
                            onChange={(e) => setDifficultyLevel(e.target.value)} className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
                            <option >Select</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    <div className="flex flex-col col-span-3 mb-12">

                        <label htmlFor="question" className="mb-2 block font-semibold text-lg">
                            Question
                        </label>

                        <MediaTextEditor content={questionContent} setContent={setQuestionContent} placeholder="Enter your question here..." />
                    </div>
                    <div className=' flex flex-col'>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 w-[365%]">
                            {selectedPaperSet?.type === 'viva' ? (
                                <div className="flex items-center space-x-4 w-full md:w-3/4 lg:w-2/3 relative">
                                    <input
                                        type="radio"
                                        checked={correctAnswerIndex === 0}
                                        onChange={() => {
                                            setCorrectAnswerIndex(0);
                                            setOptions([{ option: optionA, isCorrect: true }]);
                                        }}
                                        className="mr-2 ml-3 h-5 w-5"
                                    />
                                    <div className="tooltip text-xs py-1 px-3 transition-opacity duration-300 rounded-full">
                                        Mark as correct
                                    </div>
                                    <div className="mt-2 w-full">
                                        <label htmlFor="option-A" className="block font-semibold mb-2">
                                            Answer
                                        </label>
                                        <MediaTextEditor content={optionA} setContent={setOptionA} placeholder="Enter the option here..." />
                                    </div>
                                </div>
                            ) : (
                                ['A', 'B', 'C', 'D'].map((label, index) => (
                                    <div key={index} className="flex items-center space-x-4 w-full md:w-3/4 lg:w-2/3 relative">
                                        <input
                                            type="radio"
                                            checked={correctAnswerIndex === index}
                                            onChange={() => {
                                                setCorrectAnswerIndex(index);
                                                const newOptions = options.map((option, i) => ({
                                                    option: i === 0 ? optionA : i === 1 ? optionB : i === 2 ? optionC : optionD,
                                                    isCorrect: i === index,
                                                }));
                                                setOptions(newOptions);
                                            }}
                                            className="mr-2 ml-3 h-5 w-5"
                                        />
                                        <div className="tooltip text-xs py-1 px-3 transition-opacity duration-300 rounded-full">
                                            Mark as correct
                                        </div>
                                        <div className="mt-2 w-full">
                                            <label htmlFor={`option-${label}`} className="block font-semibold mb-2">
                                                Option {label}
                                            </label>
                                            <MediaTextEditor
                                                content={label === 'A' ? optionA : label === 'B' ? optionB : label === 'C' ? optionC : optionD}
                                                setContent={label === 'A' ? setOptionA : label === 'B' ? setOptionB : label === 'C' ? setOptionC : setOptionD}
                                                placeholder={`Enter option ${label} here...`}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>


                        <div className="mt-6 flex space-x-4">
                            <Button label="Preview" icon="pi pi-eye" onClick={handlePreview} />
                        </div>

                        <Dialog
                            header="Preview Question"
                            visible={isPreviewVisible}
                            style={{ width: '50vw' }}
                            footer={previewFooter}
                            onHide={() => setIsPreviewVisible(false)}
                        >
                            <div className="mb-4">
                                <h3 className="font-semibold text-xl">Question:</h3>
                                <div
                                    className="border p-2"
                                    dangerouslySetInnerHTML={{ __html: questionContent }}
                                ></div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-xl">Options:</h3>
                                <ul className="list-disc pl-5">
                                    {options.map((opt, idx) => (
                                        <li key={idx} className={`mb-2 ${opt.isCorrect ? 'text-green-600' : ''}`}>
                                            <span className="font-semibold">Option {String.fromCharCode(65 + idx)}:</span>
                                            <div
                                                className="border p-2 inline-block ml-2"
                                                dangerouslySetInnerHTML={{ __html: opt.option }}
                                            ></div>
                                            {opt.isCorrect && <span className="ml-2 text-green-500">(Correct)</span>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Dialog>
                    </div>
                </div>
                {!selectedPaperSet && (
                    <div className="text-red-500 text-md mt-2">
                        Please select a Sector && Job Role and other information before entering Question detail.
                    </div>
                )}
                <div className="flex space-x-4">
                    <button type="submit" className="w-32 py-2 text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br  shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-md text-sm px-5 text-center me-2 mb-2 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 flex items-center justify-center"> <span className='pr-2'><IoMdAdd className='w-5 h-5' /></span>
                        Add</button>
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
                <Dialog header="Question Details" visible={isViewFormVisible} style={{ width: '50vw' }} onHide={() => setIsViewFormVisible(false)}>
                    <div>
                        <p><strong>Question ID:</strong> {viewData._id}</p>
                        <p><strong>Difficulty Level:</strong> {viewData.difficultyLevel}</p>
                        <p><strong>Title:</strong> {viewData.title}</p>
                        <p><strong>Options:</strong></p>
                        <ul>
                            {viewData.options.map(option => (
                                <li key={option.option}>
                                    {option.option} ({option.isCorrect ? 'Correct' : 'Incorrect'})
                                </li>
                            ))}
                        </ul>
                        <p><strong>Total Marks:</strong> {viewData.marks}</p>
                        <p><strong>Job Role:</strong> {viewData.jobRole?.name}</p>
                        <p><strong>NOS:</strong> {viewData.nos?.nosName}</p>
                    </div>
                </Dialog>
            )}

            <Dialog header="Edit Question" visible={isEditFormVisible} style={{ width: '50vw' }} onHide={() => setIsEditFormVisible(false)}>
                onHide={() => setIsEditFormVisible(false)}
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        <div className="flex flex-col flex-1">
                            <label htmlFor="difficultyLevel" className="mb-1 font-semibold text-sm md:text-lg">Difficulty Level</label>
                            <select id="difficultyLevel" name="difficultyLevel"
                                value={editFormData.difficultyLevel}
                                onChange={handleEditFormChange} className='px-3 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition'>
                                <option >Select</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                        <div className="flex flex-col flex-1">
                            <label htmlFor="marks" className="mb-1 font-semibold text-sm md:text-lg">Total Marks</label>
                            <input
                                type='number'
                                id="marks"
                                name="marks"
                                value={editFormData.marks}
                                onChange={handleEditFormChange}
                                onWheel={(e) => e.target.blur()}
                                className="px-2 py-2 md:px-3 md:py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            />
                        </div>

                        <div className="flex flex-col col-span-3 mb-12">

                            <label htmlFor="question" className="mb-2 block font-semibold text-lg">
                                Question
                            </label>

                            <MediaTextEditor content={editFormData.title} setContent={(content) => setEditFormData(prevState => ({ ...prevState, title: content }))} />
                        </div>

                        <div className="flex flex-col col-span-3">
                            <label className="block font-semibold text-lg mb-2">Options</label>
                            {editFormData.options.map((option, index) => (
                                <div key={index} className="flex items-center space-x-4 w-full md:w-3/4 lg:w-2/3 relative">
                                    <input
                                        type="radio"
                                        checked={option.isCorrect}
                                        onChange={() => {
                                            const newOptions = editFormData.options.map((opt, i) => ({
                                                ...opt,
                                                isCorrect: i === index, // Set the selected index as correct
                                            }));
                                            setEditFormData(prevState => ({
                                                ...prevState,
                                                options: newOptions,
                                            }));
                                        }}
                                        className="mr-2 ml-3 h-5 w-5"
                                    />
                                    <div className="tooltip absolute left-4 bg-purple-500 text-white text-xs py-1 px-3 opacity-0 transition-opacity duration-300 rounded-full">
                                        Mark as correct
                                    </div>
                                    <div className="mt-2 w-full">
                                        <label htmlFor={`option-${index}`} className="block font-semibold mb-2">
                                            Option {String.fromCharCode(65 + index)}
                                        </label>
                                        <MediaTextEditor
                                            content={option.option}
                                            setContent={(content) => {
                                                setEditFormData(prevState => {
                                                    const updatedOptions = [...prevState.options];
                                                    updatedOptions[index] = {
                                                        ...updatedOptions[index],
                                                        option: content,
                                                    };
                                                    return {
                                                        ...prevState,
                                                        options: updatedOptions,
                                                    };
                                                });
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}

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
            <Dialog header="Confirm Delete" visible={isConfirmVisible} style={{ width: '30vw' }} onHide={() => setIsConfirmVisible(false)}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle px-5" style={{ fontSize: '1rem', color: 'orange' }}></i>
                    <span>Are you sure you want to delete this question?</span>
                </div>
                <div className="flex justify-end space-x-4 mt-4">
                    <Button label="Yes" icon="pi pi-check" className="p-button-danger" onClick={confirmActionHandler} />
                    <Button label="No" icon="pi pi-times" className="p-button-secondary" onClick={() => setIsConfirmVisible(false)} />
                </div>
            </Dialog>

            <div className="min-w-full inline-block align-middle overflow-x-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 px-2">
                    <h3 className="text-xl font-bold">Questions List</h3>
                    <span className="p-input-icon-left w-full sm:w-auto">
                        <Button
                            label="Download Questions"
                            icon='pi pi-file-excel'
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 sm:py-2 sm:px-4 rounded-md text-xs sm:text-sm w-auto px-2 sm:w-auto mr-6 lg:text-xs mb-2"
                            onClick={downloadQuestions}
                        />
                        <span className="p-input-icon-left w-full sm:w-auto">
                        <i className="pi pi-search px-2" />
                        <InputText
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Search..."
                            className=" px-10 p-2 sm:w-75 rounded-md"
                        />
                        </span>
                        
                    </span>
                </div>
                <div className="max-w-[23rem] p-1 md:max-w-[50rem] sm:max-w-[30rem] lg:max-w-[76rem] xl:max-w-[86rem]">
                    <DataTable
                        value={filteredQuestions}
                        paginator rows={10}
                        rowsPerPageOptions={[5, 10, 20, 50]}
                        responsiveLayout="scroll"
                        scrollable={true}
                        globalFilter={globalFilter}
                        selection={selectedQuestion}
                        onSelectionChange={(e) => setSelectedQuestion(e.value)}
                        className="min-w-full bg-white border border-gray-200"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3em' }} />
                        <Column body={actionBodyTemplate} header="Actions" className="py-2 px-4 border-b" />
                        <Column field="questionBank.name" header="Question Set" className="py-2 px-4 border-b" />
                        <Column
                            field="title"
                            header="Question"
                            body={renderHTMLContent}
                            className="py-2 px-4 border-b"
                            style={{ width: '300px', maxWidth: '300px', whiteSpace: 'normal', wordWrap: 'break-word' }}
                            headerStyle={{ width: '300px', maxWidth: '300px' }}
                        />
                        <Column field="marks" header="Marks" className="py-2 px-4 border-b" />
                        <Column field="difficultyLevel" header="Difficulty Level" className="py-2 px-4 border-b" />

                    </DataTable>
                </div>

            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 p-4 gap-4">
                <span className="font-medium text-lg">Total Records: {questions.length}</span>
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

}

export default ManageQuestion;
