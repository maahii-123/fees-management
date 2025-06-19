

import { Label, TextInput, Select, Button, FileInput } from "flowbite-react";
import { useEffect, useState } from "react";
import axios from "axios";
import ReactSelect from "react-select";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useNavigate } from 'react-router-dom';
import { useLocation } from "react-router-dom";

type CourseOption = {
  id: number;
  value: string;
  label: string;
  fees: number;
};

type BatchOption = {
  value: string;
  label: string;
  batch_name: string;
  batch_type: string;
  time_from: string;
  time_to: string;
};

type FormDataType = {
  name: string;
  student_id: string;
  gender: string;
  dob: string;
  admission_date: string;
  mobile_no: string;
  address: string;
  email: string;
  photo: string;
  education: string;
  parent_name: string;
  parent_mobile: string;
  parent_occupation: string;
  selectedCourses: CourseOption[];
  selectedBatch: BatchOption | null;
  total_fees: string;
  batch_id: string;
};

const Update = () => {
  const location = useLocation();
  const studentData = location.state;

  const initialFormData: FormDataType = {
    name: "",
    student_id: "",
    gender: "",
    dob: "",
    admission_date: "",
    mobile_no: "",
    address: "",
    email: "",
    photo: "",
    education: "",
    parent_name: "",
    parent_mobile: "",
    parent_occupation: "",
    selectedCourses: [],
    selectedBatch: null,
    total_fees: "",
    batch_id: "",
  };

  const [formData, setFormData] = useState<FormDataType>(initialFormData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [batchOptions, setBatchOptions] = useState<BatchOption[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [totalFees, setTotalFees] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);
  const today = new Date().toISOString().split("T")[0];
  const token = localStorage.getItem("token");
  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () =>{
      try {
        const res = await axios.get("http://localhost:7000/api/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const formatted = res.data.map((course: any) => ({
          id: course.id,
          value: course.course_name,
          label: `${course.course_name} - ₹${course.fees}`,
          fees: Number(course.fees),
        }));
        setCourseOptions(formatted);
      } catch (err) {
        console.error("Failed to fetch courses", err);
      }
    };
    fetchCourses();
  }, []);

  // Fetch batches
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await axios.get("http://localhost:7000/api/batches/all",{headers: {
          Authorization: `Bearer ${token}`,
        }});
        const formatted = res.data.map((batch: any) => ({
          value: batch.id.toString(),
          label: `${batch.batch_name} (${batch.batch_type}) [${batch.time_from} - ${batch.time_to}]`,
          batch_name: batch.batch_name,
          batch_type: batch.batch_type,
          time_from: batch.time_from,
          time_to: batch.time_to,
        }));
        setBatchOptions(formatted);
      } catch (err) {
        console.error("Failed to fetch batches", err);
      }
    };
    fetchBatches();
  }, []);

  // Populate form with existing student data
  useEffect(() => {
    if (studentData && courseOptions.length > 0 && batchOptions.length > 0 && !dataLoaded) {
      console.log("Student Data:", studentData); // Debug log
      
      // Parse courses from JSON string
      let selectedCourses: CourseOption[] = [];
      try {
        if (studentData.courses) {
          const parsedCourses = JSON.parse(studentData.courses);
          selectedCourses = parsedCourses.map((course: any) => {
            const matchedCourse = courseOptions.find(opt => opt.value === course.course_id);  // ✅ match by ID now
            return matchedCourse || {
              value: course.course_id, // ✅ send course ID instead of name
              label: `${course.course_name} - ₹${course.fees || 0}`,
              fees: course.fees || 0
            };
          });
        }
      } catch (error) {
        console.error("Error parsing courses:", error);
      }

      // Find selected batch
      const selectedBatch = batchOptions.find(batch => batch.value === studentData.batch_id?.toString()) || null;

      // Format mobile numbers (remove +91 prefix if present)
      const formatMobile = (mobile: string) => {
        if (!mobile) return "";
        return mobile.startsWith("+91") ? mobile.substring(3) : mobile;
      };

      // Format date for input field (YYYY-MM-DD)
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      setFormData({
        name: studentData.name || "",
        student_id: studentData.student_id || "",
        gender: studentData.gender || "",
        dob: formatDateForInput(studentData.dob),
        admission_date: formatDateForInput(studentData.admission_date),
        mobile_no: formatMobile(studentData.mobile_no),
        address: studentData.address || "",
        email: studentData.email || "",
        photo: studentData.photo || "",
        education: studentData.education || "",
        parent_name: studentData.parent_name || "",
        parent_mobile: formatMobile(studentData.parent_mobile),
        parent_occupation: studentData.parent_occupation || "",
        selectedCourses: selectedCourses,
        selectedBatch: selectedBatch,
        total_fees: studentData.total_fees?.toString() || "0",
        batch_id: studentData.batch_id?.toString() || "",
      });

      // Calculate total fees
      const calculatedFees = selectedCourses.reduce((sum, course) => sum + course.fees, 0);
      setTotalFees(calculatedFees);
      
      setDataLoaded(true);
    }
  }, [studentData, courseOptions, batchOptions, dataLoaded]);

  const handleChange = (e: any) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      if (files && files.length > 0) {
        const file = files[0];
        setSelectedFile(file);
        // Validate file type and size
        const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];
        const maxSize = 2 * 1024 * 1024; // 2MB
        
        if (!validImageTypes.includes(file.type)) {
          setErrors(prev => ({
            ...prev,
            photo: "Only JPG, JPEG, and PNG image formats are allowed"
          }));
        } else if (file.size > maxSize) {
          setErrors(prev => ({
            ...prev,
            photo: "Image size should not exceed 2MB"
          }));
        } else {
          setErrors(prev => {
            const newErrors = {...prev};
            delete newErrors.photo;
            return newErrors;
          });
        }
        
        setFormData({
          ...formData,
          [name]: file.name,
        });
      }
    } else {
      // For mobile number fields, only accept digits and max 10 chars
      if (name === "mobile_no" || name === "parent_mobile") {
        const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
        setFormData({
          ...formData,
          [name]: digitsOnly,
        });
      } else if (name === "name" || name === "parent_name") {
        const validName = value.replace(/[^a-zA-Z\s.'-]/g, "");
        setFormData({
          ...formData,
          [name]: validName,
        });
      } else {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    }
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    validateField(name, name === "mobile_no" || name === "parent_mobile" ? value.replace(/\D/g, "").slice(0, 10) : value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    validateField(name, formData[name as keyof FormDataType] as string);
  };

  const handleBatchSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = batchOptions.find((b) => b.value === e.target.value);
    setFormData((prev) => ({
      ...prev,
      selectedBatch: selected || null,
      batch_id: e.target.value,
    }));
    
    setTouched(prev => ({
      ...prev,
      selectedBatch: true
    }));
    
    if (!selected) {
      setErrors(prev => ({
        ...prev,
        selectedBatch: "Batch selection is required"
      }));
    } else {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.selectedBatch;
        return newErrors;
      });
    }
  };
  
  const validateField = (name: string, value: any) => {
    let error = "";
    
    switch (name) {
      case "name":
        if (!value.trim()) {
          error = "Student name is required";
        } else if (value.trim().length < 3) {
          error = "Name must be at least 3 characters long";
        } else if (value.trim().length > 50) {
          error = "Name must be less than 50 characters";
        } else if (!/^[a-zA-Z\s.'-]+$/.test(value)) {
          error = "Name can only contain letters, spaces, and characters like . ' -";
        }
        break;
        
      case "gender":
        if (!value) {
          error = "Gender selection is required";
        }
        break;
        
      case "dob":
        if (!value) {
          error = "Date of Birth is required";
        } else {
          const dobDate = new Date(value);
          const today = new Date();
          const minAge = new Date();
          minAge.setFullYear(today.getFullYear() - 3);
          
          if (dobDate > today) {
            error = "Date of Birth cannot be in the future";
          } else if (dobDate > minAge) {
            error = "Student must be at least 3 years old";
          }
        }
        break;
        
      case "admission_date":
        if (!value) {
          error = "Admission Date is required";
        } else {
          const admissionDate = new Date(value);
          const today = new Date();
          const oneYearAhead = new Date();
          oneYearAhead.setFullYear(today.getFullYear() + 1);
          
          if (admissionDate > oneYearAhead) {
            error = "Admission date cannot be more than 1 year in the future";
          }
        }
        break;
        
      case "mobile_no":
        if (!value) {
          error = "Mobile number is required";
        } else if (!/^\d{10}$/.test(value)) {
          error = "Mobile number must be exactly 10 digits";
        }
        break;
        
      case "address":
        if (!value.trim()) {
          error = "Address is required";
        } else if (value.trim().length < 10) {
          error = "Address should be at least 10 characters";
        } else if (value.trim().length > 200) {
          error = "Address should be less than 200 characters";
        }
        break;
        
      case "email":
        if (!value.trim()) {
          error = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address";
        }
        break;
        
      case "education":
        if (!value.trim()) {
          error = "Education qualification is required";
        } else if (value.trim().length < 2) {
          error = "Education details should be more specific";
        } else if (value.trim().length > 100) {
          error = "Education details should be less than 100 characters";
        }
        break;
        
      case "parent_name":
        if (!value.trim()) {
          error = "Parent name is required";
        } else if (value.trim().length < 3) {
          error = "Parent name must be at least 3 characters long";
        } else if (value.trim().length > 50) {
          error = "Parent name must be less than 50 characters";
        } else if (!/^[a-zA-Z\s.'-]+$/.test(value)) {
          error = "Parent name can only contain letters, spaces, and characters like . ' -";
        }
        break;
        
      case "parent_mobile":
        if (!value) {
          error = "Parent mobile number is required";
        } else if (!/^\d{10}$/.test(value)) {
          error = "Parent mobile number must be exactly 10 digits";
        }
        break;
        
      case "parent_occupation":
        if (!value.trim()) {
          error = "Parent occupation is required";
        } else if (value.trim().length < 3) {
          error = "Occupation should be at least 3 characters";
        } else if (value.trim().length > 50) {
          error = "Occupation should be less than 50 characters";
        }
        break;
        
      default:
        break;
    }
    
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    } else {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
    
    return !error;
  };

  const validateForm = () => {
    const fieldsToValidate = [
      "name", "gender", "dob", "admission_date", "mobile_no", 
      "address", "email", "education", "parent_name", 
      "parent_mobile", "parent_occupation"
    ];
    
    const allTouched = fieldsToValidate.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as {[key: string]: boolean});
    
    setTouched({...touched, ...allTouched, selectedCourses: true, selectedBatch: true});
    
    let isValid = true;
    for (const field of fieldsToValidate) {
      const fieldIsValid = validateField(field, formData[field as keyof FormDataType]);
      if (!fieldIsValid) isValid = false;
    }
    
    if (formData.selectedCourses.length === 0) {
      setErrors(prev => ({
        ...prev,
        selectedCourses: "Select at least one course"
      }));
      isValid = false;
    } else {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.selectedCourses;
        return newErrors;
      });
    }
    
    if (!formData.selectedBatch) {
      setErrors(prev => ({
        ...prev,
        selectedBatch: "Batch selection is required"
      }));
      isValid = false;
    } else {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.selectedBatch;
        return newErrors;
      });
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!validateForm()) {
      MySwal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Please fix the errors in the form",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }
  
    try {
      const formDataToSend = new FormData();
  
      // ✅ Append all fields with default fallback
      formDataToSend.append("student_id", formData.student_id || "");
      formDataToSend.append("name", formData.name || "");
      formDataToSend.append("dob", formData.dob || "");
      formDataToSend.append("admission_date", formData.admission_date || "");
      formDataToSend.append("gender", formData.gender || "");
      formDataToSend.append("mobile_no", "+91" + (formData.mobile_no || ""));
      formDataToSend.append("address", formData.address || "");
      formDataToSend.append("email", formData.email || "");
      formDataToSend.append("education", formData.education || "");
      formDataToSend.append("parent_name", formData.parent_name || "");
      formDataToSend.append("parent_mobile", "+91" + (formData.parent_mobile || ""));
      formDataToSend.append("parent_occupation", formData.parent_occupation || "");
  
      // ✅ Append photo (check type)
      if (selectedFile instanceof File) {
        formDataToSend.append("photo", selectedFile);
      } else if (typeof formData.photo === "string") {
        formDataToSend.append("photo", formData.photo);
      }
  
      // ✅ Append course IDs
      const courseIds = formData.selectedCourses.map((c) => c.id);
      formDataToSend.append("courses_id", JSON.stringify(courseIds));
  
      // ✅ Append batch info
      formDataToSend.append("batch_id", formData.selectedBatch?.value || "");
      const batch = formData.selectedBatch;
      const batch_details = batch
        ? `${batch.batch_name} (${batch.batch_type}) [${batch.time_from} - ${batch.time_to}]`
        : "";
      formDataToSend.append("batch_details", batch_details);
  
      // ✅ Debug: print FormData entries to verify what’s being sent
      for (let pair of formDataToSend.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
      }
  // console.log(formDataToSend);
      // ✅ Axios PUT request
      await axios.put(
        `http://localhost:7000/api/students/update/${studentData.id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
            
          },
        }
      );
  
      MySwal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Student updated successfully!",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
  
      navigate("/ui/table");
    } catch (err) {
      console.error("Failed to update student", err);
      MySwal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Failed to update student",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }
  };
  
  return (
    <>
      <form onSubmit={handleSubmit} className="rounded-xl shadow-md bg-white p-6 w-full form-control form-rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-2xl font-bold">
            Student <span className="text-blue-700 text-2xl">Update</span> Form
          </h5>
          <Button color="gray" onClick={() => navigate("/ui/table")}>
            ← Back to Table
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Courses */}
          <div className="md:col-span-2">
            <Label value="Select Courses" className="mb-2 block" />
            
             <ReactSelect
        options={courseOptions}
        isMulti
        value={formData.selectedCourses}
        placeholder="Select Courses"
        styles={{
          control: (base) => ({
            ...base,
            minHeight: "42px",
            height: "auto",
            padding: "0 8px",
            borderRadius: "0.5rem",
            borderColor:
              touched.selectedCourses && errors.selectedCourses
                ? "#ef4444"
                : "#d1d5db",
            boxShadow: "none",
            "&:hover": {
              borderColor:
                touched.selectedCourses && errors.selectedCourses
                  ? "#ef4444"
                  : "#a1a1aa",
            },
          }),
          valueContainer: (base) => ({
            ...base,
            padding: "0px",
          }),
          input: (base) => ({
            ...base,
            margin: "0px",
          }),
        }}
        onChange={(selectedOptions) => {
          const selected = selectedOptions as CourseOption[];
          setFormData((prev) => ({
            ...prev,
            selectedCourses: selected || [],
          }));

          setTouched((prev) => ({
            ...prev,
            selectedCourses: true,
          }));

          if (!selected || selected.length === 0) {
            setErrors((prev) => ({
              ...prev,
              selectedCourses: "Select at least one course",
            }));
          } else {
            setErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors.selectedCourses;
              return newErrors;
            });
          }

          const total = selected ? selected.reduce((sum, c) => sum + c.fees, 0) : 0;
          setTotalFees(total);
        }}
      />
            {touched.selectedCourses && errors.selectedCourses && 
              <p className="text-red-600 text-sm mt-1">{errors.selectedCourses}</p>}
          </div>

          {/* Batch */}
          <div className="selectradius">
            <Label htmlFor="batchSelect" value="Select Batch" className="mb-2 block" />
            <Select
              id="batchSelect"
              name="batchSelect"
              required
              onChange={handleBatchSelect}
              onBlur={handleBlur}
              value={formData.selectedBatch?.value || ""}
              color={touched.selectedBatch && errors.selectedBatch ? "failure" : undefined}
            >
              <option value="">-- Select a Batch --</option>
              {batchOptions.map((batch) => (
                <option key={batch.value} value={batch.value}>
                  {batch.label}
                </option>
              ))}
            </Select>
            {touched.selectedBatch && errors.selectedBatch && 
              <p className="text-red-600 text-sm mt-1">{errors.selectedBatch}</p>}
          </div>

          {/* Student Name */}
          <div>
            <Label htmlFor="name" value="Student Name" className="mb-2 block" />
            <TextInput
              name="name"
              type="text"
              onChange={handleChange}
              onBlur={handleBlur}
              required
              value={formData.name}
              placeholder="Full Name"
              color={touched.name && errors.name ? "failure" : undefined}
              helperText={touched.name && errors.name ? errors.name : undefined}
            />
          </div>

          {/* Date of Birth */}
          <div>
            <Label htmlFor="dob" value="Date of Birth" className="mb-2 block" />
            <TextInput
              name="dob"
              type="date"
              onChange={handleChange}
              onBlur={handleBlur}
              required
              max={today}
              value={formData.dob}
              color={touched.dob && errors.dob ? "failure" : undefined}
              helperText={touched.dob && errors.dob ? errors.dob : undefined}
            />
          </div>

          {/* Admission Date */}
          <div>
            <Label htmlFor="admission_date" value="Admission Date" className="mb-2 block" />
            <TextInput
              name="admission_date"
              type="date"
              onChange={handleChange}
              onBlur={handleBlur}
              required
              value={formData.admission_date}
              color={touched.admission_date && errors.admission_date ? "failure" : undefined}
              helperText={touched.admission_date && errors.admission_date ? errors.admission_date : undefined}
            />
          </div>

          {/* Gender */}
          <div className="selectradius">
            <Label htmlFor="gender" value="Gender" className="mb-2 block" />
            <Select 
              name="gender" 
              onChange={handleChange} 
              onBlur={handleBlur}
              value={formData.gender} 
              required
              color={touched.gender && errors.gender ? "failure" : undefined}
            >
              <option value="">-- Select Gender --</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Select>
            {touched.gender && errors.gender && 
              <p className="text-red-600 text-sm mt-1">{errors.gender}</p>}
          </div>

          {/* Mobile No with +91 prefix */}
          <div>
            <Label htmlFor="mobile_no" value="Mobile Number" className="mb-2 block" />
            <div className={`flex items-center border rounded-md overflow-hidden ${
              touched.mobile_no && errors.mobile_no ? 'border-red-500' : 'border-gray-300'
            }`}>
              <span className="bg-gray-200 text-gray-700 px-3 py-2 select-none">+91</span>
              <input
                type="text"
                name="mobile_no"
                id="mobile_no"
                placeholder="Enter 10 digit mobile number"
                maxLength={10}
                value={formData.mobile_no}
                onChange={handleChange}
                onBlur={handleBlur}
                className="outline-none px-2 py-2 flex-grow"
                required
              />
            </div>
            {touched.mobile_no && errors.mobile_no && 
              <p className="text-red-600 text-sm mt-1">{errors.mobile_no}</p>}
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address" value="Address" className="mb-2 block" />
            <TextInput
              name="address"
              type="text"
              onChange={handleChange}
              onBlur={handleBlur}
              required
              value={formData.address}
              placeholder="Complete Address"
              color={touched.address && errors.address ? "failure" : undefined}
              helperText={touched.address && errors.address ? errors.address : undefined}
            />
          </div>

          {/* Email Address */}
          <div>
            <Label htmlFor="email" value="Email Address" className="mb-2 block" />
            <TextInput
              name="email"
              type="email"
              onChange={handleChange}
              onBlur={handleBlur}
              required
              value={formData.email}
              placeholder="example@email.com"
              color={touched.email && errors.email ? "failure" : undefined}
              helperText={touched.email && errors.email ? errors.email : undefined}
            />
          </div>

          {/* Education */}
          <div>
            <Label htmlFor="education" value="Education Qualification" className="mb-2 block" />
            <TextInput
              name="education"
              type="text"
              onChange={handleChange}
              onBlur={handleBlur}
              required
              value={formData.education}
              placeholder="Highest Education"
              color={touched.education && errors.education ? "failure" : undefined}
              helperText={touched.education && errors.education ? errors.education : undefined}
            />
          </div>

          {/* Parent Name */}
          <div>
            <Label htmlFor="parent_name" value="Parent Name" className="mb-2 block" />
            <TextInput
              name="parent_name"
              type="text"
              onChange={handleChange}
              onBlur={handleBlur}
              required
              value={formData.parent_name}
              placeholder="Parent's Full Name"
              color={touched.parent_name && errors.parent_name ? "failure" : undefined}
              helperText={touched.parent_name && errors.parent_name ? errors.parent_name : undefined}
            />
          </div>

          {/* Parent Mobile No with +91 prefix */}
          <div>
            <Label htmlFor="parent_mobile" value="Parent Mobile Number" className="mb-2 block" />
            <div className={`flex items-center border rounded-md overflow-hidden ${
              touched.parent_mobile && errors.parent_mobile ? 'border-red-500' : 'border-gray-300'
            }`}>
              <span className="bg-gray-200 text-gray-700 px-3 py-2 select-none">+91</span>
              <input
                type="text"
                name="parent_mobile"
                id="parent_mobile"
                placeholder="Enter 10 digit parent mobile"
                maxLength={10}
                value={formData.parent_mobile}
                onChange={handleChange}
                onBlur={handleBlur}
                className="outline-none px-2 py-2 flex-grow"
                required
              />
            </div>
            {touched.parent_mobile && errors.parent_mobile && 
              <p className="text-red-600 text-sm mt-1">{errors.parent_mobile}</p>}
          </div>

          {/* Parent Occupation */}
          <div>
            <Label htmlFor="parent_occupation" value="Parent Occupation" className="mb-2 block" />
            <TextInput
              name="parent_occupation"
              type="text"
              onChange={handleChange}
              onBlur={handleBlur}
              required
              value={formData.parent_occupation}
              placeholder="Parent's Occupation"
              color={touched.parent_occupation && errors.parent_occupation ? "failure" : undefined}
              helperText={touched.parent_occupation && errors.parent_occupation ? errors.parent_occupation : undefined}
            />
          </div>

          {/* Photo Upload */}
          <div>
            <Label htmlFor="photo" value="Photo" className="mb-2 block" />
            <FileInput 
              name="photo" 
              id="photo" 
              onChange={handleChange}
              color={errors.photo ? "failure" : undefined}
              helperText={errors.photo ? errors.photo : "JPG, JPEG or PNG (Max. 2MB)"}
            />
          </div>

          {/* Fees Display */}
          <div className="lg:col-span-3">
            <p className="text-lg font-semibold mt-4">
              Total Fees: <span className="text-blue-600">₹ {totalFees}</span>
            </p>
          </div>

    
          {/* Submit and Reset Buttons */}
          <div className="lg:col-span-3 flex justify-end gap-4 mt-6">
            {/* <Button type="button" color="light" onClick={handleReset}>Reset</Button> */}
            <Button type="submit" color="primary">Submit</Button>
          </div>
        </div>
      </form>
    </>
  );
};

export default Update;