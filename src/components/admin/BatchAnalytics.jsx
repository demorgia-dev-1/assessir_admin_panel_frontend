import React, { useEffect, useState } from "react";
import { MdContentCopy } from "react-icons/md";
import { useLocation, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import BarChart from "../Charts/BarCharts";
import { BASE_URL } from "../constant";

function BatchAnalytics() {
  const [matrics, setMatrics] = React.useState();
  const params = useParams();
  const location = useLocation();
  const prepareMatrics = (report) => {
    const matrics = {
      batchNo: report.batchNo,
      overAllScore: 0,
    };
    const nosWiseAttempts = {};
    const nosWisePassFailCandidates = {};
    const overallPassFailAbsentPresentCandidates = {
      passCandidates: 0,
      failCandidates: 0,
      absentCandidates: 0,
      presentCandidates: 0,
    };
    let score = 0;
    report.nosWiseReport.forEach((r) => {
      let currStudentScore = 0;
      for (const [nos, value] of Object.entries(r.report)) {
        score += value.currMarks;
        currStudentScore += value.currMarks;
        if (nosWiseAttempts[nos]) {
          nosWiseAttempts[nos]["totalAttempts"] += value.totalAttempts;
          nosWiseAttempts[nos]["correctAttempts"] += value.correctAttempts;
          nosWiseAttempts[nos]["incorrectAttempts"] += value.incorrectAttempts;
          nosWiseAttempts[nos]["currMarks"] += value.currMarks;
        } else {
          nosWiseAttempts[nos] = {
            totalAttempts: value.totalAttempts,
            correctAttempts: value.correctAttempts,
            incorrectAttempts: value.incorrectAttempts,
            currMarks: value.currMarks,
          };
        }
        if (nosWisePassFailCandidates[nos]) {
          if (
            (value.currMarks / value.maxMarks) * 100 >=
            value.passingPercentage
          ) {
            nosWisePassFailCandidates[nos]["passCandidates"] += 1;
          } else {
            nosWisePassFailCandidates[nos]["failCandidates"] += 1;
          }
        } else {
          nosWisePassFailCandidates[nos] = {
            passCandidates: 0,
            failCandidates: 0,
          };
          if (
            (value.currMarks / value.maxMarks) * 100 >=
            value.passingPercentage
          ) {
            nosWisePassFailCandidates[nos]["passCandidates"] += 1;
          } else {
            nosWisePassFailCandidates[nos]["failCandidates"] += 1;
          }
        }
      }

      if (
        (currStudentScore / report.batchTotalMarks) * 100 >=
          report.batchPassingPercentage &&
        r.isPresent
      ) {
        overallPassFailAbsentPresentCandidates["passCandidates"] += 1;
      } else if (r.isPresent) {
        overallPassFailAbsentPresentCandidates["failCandidates"] += 1;
      }
      if (r.isPresent) {
        overallPassFailAbsentPresentCandidates["presentCandidates"] += 1;
      } else {
        overallPassFailAbsentPresentCandidates["absentCandidates"] += 1;
      }
      matrics.overAllScore = score;
    });

    matrics.nosWiseAttempts = nosWiseAttempts;
    matrics.nosWisePassFailCandidates = nosWisePassFailCandidates;
    matrics.overallPassFailAbsentPresentCandidates =
      overallPassFailAbsentPresentCandidates;
    matrics.overallPassFailAbsentPresentCandidates.totalEnrolledCandidate =
      matrics.overallPassFailAbsentPresentCandidates.presentCandidates +
      matrics.overallPassFailAbsentPresentCandidates.absentCandidates;
    return matrics;
  };
  const [overallBatchPerformanceData, setOverallBatchPerformanceData] =
    useState({
      labels: ["loading..."],
      datasets: [
        {
          label: "-------",
          data: [0, 0, 0],
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    });
  const [overallBatchPerformanceOptions, setOverallBatchPerformanceOptions] =
    useState({
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Overall Batch Score",
        },
      },
    });
  const [noswiseBatchPerformanceData, setNoswiseBatchPerformanceData] =
    useState({
      labels: ["loading..."],
      datasets: [
        {
          label: "-------",
          data: [0, 0, 0],
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    });
  const [noswiseBatchPerformanceOptions, setNoswiseBatchPerformanceOptions] =
    useState({
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "NOS WISE BATCH PERFORMANCE",
        },
      },
    });
  const [noswisePassFailData, setNoswisePassFailData] = useState({
    labels: ["loading..."],
    datasets: [
      {
        label: "-------",
        data: [0, 0, 0],
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  });
  const [noswisePassFailOptions] = useState({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "Candidates Passed vs Failed by Topic and Batch",
      },
      legend: {
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: "NOS - BATCH NO",
        },
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: "Number of Candidates",
        },
      },
    },
  });

  const [
    overallPassFailAbsentPresentCandidates,
    setOverallPassFailAbsentPresentCandidates,
  ] = useState({
    labels: ["loading..."],
    datasets: [
      {
        label: "-------",
        data: [0, 0, 0],
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  });
  const [
    overallPassFailAbsentPresentCandidatesOptions,
    setOverallPassFailAbsentPresentCandidatesOptions,
  ] = useState({
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Overall Pass/Fail Candidates",
      },
    },
  });
  const [noswiseAttempts, setNoswiseAttempts] = useState({
    labels: ["loading..."],
    datasets: [
      {
        label: "-------",
        data: [0, 0, 0],
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  });
  const [noswiseAttemptsOptions, setNoswiseAttemptsOptions] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `${BASE_URL}company/batch-analytics/${params.linkId}`
      );
      const data = await response.json();
      console.log(data);
      const reports = data.data;
      console.log(reports[0]);
      console.log(reports[0].nosWiseReport);
      const mat = [];
      for (let i = 0; i < reports.length; i++) {
        mat.push(prepareMatrics(reports[i]));
      }
      console.log("matrics", mat);
      setMatrics(mat);
      setOverallBatchPerformanceData({
        labels: mat?.map((batch) => batch.batchNo),
        datasets: [
          {
            label: "Overall Score",
            data: mat?.map((batch) => batch.overAllScore),
            backgroundColor: "rgba(75, 192, 192, 0.5)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      });
      setOverallBatchPerformanceOptions({
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "Overall Batch Score",
          },
        },
      });
      setNoswiseBatchPerformanceData({
        labels: Object.keys(mat[0].nosWiseAttempts),
        datasets: [
          ...mat.map((batch) => {
            const randomColor = `rgba(${Math.floor(
              Math.random() * 256
            )}, ${Math.floor(Math.random() * 256)}, ${Math.floor(
              Math.random() * 256
            )}, 0.8)`;
            return {
              label: batch.batchNo,
              data: Object.values(batch.nosWiseAttempts).map(
                (attempt) => attempt.currMarks
              ),
              backgroundColor: randomColor,
            };
          }),
        ],
      });
      setNoswiseBatchPerformanceOptions({
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "NOS WISE BATCH PERFORMANCE",
          },
        },
      });
      setNoswisePassFailData({
        labels: mat
          .map((batch) => {
            const noses = Object.keys(batch.nosWisePassFailCandidates);
            return noses.map((nos) => `${nos} - ${batch.batchNo}`);
          })
          .flat(),
        datasets: [
          {
            label: "Passed",
            data: mat
              .map((batch) => {
                return Object.values(batch.nosWisePassFailCandidates).map(
                  (value) => value.passCandidates
                );
              })
              .flat(),
            backgroundColor: "rgba(255, 7, 76, 0.8)",
          },
          {
            label: "Failed",
            data: mat
              .map((batch) => {
                return Object.values(batch.nosWisePassFailCandidates).map(
                  (value) => value.failCandidates
                );
              })
              .flat(),
            backgroundColor: "rgba(255, 99, 132, 0.7)",
          },
        ],
      });
      setOverallPassFailAbsentPresentCandidates({
        labels: [
          "TOTAL ENROLLED CANDIDATES",
          "PRESENT CANDIDATES",
          "ABSENT CANDIDATES",
          "PASSES CANDIDATES",
          "FAIL CANDIDATES",
        ],
        datasets: [
          ...mat.map((batch) => {
            const randomColor = `rgba(${Math.floor(
              Math.random() * 256
            )}, ${Math.floor(Math.random() * 256)}, ${Math.floor(
              Math.random() * 256
            )}, 0.8)`;
            return {
              label: batch.batchNo,
              data: [
                batch.overallPassFailAbsentPresentCandidates
                  .totalEnrolledCandidate,
                batch.overallPassFailAbsentPresentCandidates.presentCandidates,
                batch.overallPassFailAbsentPresentCandidates.absentCandidates,
                batch.overallPassFailAbsentPresentCandidates.passCandidates,
                batch.overallPassFailAbsentPresentCandidates.failCandidates,
              ],
              backgroundColor: randomColor,
            };
          }),
        ],
      });
      setNoswiseAttempts({
        labels: Object.keys(mat[0].nosWiseAttempts),
        datasets: [
          ...mat.map((batch) => {
            const randomColor = `rgba(${Math.floor(
              Math.random() * 256
            )}, ${Math.floor(Math.random() * 256)}, ${Math.floor(
              Math.random() * 256
            )}, 0.8)`;
            return {
              label: batch.batchNo,
              data: Object.values(batch.nosWiseAttempts),
              backgroundColor: randomColor,
            };
          }),
        ],
      });
    };
    fetchData();
  }, []);

  const [currentChart, setCurrentChart] = useState("overallBatchScore");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    //  toast.success('Link copied to clipboard');
    Swal.fire({
      html: `
      <div class="custon-error-container">
        <div class="custom-swal-icon-wrapper">
          <i class="fa fa-check-circle custom-success-icon"></i>
        </div>
        <hr class="custom-error-divider" />
        <div class="custom-error-message capitalize">link copied to clipboard</div>
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
  };

  return (
    <div className="flex-col items-center justify-center gap-5 p-[25px]">
      <h2 className="text-xl font-bold mb-4 ml-1 text-center sm:text-left">
        Batch Analytics
      </h2>
      <div className="flex items-center mb-7">
        <a
          href={window.location.href}
          className="text-sm text-gray-600 mr-4 font-semibold"
        >
          Share Link:{" "}
          <span className="text-blue-600">{window.location.href}</span>
        </a>
        <button
          onClick={copyToClipboard}
          className="bg-blue-600 text-white text-sm px-3 py-1 rounded-md flex items-center gap-1"
        >
          <MdContentCopy /> <span>Copy</span>
        </button>
      </div>
      <label
        htmlFor="analytics"
        className="block mb-2 text-sm font-medium text-gray-900"
      >
        Select an option
      </label>
      <select
        id="analytics"
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 pr-8 "
        onChange={(e) => {
          console.log(e.target.value);
          setCurrentChart(e.target.value);
        }}
      >
        <option value="overallBatchScore" selected>
          Overall Batch Score
        </option>
        <option value="noswiseBatchScroe">NOS WISE BATCH PERFORMANCE</option>
        <option value="overallBatchStats">OVERALL STATS</option>
        <option value="noswisePassFailCandidates">
          NOS WISE PASS FAIL CANDIDATES
        </option>
      </select>
      <div
        id="chart"
        className="batch-analytics flex flex-col items-center justify-center gap-5 w-full"
      >
        {currentChart === "overallBatchScore" && (
          <div className="w-full max-w-7xl h-[40rem]">
            <BarChart
              options={overallBatchPerformanceOptions}
              data={overallBatchPerformanceData}
            />
          </div>
        )}
        {currentChart === "noswiseBatchScroe" && (
          <div className="w-full max-w-7xl h-[40rem]">
            <BarChart
              options={noswiseBatchPerformanceOptions}
              data={noswiseBatchPerformanceData}
            />
          </div>
        )}
        {currentChart === "overallBatchStats" && (
          <div className="w-full max-w-7xl h-[40rem]">
            <BarChart
              options={overallPassFailAbsentPresentCandidatesOptions}
              data={overallPassFailAbsentPresentCandidates}
            />
          </div>
        )}
        {currentChart === "noswisePassFailCandidates" && (
          <div className="w-full max-w-7xl h-[40rem]">
            <BarChart
              options={noswisePassFailOptions}
              data={noswisePassFailData}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default BatchAnalytics;
