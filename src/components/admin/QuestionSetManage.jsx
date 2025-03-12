import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Menu } from "primereact/menu";
import { useEffect, useRef, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { VscClearAll } from "react-icons/vsc";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { fetchJobRolesBySector } from "../features/jobRoleSlice";
import {
  createQuestionSet,
  deleteQuestionSet,
  fetchQuestionSetsBySectorJobRole,
  lockQuestionSet,
  setSelectedJobRole,
  setSelectedSector,
  unlockQuestionSet,
  updateQuestionSet,
} from "../features/questionSetSlice";
import { fetchSectors } from "../features/subAdminSlice";

const ManageQuestionSet = () => {
  const [paperSetType, setPaperSetType] = useState("");
  const [globalFilter, setGlobalFilter] = useState(null);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isEditFormVisible, setIsEditFormVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isViewFormVisible, setIsViewFormVisible] = useState(false);
  const [selectedQuestionSet, setSelectedQuestionSet] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [editFormData, setEditFormData] = useState({
    _id: "",
    name: "",
    type: "",
  });

  const dispatch = useDispatch();
  const { sectors, jobRoles, selectedSector, selectedJobRole, questionSets } =
    useSelector((state) => state.questionSet);

  useEffect(() => {
    dispatch(fetchSectors());
    if (selectedSector) {
      dispatch(fetchJobRolesBySector(selectedSector._id));
      dispatch(fetchQuestionSetsBySectorJobRole(selectedSector._id));
    }
  }, [dispatch, selectedSector]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (paperSetType && selectedSector && selectedJobRole) {
      const paperSet = {
        type: paperSetType,
        sector: selectedSector._id,
        jobRole: selectedJobRole._id,
      };

      await dispatch(createQuestionSet(paperSet)).unwrap();
      // toast.success('Question Set created successfully!');
      Swal.fire({
        html: `<div class="custon-error-container">
                                          <div class="custom-swal-icon-wrapper">
                                          <i class="fa fa-check-circle custom-success-icon"></i>
                                          </div>
                                          <hr class="custom-error-divider" />
                                          <div class="custom-error-message capitalize">Question Set created successfully!</div>
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
      dispatch(fetchQuestionSetsBySectorJobRole(selectedSector._id));
    }
  };
  const handleClear = () => {
    setPaperSetType("");
    dispatch(setSelectedSector(null));
    dispatch(setSelectedJobRole(null));
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

  const handleEditClick = (rowData) => {
    setEditFormData({
      _id: rowData._id,
      name: rowData.name,
      type: rowData.type,
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

    const { _id, ...updatedQuestionSet } = {
      ...editFormData,
    };

    console.log("Submitting Update for questionset:", updatedQuestionSet);

    const resultAction = await dispatch(
      updateQuestionSet({ _id, updatedQuestionSet })
    );
    if (updateQuestionSet.fulfilled.match(resultAction)) {
      setIsEditFormVisible(false);
      dispatch(fetchQuestionSetsBySectorJobRole(selectedSector._id));
    }
  };

  const handleView = (rowData) => {
    setViewData(rowData);
    setIsViewFormVisible(true);
  };

  const handleDeleteClick = (rowData) => {
    setSelectedQuestionSet(rowData);
    setConfirmAction("delete");
    setIsConfirmVisible(true);
  };

  const handleCopyId = (rowData) => {
    if (rowData && rowData._id) {
      navigator.clipboard.writeText(rowData._id);
      // toast.success('Question Set Id copied to clipboard!');
      Swal.fire({
        html: `<div class="custon-error-container">
                                          <div class="custom-swal-icon-wrapper">
                                          <i class="fa fa-check-circle custom-success-icon"></i>
                                          </div>
                                          <hr class="custom-error-divider" />
                                          <div class="custom-error-message capitalize">Question Set Id copied to clipboard!</div>
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

  const handleLockClick = (rowData) => {
    setSelectedQuestionSet(rowData);
    setConfirmAction("lock");
    setIsConfirmVisible(true);
  };

  const handleUnlockClick = (rowData) => {
    setSelectedQuestionSet(rowData);
    setConfirmAction("unlock");
    setIsConfirmVisible(true);
  };

  const confirmActionHandler = async () => {
    if (!selectedQuestionSet || !selectedQuestionSet._id) {
      // toast.error('Invalid question set selected');
      Swal.fire({
        html: `<div class="custon-error-container">
                                          <div class="custom-swal-icon-wrapper">
                                          <i class="fas fa-exclamation-circle custom-error-icon"></i>
                                          </div>
                                          <hr class="custom-error-divider" />
                                          <div class="custom-error-message capitalize">Invalid question set selected</div>
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

    setIsConfirmVisible(false);
    const questionSetId = selectedQuestionSet._id;

    if (confirmAction === "delete") {
      await dispatch(deleteQuestionSet(questionSetId));
    } else if (confirmAction === "lock") {
      await dispatch(lockQuestionSet(questionSetId));
    } else if (confirmAction === "unlock") {
      await dispatch(unlockQuestionSet(questionSetId));
    }

    dispatch(fetchQuestionSetsBySectorJobRole(selectedSector._id));

    setSelectedQuestionSet(null);
  };

  const type = sessionStorage.getItem("type");
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
        disabled: type === "sub-admin" && rowData.isLocked,
      },
      {
        label: "View",
        icon: "pi pi-eye",
        command: () => handleView(rowData),
      },
      {
        label: "Copy Question Set Id",
        icon: "pi pi-copy",
        command: () => handleCopyId(rowData),
      },
      {
        label: rowData.isLocked ? "Locked" : "Lock Question Set",
        icon: "pi pi-lock",
        command: () => handleLockClick(rowData),
        disabled: rowData.isLocked,
      },
      {
        label: rowData.isLocked ? "Unlock Question Set" : "Unlocked",
        icon: "pi pi-unlock",
        command: () => handleUnlockClick(rowData),
        disabled: type === "sub-admin",
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

  const filteredQuestionSet = selectedJobRole
    ? questionSets.filter(
        (questionSet) => questionSet.jobRole?._id === selectedJobRole._id
      )
    : [];

  const renderSectorShortName = (rowData) => {
    return rowData.sector?.sector_short_name?.toUpperCase();
  };
  return (
    <div
      className="max-w-[20rem]  xs:max-w-[23rem] sm:max-w-[60rem] my-2  md:max-w-[86rem]  lg:max-w-[100%] xl:w-[100%]
        mx-auto mt-14 sm:mt-5 p-0 sm:p-2 px-2  py-8 bg-white border-2 border-white/10 backdrop-blur-[20px] items-center overflow-hidden duration-200 ease-in-out text-black rounded-lg shadow-lg flex-grow-0 "
    >
      <div className="flex gap-20 items-center">
        <h2 className="text-xl font-bold mb-4 ml-1">Manage Question Set</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col flex-1">
            <label htmlFor="sector" className="font-semibold p-2 ">
              Select Sector
            </label>
            <select
              id="sector"
              value={selectedSector ? selectedSector._id : ""}
              onChange={handleSectorChange}
              className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="">Select</option>
              {sectors && sectors.length > 0 ? (
                sectors.map((c) => (
                  <option
                    key={c._id}
                    value={c._id}
                  >{`${c.name?.toUpperCase()} (${c.sector_short_name?.toUpperCase()})`}</option>
                ))
              ) : (
                <option value="" disabled>
                  No sectors available
                </option>
              )}
            </select>
          </div>
          <div className="flex flex-col flex-1">
            <label htmlFor="jobrole" className="font-semibold p-2">
              Select Job Role
            </label>
            <select
              id="jobrole"
              value={selectedJobRole ? selectedJobRole._id : ""}
              onChange={handleJobRoleChange}
              className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="">Select </option>
              {jobRoles && jobRoles.length > 0 ? (
                jobRoles.map((c) => (
                  <option
                    key={c._id}
                    value={c._id}
                  >{`${c.name}-V${c.version}`}</option>
                ))
              ) : (
                <option value="" disabled>
                  No Job Role available
                </option>
              )}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="paperset" className="font-semibold p-2">
              Question Set Type
            </label>
            <select
              id="paperset"
              value={paperSetType}
              onChange={(e) => setPaperSetType(e.target.value)}
              className="px-3 py-2 text-sm border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="">Select</option>
              <option value="theory">Theory</option>
              <option value="practical">Practical</option>
              <option value="viva">Viva</option>
            </select>
          </div>
        </div>
        {paperSetType && (
          <div className="flex space-x-4">
            <button
              type="submit"
              className="w-32 py-2 text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br shadow-md shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 text-center transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 flex items-center justify-center"
            >
              <span className="pr-2">
                <IoMdAdd className="w-4 h-5" />
              </span>
              <span>Add</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="w-32 py-2 text-white bg-gray-600 hover:bg-gray-700 focus:ring-blue-300 shadow-md shadow-gray-500/50 dark:focus:ring-gray-800 font-medium rounded-lg text-sm px-5 text-center transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 flex items-center justify-center"
            >
              <span className="pr-2">
                <VscClearAll className="w-4 h-5" />
              </span>
              <span>Clear</span>
            </button>
          </div>
        )}
      </form>
      {viewData && (
        <Dialog
          header="Question Set Details"
          visible={isViewFormVisible}
          style={{ width: "50vw" }}
          onHide={() => setIsViewFormVisible(false)}
        >
          <div>
            <p>
              <strong>Question Set ID:</strong> {viewData._id}
            </p>
            <p>
              <strong>Question Set Name:</strong> {viewData.name}
            </p>
            <p>
              <strong>Question Set Type:</strong> {viewData.type}
            </p>
            <p>
              <strong>Sector:</strong> {viewData.sector.name}
            </p>
            <p>
              <strong>Job Role:</strong> {viewData.jobRole.name}
            </p>
          </div>
        </Dialog>
      )}

      <Dialog
        header="Edit Question Set"
        visible={isEditFormVisible}
        style={{ width: "50vw" }}
        onHide={() => setIsEditFormVisible(false)}
      >
        <form onSubmit={handleEditFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label htmlFor="name" className="mb-1 font-semibold text-lg ml-1">
                Question Set Name
              </label>
              <input
                type="text"
                id="name"
                value={editFormData.name}
                placeholder="Enter Question Set Name"
                onChange={handleEditFormChange}
                name="name"
                className="px-3 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-transparent border-2"
                required
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="type" className="mb-1 font-semibold text-lg ml-1">
                Question Set Type
              </label>
              <select
                id="type"
                value={editFormData.type}
                onChange={handleEditFormChange}
                name="type"
                className="px-3 py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                <option value="">Select</option>
                <option value="theory">Theory</option>
                <option value="practical">Practical</option>
                <option value="viva">Viva</option>
              </select>
            </div>
          </div>
          <div className="flex space-x-4 mt-4">
            <button
              type="submit"
              className="w-32 py-3 text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-400/50 dark:shadow-xl dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 text-center me-2 mb-2 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
            >
              Update
            </button>

            <button
              type="button"
              onClick={() => setIsEditFormVisible(false)}
              className="w-32 py-3 text-white bg-red-600 hover:bg-red-700 focus:ring-red-300 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-sm px-5 text-center me-2 mb-2 transition-all duration-200 ease-in-out transform hover:-translate-y-1 hover:scale-110"
            >
              Close
            </button>
          </div>
        </form>
      </Dialog>

      <Dialog
        header={confirmAction === "lock" ? "Confirm Lock" : "Confirm Delete"}
        visible={isConfirmVisible}
        style={{ width: "30vw" }}
        onHide={() => setIsConfirmVisible(false)}
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle px-5"
            style={{ fontSize: "1rem", color: "orange" }}
          ></i>
          <span>
            Are you sure you want to {confirmAction} this question set?
          </span>
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 mt-4 gap-4">
          <h3 className="text-xl font-bold">Question Set List</h3>

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
        <div className="max-w-[100%] p-1  md:w-full sm:max-w-full lg:max-w-[100%]">
          <DataTable
            value={filteredQuestionSet}
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
            <Column
              field="name"
              header="Question Set"
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
              header="Job Role"
              className="py-2 px-4 border-b"
            />
            <Column field="type" header="Type" className="py-2 px-4 border-b" />
          </DataTable>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center font-semibold p-4 gap-80">
          <span> Total Records: {filteredQuestionSet.length}</span>
        </div>
      </div>
    </div>
  );
};

export default ManageQuestionSet;
