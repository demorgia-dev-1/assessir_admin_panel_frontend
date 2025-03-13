import axios from "axios";
import { saveAs } from "file-saver";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Menu } from "primereact/menu";
import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaEdit } from "react-icons/fa";
import { IoMdAdd, IoMdClose, IoMdCloudUpload } from "react-icons/io";
import { MdOutlineNoteAdd } from "react-icons/md";
import { VscClearAll } from "react-icons/vsc";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { BASE_URL } from "../constant";
import { fetchJobRolesBySector } from "../features/jobRoleSlice";
import { fetchNos } from "../features/nosSlice";
import {
  createPC,
  deletePC,
  fetchPCs,
  setSelectedJobRole,
  setSelectedNOS,
  setSelectedSector,
  updatePC,
} from "../features/pcSlice";
import { fetchSectors } from "../features/subAdminSlice";

const ManagePCDetails = () => {
  const dispatch = useDispatch();
  const [pcName, setPcName] = useState("");
  const [pcCode, setPcCode] = useState("");
  const [totalMarksInTheory, setTotalMarksInTheory] = useState("");
  const [totalMarksInPractical, setTotalMarksInPractical] = useState("");
  const [totalMarksInViva, setTotalMarksInViva] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [globalFilter, setGlobalFilter] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isBulkUploadVisible, setBulkUploadVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isEditFormVisible, setIsEditFormVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [isViewFormVisible, setIsViewFormVisible] = useState(false);
  const [selectedPC, setSelectedPC] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [editFormData, setEditFormData] = useState({
    _id: "",
    pcName: "",
    pcCode: "",
    totalMarks: "",
    totalMarksInTheory: "",
    totalMarksInPractical: "",
    totalMarksInViva: "",
  });

  const {
    sectors,
    jobRoles,
    noses,
    selectedSector,
    selectedJobRole,
    selectedNOS,
    pcs,
  } = useSelector((state) => state.pc);

  const showButtons = selectedSector && selectedJobRole && !formVisible;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      selectedSector &&
      selectedJobRole &&
      selectedNOS &&
      pcName &&
      totalMarks &&
      totalMarksInTheory &&
      totalMarksInPractical &&
      totalMarksInViva &&
      pcCode
    ) {
      dispatch(
        createPC({
          sector: String(selectedSector._id),
          jobRole: String(selectedJobRole._id),
          nos: String(selectedNOS._id),
          pcName: String(pcName),
          pcCode: String(pcCode),
          totalMarks: Number(totalMarks),
          totalMarksInTheory: Number(totalMarksInTheory),
          totalMarksInPractical: Number(totalMarksInPractical),
          totalMarksInViva: Number(totalMarksInViva),
        })
      ).then(() => {
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 1000);
        dispatch(fetchPCs(selectedNOS._id));
        handleClear();
      });
    } else {
      // toast.error('Please fill in all required fields.');
      Swal.fire({
        html: `
        <div class="custon-error-container">
            <div class="custom-swal-icon-wrapper">
                <i class="fas fa-exclamation-circle custom-error-icon"></i>
            </div>
            <hr class="custom-error-divider" />
            <div class="custom-error-message capitalize">Please fill in all required fields.</div>
        </div>`,
        toast: false,
        position: "center",
        color: "#000",
        timer: 3000,
        timerProgressBar: true,
        backdrop: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: {
          popup: "custom-swal-popup",
          actions: "swal-center-actions",
          icon: "custom-swal-icon",
        },
      });
    }
  };

  const handleDownload = () => {
    const sampleData = [
      {
        "PC Name": "Patient Care",
        "PC Code": "HSC001",
        "Total Marks": 100,
        "Theory Marks": 50,
        "Practical Marks": 30,
        "Viva Marks": 20,
      },
    ];

    const workbook = XLSX.utils.book_new();

    if (noses && noses.length > 0) {
      noses.forEach((nos) => {
        const worksheet = XLSX.utils.json_to_sheet(sampleData);

        const columnWidths = [
          { wpx: 200 },
          { wpx: 100 },
          { wpx: 120 },
          { wpx: 100 },
          { wpx: 100 },
          { wpx: 100 },
          { wpx: 100 },
        ];

        worksheet["!cols"] = columnWidths;

        Object.keys(worksheet).forEach((cell) => {
          if (worksheet[cell] && typeof worksheet[cell] === "object") {
            worksheet[cell].s = { alignment: { wrapText: true } };
          }
        });

        const sanitizedNosCode = nos.nosCode.replace(/[:\\/?*[\]]/g, "");
        XLSX.utils.book_append_sheet(workbook, worksheet, sanitizedNosCode);
      });

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
        cellStyles: true,
      });

      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "sample_bulk_upload_pc.xlsx");
    } else {
      // toast.error('No NOS available in this job role to create the workbook.');
      Swal.fire({
        html: `
        <div class="custon-error-container">
            <div class="custom-swal-icon-wrapper">
                <i class="fas fa-exclamation-circle custom-error-icon"></i>
            </div>
            <hr class="custom-error-divider" />
            <div class="custom-error-message capitalize">No NOS available in this job role to create the workbook.</div>
        </div>`,
        toast: false,
        position: "center",
        color: "#000",
        timer: 3000,
        timerProgressBar: true,
        backdrop: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: {
          popup: "custom-swal-popup",
          actions: "swal-center-actions",
          icon: "custom-swal-icon",
        },
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select a file to upload.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const transformedData = workbook.SheetNames.flatMap((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        return jsonData
          .map((row) => {
            const {
              "PC Name": PCName,
              "PC Code": PCCode,
              "Total Marks": TotalMarks,
              "Theory Marks": TheoryMarks,
              "Practical Marks": PracticalMarks,
              "Viva Marks": VivaMarks,
            } = row;

            if (PCName && PCCode && TotalMarks !== undefined) {
              const nos = noses.find(
                (n) => n.nosCode.replace(/[:\\/?*[\]]/g, "") === sheetName
              );
              if (!nos) {
                // toast.error(`No matching NOS found for sheet name: ${sheetName}`);
                Swal.fire({
                  html: `
                  <div class="custon-error-container">
                    <div class="custom-swal-icon-wrapper">
                        <i class="fas fa-exclamation-circle custom-error-icon"></i>
                    </div>
                    <hr class="custom-error-divider" />
                    <div class="custom-error-message capitalize">${`No matching NOS found for sheet name: ${sheetName}`}</div>
                  </div>`,
                  toast: false,
                  position: "center",
                  color: "#000",
                  timer: 3000,
                  timerProgressBar: true,
                  backdrop: true,
                  allowOutsideClick: false,
                  allowEscapeKey: false,
                  customClass: {
                    popup: "custom-swal-popup",
                    actions: "swal-center-actions",
                    icon: "custom-swal-icon",
                  },
                });
                console.error(
                  `No matching NOS found for sheet name: ${sheetName}`
                );
                return null;
              }
              return {
                sector: selectedSector._id,
                jobRole: selectedJobRole._id,
                nos: nos ? nos._id : null,
                pcName: PCName,
                pcCode: PCCode,
                totalMarksInTheory: TheoryMarks || 0,
                totalMarksInViva: VivaMarks || 0,
                totalMarksInPractical: PracticalMarks || 0,
                totalMarks: TotalMarks,
              };
            }
            return null;
          })
          .filter((item) => item !== null);
      });
      if (transformedData.length === 0) {
        // toast.error('No valid data found in the uploaded file.');
        Swal.fire({
          html: `
          <div class="custon-error-container">
            <div class="custom-swal-icon-wrapper">
                <i class="fas fa-exclamation-circle custom-error-icon"></i>
            </div>
            <hr class="custom-error-divider" />
            <div class="custom-error-message capitalize">No valid data found in the uploaded file.</div>
          </div>`,
          toast: false,
          position: "center",
          color: "#000",
          timer: 3000,
          timerProgressBar: true,
          backdrop: true,
          allowOutsideClick: false,
          allowEscapeKey: false,
          customClass: {
            popup: "custom-swal-popup",
            actions: "swal-center-actions",
            icon: "custom-swal-icon",
          },
        });
        return;
      }
      try {
        const response = await axios.post(
          `${BASE_URL}company/pc/bulk-insert`,
          { pcs: transformedData },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + sessionStorage.getItem("token"),
            },
          }
        );

        if (response.status === 200) {
          handleClear();
          // toast.success('Data uploaded successfully!');
          Swal.fire({
            html: `
            <div class="custon-error-container">
                <div class="custom-swal-icon-wrapper">
                <i class="fa fa-check-circle custom-success-icon"></i>
                </div>
                <hr class="custom-error-divider" />
                <div class="custom-error-message capitalize">Data uploaded successfully!</div>
            </div>`,
            toast: false,
            position: "center",
            color: "#000",
            timer: 3000,
            timerProgressBar: true,
            backdrop: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
            customClass: {
              popup: "custom-swal-popup",
              actions: "swal-center-actions",
              icon: "custom-swal-icon",
            },
          });
          dispatch(fetchPCs(selectedNOS._id));
        } else {
          // toast.error('Error uploading data.');
          Swal.fire({
            html: `
            <div class="custon-error-container">
                <div class="custom-swal-icon-wrapper">
                    <i class="fas fa-exclamation-circle custom-error-icon"></i>
                </div>
                <hr class="custom-error-divider" />
                <div class="custom-error-message capitalize">Error uploading data.</div>
            </div>`,
            toast: false,
            position: "center",
            color: "#000",
            timer: 3000,
            timerProgressBar: true,
            backdrop: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
            customClass: {
              popup: "custom-swal-popup",
              actions: "swal-center-actions",
              icon: "custom-swal-icon",
            },
          });
        }
      } catch (error) {
        console.error("Error uploading data:", error);
        // toast.error('Error uploading data.');
        Swal.fire({
          html: `
          <div class="custon-error-container">
            <div class="custom-swal-icon-wrapper">
                <i class="fas fa-exclamation-circle custom-error-icon"></i>
            </div>
            <hr class="custom-error-divider" />
            <div class="custom-error-message capitalize">Error uploading data.</div>
          </div>`,
          toast: false,
          position: "center",
          color: "#000",
          timer: 3000,
          timerProgressBar: true,
          backdrop: true,
          allowOutsideClick: false,
          allowEscapeKey: false,
          customClass: {
            popup: "custom-swal-popup",
            actions: "swal-center-actions",
            icon: "custom-swal-icon",
          },
        });
      }
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  const onDrop = (acceptedFiles) => {
    dispatch;
    const file = acceptedFiles[0];
    setSelectedFile(file);
    setErrorMessage("");
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
        ".xls",
      ],
    },
  });

  useEffect(() => {
    dispatch(fetchSectors());

    if (selectedSector) {
      dispatch(fetchJobRolesBySector(selectedSector._id));
    }
    if (selectedJobRole) {
      dispatch(fetchNos(selectedJobRole._id));
    }
    if (selectedNOS) {
      dispatch(fetchPCs(selectedNOS._id));
    }
  }, [dispatch, selectedSector, selectedJobRole, selectedNOS]);

  const handleClear = () => {
    dispatch(setSelectedJobRole(null));
    dispatch(setSelectedSector(null));
    dispatch(setSelectedNOS(null));
    setPcName("");
    setPcCode("");
    setTotalMarksInTheory("");
    setTotalMarksInPractical("");
    setTotalMarksInViva("");
    setSelectedFile(null);
    setTotalMarks("");
  };

  const handleSectorChange = (e) => {
    const sectorId = e.target.value;
    const sector = sectors.find((c) => c._id === sectorId);
    dispatch(setSelectedSector(sector));
  };

  const handleJobRoleChange = (e) => {
    const jobRoleId = e.target.value;
    const jobRole = jobRoles.find((c) => c._id === jobRoleId);
    dispatch(setSelectedJobRole(jobRole));
  };
  const handleNOSChange = (e) => {
    const nosId = e.target.value;
    const nos = noses.find((c) => c._id === nosId);
    dispatch(setSelectedNOS(nos));
  };

  const handleEditClick = (rowData) => {
    setEditFormData({
      _id: rowData._id,
      pcName: rowData.pcName,
      pcCode: rowData.pcCode,
      totalMarks: rowData.totalMarks,
      totalMarksInTheory: rowData.totalMarksInTheory,
      totalMarksInPractical: rowData.totalMarksInPractical,
      totalMarksInViva: rowData.totalMarksInViva,
    });
    setIsEditFormVisible(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    console.log(`Changing ${name} to ${value}`);
    setEditFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    console.log("Updated editFormData:", { ...editFormData, [name]: value });
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();

    const { _id, ...updatedPC } = {
      ...editFormData,
      totalMarks: Number(editFormData.totalMarks),
      totalMarksInTheory: Number(editFormData.totalMarksInTheory),
      totalMarksInPractical: Number(editFormData.totalMarksInPractical),
      totalMarksInViva: Number(editFormData.totalMarksInViva),
    };

    console.log("Submitting Update for PC:", updatedPC);

    try {
      const resultAction = await dispatch(
        updatePC({ _id: _id.toString(), updatedPC })
      );
      if (updatePC.fulfilled.match(resultAction)) {
        setIsEditFormVisible(false);
        dispatch(fetchPCs(selectedNOS._id));
      }
    } catch (error) {
      // toast.error("An error occurred");
      Swal.fire({
        html: `
        <div class="custon-error-container">
            <div class="custom-swal-icon-wrapper">
                <i class="fas fa-exclamation-circle custom-error-icon"></i>
            </div>
            <hr class="custom-error-divider" />
            <div class="custom-error-message capitalize">An error occurred</div>
        </div>`,
        toast: false,
        position: "center",
        color: "#000",
        timer: 3000,
        timerProgressBar: true,
        backdrop: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: {
          popup: "custom-swal-popup",
          actions: "swal-center-actions",
          icon: "custom-swal-icon",
        },
      });
    }
  };

  const handleView = (rowData) => {
    setViewData(rowData);
    setIsViewFormVisible(true);
  };

  const handleDeleteClick = (rowData) => {
    setSelectedPC(rowData);
    setConfirmAction("delete");
    setIsConfirmVisible(true);
  };

  const handleCopyId = (rowData) => {
    if (rowData && rowData._id) {
      navigator.clipboard.writeText(rowData._id);
      // toast.success('PC ID copied to clipboard!');
      Swal.fire({
        html: `
        <div class="custon-error-container">
            <div class="custom-swal-icon-wrapper">
                <i class="fa fa-check-circle custom-success-icon"></i>
            </div>
            <hr class="custom-error-divider" />
            <div class="custom-error-message capitalize">PC ID copied to clipboard!</div>
        </div>`,
        toast: false,
        position: "center",
        color: "#000",
        timer: 3000,
        timerProgressBar: true,
        backdrop: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: {
          popup: "custom-swal-popup",
          actions: "swal-center-actions",
          icon: "custom-swal-icon",
        },
      });
    }
  };

  const confirmActionHandler = async () => {
    if (!selectedPC || !selectedPC._id) {
      // toast.error('Invalid PC selected');
      Swal.fire({
        html: `
        <div class="custon-error-container">
            <div class="custom-swal-icon-wrapper">
                <i class="fas fa-exclamation-circle custom-error-icon"></i>
            </div>
            <hr class="custom-error-divider" />
            <div class="custom-error-message capitalize">Invalid PC selected</div>
        </div>`,
        toast: false,
        position: "center",
        color: "#000",
        timer: 3000,
        timerProgressBar: true,
        backdrop: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: {
          popup: "custom-swal-popup",
          actions: "swal-center-actions",
          icon: "custom-swal-icon",
        },
      });
      return;
    }
    const pcId = selectedPC._id;

    if (confirmAction === "delete") {
      await dispatch(deletePC(pcId));
    }

    dispatch(fetchPCs(selectedNOS._id));
    setIsConfirmVisible(false);
    setSelectedPC(null);
  };

  const menuRefs = useRef([]);
  const actionBodyTemplate = (rowData, options) => {
    const items = [
      {
        label: "Edit",
        icon: "pi pi-pencil",
        command: () => handleEditClick(rowData),
      },
      {
        label: "Delete",
        icon: "pi pi-trash",
        command: () => handleDeleteClick(rowData),
      },
      {
        label: "View",
        icon: "pi pi-eye",
        command: () => handleView(rowData),
      },
      {
        label: "Copy PC ID",
        icon: "pi pi-copy",
        command: () => handleCopyId(rowData),
      },
    ];

    return (
      <>
        <Menu
          model={items}
          popup
          ref={(el) => (menuRefs.current[options.rowIndex] = el)}
          id={`popup_menu_${options.rowIndex}`}
        />
        <Button
          icon="pi pi-ellipsis-v"
          className="p-button-rounded p-button-secondary"
          onClick={(event) => menuRefs.current[options.rowIndex].toggle(event)}
        />
      </>
    );
  };

  const filteredPCs = selectedJobRole
    ? pcs.filter((pc) => pc.jobRole?._id === selectedJobRole._id)
    : [];
  const renderSectorShortName = (rowData) => {
    return rowData.sector?.sector_short_name?.toUpperCase();
  };

  return (
    <div
      className=" max-w-[20rem]  xs:max-w-[23rem] sm:max-w-[60rem] my-2  md:max-w-[86rem]  lg:max-w-[100%] xl:w-[100%]
        mx-auto mt-14 sm:mt-5 p-0 sm:p-2  py-8 bg-white border-2 border-white/10 backdrop-blur-[20px] items-center overflow-hidden duration-200 ease-in-out text-black rounded-lg shadow-lg flex-grow-0 "
    >
      <h2 className="text-xl font-bold mb-4 ml-1  p-2 text-center sm:text-left">
        Manage PC
      </h2>
      <div className="flex flex-col  space-y-4  pl- my-5">
        <div className="grid  grid-cols-1 md:grid-cols-3 gap-4 bg-gray-100 rounded-lg py-2 pb-6 px-2">
          <div className="flex flex-col">
            <label htmlFor="sector" className="font-semibold  p-2 ">
              Select Sector
            </label>
            <select
              id="sector"
              value={selectedSector ? selectedSector._id : ""}
              onChange={handleSectorChange}
              className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="">Select Sector</option>
              {sectors.map((sector) => (
                <option
                  key={sector._id}
                  value={sector._id}
                >{`${sector.name.toUpperCase()} (${sector.sector_short_name.toUpperCase()})`}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="jobrole" className="font-semibold  p-2">
              Select Job Role
            </label>
            <select
              id="jobrole"
              value={selectedJobRole ? selectedJobRole._id : ""}
              onChange={handleJobRoleChange}
              className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              disabled={!selectedSector}
            >
              <option value="">Select Job Role</option>
              {jobRoles.map((jobRole) => (
                <option
                  key={jobRole._id}
                  value={jobRole._id}
                >{`${jobRole.name}-V${jobRole.version}`}</option>
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
              className="p-button-primary bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-md text-sm transition-all ease-in-out duration-300 shadow-lg flex items-center space-x-2"
            />

            <Button
              label="Bulk Upload"
              icon={<MdOutlineNoteAdd />}
              onClick={() => setBulkUploadVisible(!isBulkUploadVisible)}
              className="p-button-success bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md text-sm transition-all ease-in-out duration-300 shadow-lg flex items-center space-x-2"
            />

            <Button
              label="Download Sample Excel"
              onClick={handleDownload}
              className="p-button-primary bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-all text-sm ease-in-out duration-300 shadow-lg flex items-center space-x-2"
            />

            {isBulkUploadVisible && (
              <>
                <div
                  {...getRootProps()}
                  className={`w-full md:w-2/3 lg:w-1/3 border-2 border-dashed rounded-md p-6 mt-2 transition-all ease-in-out duration-300 ${
                    isDragActive
                      ? "bg-blue-100 border-blue-500"
                      : "bg-gray-50 border-gray-300"
                  } hover:bg-gray-100 hover:border-gray-400 cursor-pointer`}
                >
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <p className="text-blue-700 font-semibold text-center">
                      Drop the files here ...
                    </p>
                  ) : (
                    <p className="text-gray-700 text-center">
                      Drag & drop a file here, or{" "}
                      <span className="text-purple-600 ">
                        click to select a file
                      </span>
                    </p>
                  )}
                  {errorMessage && (
                    <div className="text-red-600 mt-2 text-center">
                      {errorMessage}
                    </div>
                  )}
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

      {formVisible && (
        <form onSubmit={handleSubmit} className="flex flex-col  space-y-4 my-5">
          <div className=" grid grid-cols-1 md:grid-cols-3 p-2 gap-4 rounded-lg py-2 pb-6">
            <div className="flex flex-col flex-1 ">
              <label htmlFor="nos" className="font-semibold ">
                Select NOS Code
              </label>
              <select
                id="NOS"
                value={selectedNOS ? selectedNOS._id : ""}
                onChange={handleNOSChange}
                className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition mb-3"
              >
                <option value="">Select</option>
                {noses && noses.length > 0 ? (
                  noses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.nosCode}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No NOS Code Available
                  </option>
                )}
              </select>
            </div>

            <div className="flex flex-col flex-1 ">
              <label htmlFor="pcname" className="font-semibold">
                PC Name
              </label>
              <input
                type="text"
                id="pcname"
                value={pcName}
                placeholder="Enter PC Name"
                onChange={(e) => setPcName(e.target.value)}
                className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition mb-3"
                disabled={!selectedSector}
              />
            </div>
            <div className="flex flex-col flex-1">
              <label htmlFor="pccode" className="font-semibold ">
                PC Code
              </label>
              <input
                type="text"
                id="code"
                value={pcCode}
                placeholder="Enter PC Code"
                onChange={(e) => setPcCode(e.target.value)}
                className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition mb-3"
                disabled={!selectedSector}
              />
            </div>
            <div className="flex flex-col flex-1  !ml-0">
              <label htmlFor="totalmarks" className="font-semibold">
                Total Marks
              </label>
              <input
                type="number"
                id="totalmarks"
                value={totalMarks}
                placeholder="Enter Total Marks"
                onChange={(e) => setTotalMarks(e.target.value)}
                onWheel={(e) => e.target.blur()}
                className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition mb-3"
                disabled={!selectedSector}
              />
            </div>
            <div className="flex flex-col flex-1 ">
              <label htmlFor="totalmarksintheory" className="font-semibold">
                Total Marks In Theory
              </label>
              <input
                type="number"
                id="totalmarksintheory"
                value={totalMarksInTheory}
                placeholder="Enter Total Marks in Theory"
                onChange={(e) => setTotalMarksInTheory(e.target.value)}
                onWheel={(e) => e.target.blur()}
                className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition mb-3"
                disabled={!selectedSector}
              />
            </div>
            <div className="flex flex-col flex-1 ">
              <label htmlFor="totalmarksinpractical" className="font-semibold">
                Total Marks In Practical
              </label>
              <input
                type="number"
                id="totalmarksinpractical"
                value={totalMarksInPractical}
                placeholder="Enter Total Marks in Practical"
                onChange={(e) => setTotalMarksInPractical(e.target.value)}
                onWheel={(e) => e.target.blur()}
                className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition mb-3"
                disabled={!selectedSector}
              />
            </div>
            <div className="flex flex-col flex-1  !ml-0">
              <label htmlFor="totalmarksinviva" className="font-semibold ">
                Total Marks In Viva
              </label>
              <input
                type="number"
                id="totalmarksinviva"
                value={totalMarksInViva}
                placeholder="Enter Total Marks in Viva"
                onChange={(e) => setTotalMarksInViva(e.target.value)}
                onWheel={(e) => e.target.blur()}
                className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition mb-3"
                disabled={!selectedSector}
              />
            </div>
          </div>
          {!selectedSector && (
            <div className="text-red-500 text-md mt-2">
              Please select a Sector, Job Role, NOS Code & NOS Element before
              entering PC information.
            </div>
          )}
          <div className="flex space-x-4">
            <button
              type="submit"
              className="w-32 py-2 text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 text-center me-2 mb-2 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 flex items-center justify-center"
            >
              {" "}
              <span className="pr-2">
                <IoMdAdd className="w-5 h-5" />
              </span>{" "}
              <span>Add</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="w-32 py-2 text-white bg-gray-600 hover:bg-gray-700 focus:ring-blue-300 shadow-lg shadow-gray-500/50 dark:shadow-lg dark:shadow-gray-800/80 font-medium rounded-lg text-sm px-5 text-center me-2 mb-2 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 flex items-center justify-center"
            >
              <span className="pr-2">
                <VscClearAll className="w-5 h-5" />
              </span>
              <span>Clear</span>
            </button>

            <button
              type="button"
              onClick={() => setFormVisible(false)}
              className="w-32 py-2 text-white bg-red-600 hover:bg-red-700 focus:ring-red-300 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-sm px-5 text-center me-2 mb-2 transition-all duration-200 ease-in-out transform hover:-translate-y-1 hover:scale-110 flex items-center justify-center"
            >
              <span className="pr-2">
                <IoMdClose className="w-5 h-5" />
              </span>
              <span>Close</span>
            </button>
          </div>
        </form>
      )}

      {viewData && (
        <Dialog
          header="PC Details"
          visible={isViewFormVisible}
          style={{ width: "50vw" }}
          onHide={() => setIsViewFormVisible(false)}
        >
          <div>
            <p>
              <strong>PC ID:</strong> {viewData._id}
            </p>
            <p>
              <strong>PC Name:</strong> {viewData.pcName}
            </p>
            <p>
              <strong>PC Code:</strong> {viewData.pcCode}
            </p>
            <p>
              <strong>Status:</strong> {viewData.status}
            </p>
            <p>
              <strong>Sector:</strong> {viewData.sector?.name}
            </p>
            <p>
              <strong>Job Role:</strong> {viewData.jobRole?.name}
            </p>
            <p>
              <strong>Total Marks in Theory:</strong>{" "}
              {viewData.totalMarksInTheory}
            </p>
            <p>
              <strong>Total Marks in Practical:</strong>{" "}
              {viewData.totalMarksInPractical}
            </p>
            <p>
              <strong>Total Marks in Viva:</strong> {viewData.totalMarksInViva}
            </p>
            <p>
              <strong>Total Marks:</strong> {viewData.totalMarks}
            </p>
          </div>
        </Dialog>
      )}

      <Dialog
        header="Edit PC"
        visible={isEditFormVisible}
        style={{ width: "50vw" }}
        onHide={() => setIsEditFormVisible(false)}
      >
        <form onSubmit={handleEditFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <div className="flex flex-col flex-1">
              <label
                htmlFor="pcName"
                className="mb-1 font-semibold text-sm md:text-lg"
              >
                PC Name
              </label>
              <input
                type="text"
                id="pcName"
                name="pcName"
                value={editFormData.pcName}
                onChange={handleEditFormChange}
                className="px-2 py-2 md:px-3 md:py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div className="flex flex-col flex-1">
              <label
                htmlFor="pcCode"
                className="mb-1 font-semibold text-sm md:text-lg"
              >
                PC Code
              </label>
              <input
                type="text"
                id="pcCode"
                name="pcCode"
                value={editFormData.pcCode}
                onChange={handleEditFormChange}
                className="px-2 py-2 md:px-3 md:py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div className="flex flex-col flex-1">
              <label
                htmlFor="totalMarks"
                className="mb-1 font-semibold text-sm md:text-lg"
              >
                Total Marks
              </label>
              <input
                type="number"
                id="totalMarks"
                name="totalMarks"
                value={editFormData.totalMarks}
                onChange={handleEditFormChange}
                onWheel={(e) => e.target.blur()}
                className="px-2 py-2 md:px-3 md:py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div className="flex flex-col flex-1">
              <label
                htmlFor="totalMarksInTheory"
                className="mb-1 font-semibold text-sm md:text-lg"
              >
                Total Marks in Theory
              </label>
              <input
                type="number"
                id="totalMarksInTheory"
                name="totalMarksInTheory"
                value={editFormData.totalMarksInTheory}
                onChange={handleEditFormChange}
                onWheel={(e) => e.target.blur()}
                className="px-2 py-2 md:px-3 md:py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div className="flex flex-col flex-1">
              <label
                htmlFor="totalMarksInPractical"
                className="mb-1 font-semibold text-sm md:text-lg"
              >
                Total Marks in Practical
              </label>
              <input
                type="number"
                id="totalMarksInPractical"
                name="totalMarksInPractical"
                value={editFormData.totalMarksInPractical}
                onChange={handleEditFormChange}
                onWheel={(e) => e.target.blur()}
                className="px-2 py-2 md:px-3 md:py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
            <div className="flex flex-col flex-1">
              <label
                htmlFor="totalMarksInViva"
                className="mb-1 font-semibold text-sm md:text-lg"
              >
                Total Marks in Viva
              </label>
              <input
                type="number"
                id="totalMarksInViva"
                name="totalMarksInViva"
                value={editFormData.totalMarksInViva}
                onChange={handleEditFormChange}
                onWheel={(e) => e.target.blur()}
                className="px-2 py-2 md:px-3 md:py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="w-32 py-2 text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-md text-sm px-5 text-center me-2 mb-2 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 flex items-center justify-center"
            >
              {" "}
              <span className="pr-2">
                <FaEdit className="w-4 h-4" />
              </span>
              Update
            </button>
            <button
              type="button"
              onClick={() => setIsEditFormVisible(false)}
              className="w-32 py-2 text-white bg-red-600 hover:bg-red-700 focus:ring-red-300 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-md text-sm px-5 text-center me-2 mb-2 transition-all duration-200 ease-in-out transform hover:-translate-y-1 hover:scale-110 flex items-center justify-center"
            >
              <span className="pr-2">
                <IoMdClose className="w-5 h-5" />
              </span>
              <span>Close</span>
            </button>
          </div>
        </form>
      </Dialog>

      <Dialog
        header="Confirm Delete"
        visible={isConfirmVisible}
        style={{ width: "30vw" }}
        onHide={() => setIsConfirmVisible(false)}
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle px-5"
            style={{ fontSize: "1rem", color: "orange" }}
          ></i>
          <span>Are you sure you want to delete this PC?</span>
        </div>
        <div className="flex justify-end space-x-4 mt-4">
          <Button
            label="Yes"
            icon="pi pi-check"
            className="p-button-danger"
            onClick={confirmActionHandler}
          />
          <Button
            label="No"
            icon="pi pi-times"
            className="p-button-secondary"
            onClick={() => setIsConfirmVisible(false)}
          />
        </div>
      </Dialog>

      <div className="mt-8 overflow-x-auto sm:w-full md:w-[100%] xl:w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 px-2">
          <h3 className="text-xl font-bold">PC List</h3>

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
        <div className="max-w-[23rem] p-1 md:max-w-[50rem] sm:max-w-[30rem] lg:max-w-[76rem] xl:max-w-[86rem]">
          <DataTable
            value={filteredPCs}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 20, 50]}
            responsiveLayout="scroll"
            scrollable={true}
            globalFilter={globalFilter}
            className="min-w-full bg-white border border-gray-200"
          >
            <Column
              body={actionBodyTemplate}
              header="Actions"
              className="py-2 px-4 border-b"
            />
            <Column field="_id" header="Id" className="py-2 px-4 border-b " />
            <Column
              field="status"
              header="Status"
              className="py-2 px-4 border-b"
            />
            <Column
              field="pcName"
              header="PC Name"
              className="py-2 px-4 border-b"
            />
            <Column
              field="pcCode"
              header="PC Code"
              className="py-2 px-4 border-b"
            />
            <Column
              field="sector.sector_short_name"
              header="Sector"
              body={renderSectorShortName}
              className="py-2 px-4 border-b"
            />
            <Column
              field="jobRole.name"
              header="Job Role/QP"
              className="py-2 px-4 border-b"
            />
            <Column
              field="nos.nosCode"
              header="NOS Code"
              className="py-2 px-4 border-b"
            />
            <Column
              field="totalMarksInTheory"
              header="Theory Marks"
              className="py-2 px-4 border-b"
            />
            <Column
              field="totalMarksInPractical"
              header="Practical Marks"
              className="py-2 px-4 border-b"
            />
            <Column
              field="totalMarksInViva"
              header="Viva Marks"
              className="py-2 px-4 border-b"
            />
            <Column
              field="totalMarks"
              header="Total Marks"
              className="py-2 px-4 border-b"
            />
          </DataTable>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center font-semibold p-4 gap-80">
          <span> Total Records: {filteredPCs.length}</span>
        </div>
      </div>
    </div>
  );
};

export default ManagePCDetails;
