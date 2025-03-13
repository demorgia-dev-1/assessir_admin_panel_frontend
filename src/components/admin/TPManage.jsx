import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Menu } from "primereact/menu";
import { useEffect, useRef, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { VscClearAll } from "react-icons/vsc";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { createTp, deleteTp, fetchTps, updateTp } from "../features/tpSlice";

const ManageTp = () => {
  const [tpId, setTpId] = useState("");
  const [tpName, setTpName] = useState("");
  const [tpEmail, setTpEmail] = useState("");
  const [tpContact, setTpContact] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const [tpAddress, setTpAddress] = useState("");
  const [isEditFormVisible, setIsEditFormVisible] = useState(false);
  const [isViewFormVisible, setIsViewFormVisible] = useState(false);
  const [selectedTp, setSelectedTp] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [editFormData, setEditFormData] = useState({
    _id: "",
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const dispatch = useDispatch();

  const { tps } = useSelector((state) => state.tp);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (tpName && tpContact && tpAddress) {
      const newTp = {
        tpId: tpId,
        name: tpName,
        email: tpEmail,
        phone: tpContact,
        address: tpAddress,
      };
      dispatch(createTp(newTp))
        .unwrap()
        .then(() => {
          // toast.success('TP added successfully!');
          Swal.fire({
            html: `
            <div class="custon-error-container">
                <div class="custom-swal-icon-wrapper">
                    <i class="fa fa-check-circle custom-success-icon"></i>
                </div>
                <hr class="custom-error-divider" />
                <div class="custom-error-message capitalize">TP added successfully!</div>
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
          handleClear();
        })
        .catch((error) => {
          const errorMessage =
            error.response?.data?.message ||
            "Failed to add TP due to an unknown error.";
          // toast.error(`Failed to add TP: ${errorMessage}`);
          Swal.fire({
            html: `
            <div class="custon-error-container">
                <div class="custom-swal-icon-wrapper">
                    <i class="fas fa-exclamation-circle custom-error-icon"></i>
                </div>
                <hr class="custom-error-divider" />
                <div class="custom-error-message capitalize">${`Failed to add TP: ${errorMessage}`}</div>
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
        });
    } else {
      // toast.error("All fields are required");
      Swal.fire({
        html: `
        <div class="custon-error-container">
            <div class="custom-swal-icon-wrapper">
                <i class="fas fa-exclamation-circle custom-error-icon"></i>
            </div>
            <hr class="custom-error-divider" />
            <div class="custom-error-message capitalize">All fields are required</div>
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

  const handleClear = () => {
    setTpName("");
    setTpEmail("");
    setTpContact("");
    setTpAddress("");
  };

  useEffect(() => {
    dispatch(fetchTps());
  }, [dispatch]);

  const handleEditClick = (rowData) => {
    setEditFormData({
      _id: rowData._id,
      name: rowData.name,
      phone: rowData.phone,
      email: rowData.email,
      address: rowData.address,
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

    const { _id, ...updatedTp } = {
      ...editFormData,
    };

    console.log("Submitting Update for NOS:", updatedTp);
    const resultAction = await dispatch(updateTp({ _id, updatedTp }));
    if (updateTp.fulfilled.match(resultAction)) {
      setIsEditFormVisible(false);
      dispatch(fetchTps());
    }
  };

  const handleView = (rowData) => {
    setViewData(rowData);
    setIsViewFormVisible(true);
  };

  const handleDeleteClick = (rowData) => {
    setSelectedTp(rowData);
    setConfirmAction("delete");
    setIsConfirmVisible(true);
  };

  const handleCopyId = (rowData) => {
    if (rowData && rowData._id) {
      navigator.clipboard.writeText(rowData._id);
      // toast.success('TP ID copied to clipboard!');
      Swal.fire({
        html: `
        <div class="custon-error-container">
            <div class="custom-swal-icon-wrapper">
                <i class="fa fa-check-circle custom-success-icon"></i>
            </div>
            <hr class="custom-error-divider" />
            <div class="custom-error-message capitalize">TP ID copied to clipboard!</div>
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
    if (!selectedTp || !selectedTp._id) {
      // toast.error('Invalid tp selected');
      Swal.fire({
        html: `
        <div class="custon-error-container">
            <div class="custom-swal-icon-wrapper">
                <i class="fas fa-exclamation-circle custom-error-icon"></i>
            </div>
            <hr class="custom-error-divider" />
            <div class="custom-error-message capitalize">Invalid tp selected</div>
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
    const tpId = selectedTp._id;

    if (confirmAction === "delete") {
      await dispatch(deleteTp(tpId));
    }

    dispatch(fetchTps());
    setIsConfirmVisible(false);
    setSelectedTp(null);
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

  return (
    <div
      className="max-w-[20rem]  xs:max-w-[23rem] sm:max-w-[60rem] my-2  md:max-w-[86rem]  lg:max-w-[100%] xl:w-[100%]
        mx-auto mt-14 sm:mt-5 p-0 sm:p-2  py-8 bg-white border-2 border-white/10 backdrop-blur-[20px] items-center overflow-hidden duration-200 ease-in-out text-black rounded-lg shadow-lg flex-grow-0 "
    >
      <h2 className="text-xl font-bold mb-4 ml-1  p-2 text-center sm:text-left">
        Manage TP
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 my-5">
        <div className="grid grid-cols-1 md:grid-cols-3 p-2 gap-4 rounded-lg py-2 pb-6">
          <div className="flex flex-col">
            <label htmlFor="tpId" className="font-semibold">
              Training Partner Id
            </label>
            <input
              type="text"
              id="tpId"
              value={tpId}
              placeholder="Enter TP Id"
              onChange={(e) => setTpId(e.target.value)}
              className="px-1 sm:px-2 py-1 sm:py-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition md:text-md sm:text-sm lg:text-md"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="tpName" className="font-semibold">
              Training Partner Name
            </label>
            <input
              type="text"
              id="tpName"
              value={tpName}
              placeholder="Enter TP Name"
              onChange={(e) => setTpName(e.target.value)}
              className="px-1 sm:px-2 py-1 sm:py-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition md:text-md sm:text-sm lg:text-md"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="tpcontact" className="font-semibold">
              Training Partner Contact
            </label>
            <input
              type="text"
              id="tpcontact"
              value={tpContact}
              placeholder="Enter TP Contact"
              onChange={(e) => setTpContact(e.target.value)}
              className="px-1 sm:px-2 py-1 sm:py-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition md:text-md sm:text-sm lg:text-md"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="tpemail" className="font-semibold">
              Training Partner Email
            </label>
            <input
              type="email"
              id="tpemail"
              value={tpEmail}
              placeholder="Enter TP Email"
              onChange={(e) => setTpEmail(e.target.value)}
              className="px-1 sm:px-2 py-1 sm:py-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition md:text-md sm:text-sm lg:text-md"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="tpaddress" className="font-semibold">
              Training Partner Address
            </label>
            <input
              type="text"
              id="tpaddress"
              value={tpAddress}
              placeholder="Enter TP Address"
              onChange={(e) => setTpAddress(e.target.value)}
              className="px-1 sm:px-2 py-1 sm:py-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition md:text-md sm:text-sm lg:text-md"
            />
          </div>
        </div>

        <div className="flex space-x-4 px-4">
          <button
            type="submit"
            className="w-32 py-2 text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-md text-sm px-5 text-center me-2 mb-2 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 flex items-center justify-center"
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
            className="w-32 py-2 text-white bg-gray-600 hover:bg-gray-700 focus:ring-blue-300 shadow-lg shadow-gray-500/50 dark:shadow-lg dark:shadow-gray-800/80 font-medium rounded-md text-sm px-5 text-center me-2 mb-2 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 flex items-center justify-center"
          >
            <span className="pr-2">
              <VscClearAll className="w-5 h-5" />
            </span>
            <span>Clear</span>
          </button>
        </div>
      </form>

      {viewData && (
        <Dialog
          header="TC Details"
          visible={isViewFormVisible}
          style={{ width: "50vw" }}
          onHide={() => setIsViewFormVisible(false)}
        >
          <div>
            <p>
              <strong>TC ID:</strong> {viewData.tcId}
            </p>
            <p>
              <strong> Name:</strong> {viewData.name}
            </p>
            <p>
              <strong>Phone:</strong> {viewData.phone}
            </p>
            <p>
              <strong>Email:</strong> {viewData.email}
            </p>
            <p>
              <strong>Address:</strong> {viewData.address}
            </p>
            <p>
              <strong>TP:</strong> {viewData.tp.name}
            </p>
          </div>
        </Dialog>
      )}

      <Dialog
        header="Edit Training Partner"
        visible={isEditFormVisible}
        style={{ width: "50vw" }}
        onHide={() => setIsEditFormVisible(false)}
      >
        <form onSubmit={handleEditFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <div className="flex flex-col flex-1">
              <label
                htmlFor="name"
                className="mb-1 font-semibold text-sm md:text-lg"
              >
                Training Partner Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={editFormData.name}
                onChange={handleEditFormChange}
                className="px-2 py-2 md:px-3 md:py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div className="flex flex-col flex-1">
              <label
                htmlFor="phone"
                className="mb-1 font-semibold text-sm md:text-lg"
              >
                Training Partner Phone
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={editFormData.phone}
                onChange={handleEditFormChange}
                className="px-2 py-2 md:px-3 md:py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
            <div className="flex flex-col flex-1">
              <label
                htmlFor="email"
                className="mb-1 font-semibold text-sm md:text-lg"
              >
                Training Partner Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={editFormData.email}
                onChange={handleEditFormChange}
                className="px-2 py-2 md:px-3 md:py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
            <div className="flex flex-col flex-1">
              <label
                htmlFor="address"
                className="mb-1 font-semibold text-sm md:text-lg"
              >
                Training Partner Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={editFormData.address}
                onChange={handleEditFormChange}
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
          <span>Are you sure you want to delete this TP?</span>
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
        <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="text-xl font-bold">TP List</h3>

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
        <div className=" p-1 md:max-w-full lg:max-w-[100%] max-w-[20rem]  xs:max-w-[23rem] sm:max-w-[50rem]">
          <DataTable
            value={tps}
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
              field="tpId"
              header="TP Id"
              className="py-2 px-4 border-b "
            />

            <Column
              field="name"
              header="TP Name"
              className="py-2 px-4 border-b"
            />
            <Column
              field="email"
              header="TP Email"
              className="py-2 px-4 border-b"
            />
            <Column
              field="phone"
              header="TP Phone"
              className="py-2 px-4 border-b"
            />
            <Column
              field="address"
              header="TP Address"
              className="py-2 px-4 border-b"
            />
          </DataTable>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center font-semibold p-4 gap-80">
          <span> Total Records: {tps.length}</span>
        </div>
      </div>
    </div>
  );
};

export default ManageTp;
