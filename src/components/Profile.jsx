import axios from "axios";
import "cropperjs/dist/cropper.css";
import { useEffect, useRef, useState } from "react";
import { Cropper } from "react-cropper";
import toast from "react-hot-toast";
import { FaCamera, FaEdit } from "react-icons/fa";
import { RiHomeOfficeLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import adminLogo from "../assets/admin.png";
import { fetchAdminProfile } from "../components/features/profileSlice";
import { BASE_URL } from "./constant";

const Profile = () => {
  const [editMode, setEditMode] = useState(false);
  const [editType, setEditType] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    companyName: "",
    companyPhone: "",
    companyAddress: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [companyAvatar, setCompanyAvatar] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [companyPreviewImage, setCompanyPreviewImage] = useState(null);
  const [cropping, setCropping] = useState(false);
  const cropperRef = useRef(null);
  const fileInputRef = useRef(null);
  const fileInputRef2 = useRef(null);
  const dispatch = useDispatch();
  const adminId = sessionStorage.getItem("adminId");
  const { adminProfile } = useSelector((state) => state.profile);
  const { adminDetails } = adminProfile || {};

  useEffect(() => {
    if (adminId) {
      dispatch(fetchAdminProfile(adminId));
    }
  }, [adminId, dispatch]);

  useEffect(() => {
    if (adminDetails) {
      setFormData({
        name: adminDetails.name || "",
        phone: adminDetails.phone || "",
        companyName: adminDetails.company.name || "",
        companyPhone: adminDetails.company.phone || "",
        companyAddress: adminDetails.company.address || "",
      });
      setPreviewImage(adminDetails.profilePictureUrl);
      setCompanyPreviewImage(adminDetails.company.companyLogoUrl);
    }
  }, [adminDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");
    try {
      await axios.patch(
        `${BASE_URL}company/admin/${adminId}/profile`,
        {
          name: formData.name,
          phone: formData.phone,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Profile updated successfully!");
      dispatch(fetchAdminProfile(adminId));
      setEditMode(false);
      setEditType("");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");
    try {
      await axios.patch(
        `${BASE_URL}company/profile`,
        {
          name: formData.companyName,
          phone: formData.companyPhone,
          address: formData.companyAddress,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Company updated successfully!");
      dispatch(fetchAdminProfile(adminId));
      setEditMode(false);
      setEditType("");
    } catch (error) {
      console.error("Error updating company:", error);
      toast.error(
        error.response.data.message ||
          "Failed to update company. Please try again."
      );
    }
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreviewImage(URL.createObjectURL(file));
      setCropping(true);
    }
  };

  const handleCompanyImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompanyAvatar(file);
      setCompanyPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleCompanyCameraClick = () => {
    fileInputRef2.current.click();
  };

  const handleCameraClick = () => {
    fileInputRef.current.click();
  };

  const handleCrop = () => {
    const cropper = cropperRef.current.cropper;
    const croppedCanvas = cropper.getCroppedCanvas();
    croppedCanvas.toBlob((blob) => {
      const croppedImageUrl = URL.createObjectURL(blob);
      setPreviewImage(croppedImageUrl);
      setAvatar(blob);
      setCropping(false);
    }, "image/jpeg");
  };

  const handleUpdateProfilePicture = async () => {
    const token = sessionStorage.getItem("token");
    const formData = new FormData();
    formData.append("avatar", avatar);

    try {
      await axios.patch(
        `${BASE_URL}company/admin/${adminId}/change-profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Profile picture updated successfully!");
      dispatch(fetchAdminProfile(adminId));
      setAvatar(null);
    } catch (error) {
      console.error("Error updating profile picture:", error);
      toast.error("Failed to update profile picture. Please try again.");
    }
  };

  const handleUpdateCompanyPicture = async () => {
    const token = sessionStorage.getItem("token");
    const formData = new FormData();
    formData.append("logo", companyAvatar);

    try {
      await axios.patch(`${BASE_URL}company/change-company-logo`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Company picture updated successfully!");
      dispatch(fetchAdminProfile(adminId));
      setCompanyAvatar(null);
    } catch (error) {
      console.error("Error updating company picture:", error);
      toast.error(
        error.response.data.message ||
          "Failed to update company picture. Please try again."
      );
    }
  };

  if (!adminDetails) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-t-4 border-blue-500 border-solid rounded-full"></div>
      </div>
    );
  }

  return (
    <div className=" flex justify-center p-4 mx-2 h-auto">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-2xl">
        {editType !== "company" && (
          <div className="relative flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center shadow-md overflow-hidden">
              {previewImage ? (
                <div className="mt-2">
                  <img
                    src={previewImage}
                    alt="Cropped Preview"
                    className="w-32 h-32 object-cover border-2 border-gray-300 rounded-lg"
                  />
                </div>
              ) : (
                <span className="text-3xl font-bold text-blue-600">
                  {formData.name[0] || "A"}
                </span>
              )}
            </div>
            <button
              onClick={handleCameraClick}
              className="absolute top-12 right-12 lg:top-12 lg:right-64 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-md"
            >
              <FaCamera size={15} />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />

            {cropping && (
              <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  <Cropper
                    src={previewImage}
                    style={{ height: 400, width: "100%" }}
                    initialAspectRatio={1}
                    aspectRatio={1}
                    guides={false}
                    cropBoxResizable={true}
                    cropBoxMovable={true}
                    dragMode="move"
                    scalable={true}
                    zoomable={true}
                    viewMode={1}
                    background={false}
                    responsive={true}
                    autoCropArea={1}
                    checkOrientation={false}
                    ref={cropperRef}
                  />
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={() => setCropping(false)}
                      className="bg-gray-400 text-white px-5 py-1 rounded-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCrop}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-1 rounded-sm"
                    >
                      Crop
                    </button>
                  </div>
                </div>
              </div>
            )}

            {avatar && !cropping && (
              <button
                onClick={handleUpdateProfilePicture}
                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-0.5 rounded-sm shadow"
              >
                Upload
              </button>
            )}

            <h2 className="text-2xl font-bold text-gray-800 mt-4">
              {adminDetails.name.toUpperCase()}
            </h2>
            <p className=" flex justify-center items-center font-semibold text-green-700">
              {" "}
              <span>{adminDetails.type.toUpperCase()}</span>
            </p>
          </div>
        )}

        {editType === "company" && (
          <div className="relative flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-transparent flex items-center justify-center shadow-md overflow-hidden">
              {companyPreviewImage ? (
                <img
                  src={companyPreviewImage}
                  alt="Company Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-blue-600">
                  {formData.companyName[0] || "C"}
                </span>
              )}
            </div>
            <button
              onClick={handleCompanyCameraClick}
              className="absolute top-12 right-12 lg:top-12 lg:right-64 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-md"
            >
              <FaCamera size={15} />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef2}
              onChange={handleCompanyImageChange}
              className="hidden"
            />

            {companyAvatar && (
              <button
                onClick={handleUpdateCompanyPicture}
                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-sm shadow"
              >
                Upload Logo
              </button>
            )}
            <h2 className="text-xl font-bold text-gray-800 mt-4">
              {formData.companyName.toUpperCase()}
            </h2>
          </div>
        )}

        {editMode ? (
          <form className="space-y-4">
            {editType === "admin" && (
              <>
                <div>
                  <label className="block text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border rounded-md"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setEditType("");
                    }}
                    className="bg-gray-400 text-white px-5 py-1 rounded-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateProfile}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-1 rounded-sm"
                  >
                    Save
                  </button>
                </div>
              </>
            )}
            {editType === "company" && (
              <>
                <div>
                  <label className="block text-gray-700">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Company Phone</label>
                  <input
                    type="text"
                    name="companyPhone"
                    value={formData.companyPhone}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Company Address</label>
                  <input
                    type="text"
                    name="companyAddress"
                    value={formData.companyAddress}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border rounded-md"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setEditType("");
                    }}
                    className="bg-gray-400 text-white px-5 py-1 rounded-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateCompany}
                    className="bg-green-500 hover:bg-green-600 text-white px-5 py-1 rounded-sm"
                  >
                    Save
                  </button>
                </div>
              </>
            )}
          </form>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-gray-50 px-2 py-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="inline-block">
                    {" "}
                    <img src={adminLogo} alt="admin" className="h-6 w-6 mr-3" />
                  </span>
                  Admin Details
                  <span className="ml-2">
                    <button
                      onClick={() => {
                        setEditMode(true);
                        setEditType("admin");
                      }}
                      className=" text-green-700 transform transition-transform duration-300 hover:scale-105 text-sm flex justify-center items-center"
                    >
                      {" "}
                      <FaEdit className="mr-1" />
                      <span>Edit</span>
                    </button>
                  </span>
                </h3>
                <div className="space-y-3">
                  <p className="text-gray-700 break-words">
                    <strong className="font-medium text-gray-600">Name:</strong>{" "}
                    <span className="text-gray-800 break-words">
                      {adminDetails.name}
                    </span>
                  </p>
                  <p className="text-gray-700 break-words">
                    <strong className="font-medium text-gray-600">
                      Email:
                    </strong>
                    <span className="text-gray-800 break-words">
                      {adminDetails.email}
                    </span>
                  </p>
                  <p className="text-gray-700 break-words">
                    <strong className="font-medium text-gray-600">
                      Phone:
                    </strong>{" "}
                    <span className="text-gray-800 break-words">
                      {adminDetails.phone}
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 px-2 py-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="inline-block">
                    {" "}
                    <RiHomeOfficeLine className="h-6 w-6 mr-3 text-blue-700" />
                  </span>
                  Company Details
                  <span className="ml-2">
                    <button
                      onClick={() => {
                        setEditMode(true);
                        setEditType("company");
                      }}
                      className=" text-blue-700 transform transition-transform duration-300 hover:scale-105 text-sm flex justify-center items-center"
                    >
                      {" "}
                      <FaEdit className="mr-1" />
                      <span>Edit</span>
                    </button>
                  </span>
                </h3>
                <div className="space-y-3">
                  <p className="text-gray-700 break-words">
                    <strong className="font-medium text-gray-600">
                      Company:
                    </strong>{" "}
                    <span className="text-gray-800 break-words">
                      {adminDetails.company.name}
                    </span>
                  </p>
                  <p className="text-gray-700 break-words">
                    <strong className="font-medium text-gray-600">
                      Company Phone:
                    </strong>{" "}
                    <span className="text-gray-800 break-words">
                      {adminDetails.company.phone}
                    </span>
                  </p>
                  <p className="text-gray-700 break-words">
                    <strong className="font-medium text-gray-600">
                      Company Address:
                    </strong>{" "}
                    <span className="text-gray-800 break-words">
                      {adminDetails.company.address}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
