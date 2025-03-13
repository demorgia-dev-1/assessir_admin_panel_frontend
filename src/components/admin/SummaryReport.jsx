import { useState } from "react";
import Swal from "sweetalert2";
import { BASE_URL } from "../constant";

const SummaryReport = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleSummary = async () => {
    const url = new URL(`${BASE_URL}company/request-summary-report`);
    url.searchParams.append("from", fromDate);
    url.searchParams.append("to", toDate);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });

    const data = await response.json();
    if (response.status === 200) {
      // toast.success(data.message);
      Swal.fire({
        html: `
            <div class="custom-error-container">
                <div class="custom-swal-icon-container">
                    <i class="fa fa-check-circle custom-error-icon"></i>
                </div>
                <hr class="custom-error-divider" />
                <div class="custom-error-message">${data.message}</div>
            </div>`,
        toast: false,
        position: "center",
        timer: 3000,
        timerProgressBar: true,
        backdrop: true,
        color: "#000",
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: {
          popup: "custom-swal-popup",
          actions: "swal-center-actions",
          icon: "custom-swal-icon",
        },
      });
    }
    console.log(data);
  };
  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 py-36 p-4 mx-2">
      <div className="bg-white shadow-md rounded-lg p-14 md:w-1/2 w-full h-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-10 text-center">
          Summary Report
        </h2>
        <div className="mb-4">
          <label
            htmlFor="from"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            From
          </label>
          <input
            type="date"
            id="from"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="to"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            To
          </label>
          <input
            type="date"
            id="to"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <button
          className="w-full mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-150 ease-in-out"
          onClick={handleSummary}
        >
          Request Summary Report
        </button>
      </div>
    </div>
  );
};

export default SummaryReport;
