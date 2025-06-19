// import { Label, TextInput, Select, Button, FileInput } from "flowbite-react";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import ReactSelect from "react-select";
// import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";


// type CourseOption = {
//   id : number;
//   value: string;
//   label: string;
//   fees: number;
// };

// type BatchOption = {
//   value: string;
//   label: string;
//   batch_name: string;
//   batch_type: string;
//   time_from: string;
//   time_to: string;
// };

// type FormDataType = {
//   name: string;
//   gender: string;
//   dob: string;
//   admission_date: string;
//   mobile_no: string;
//   address: string;
//   email: string;
//   photo: File | null;
//   education: string;
//   parent_name: string;
//   parent_mobile: string;
//   parent_occupation: string;
//   selectedCourses: CourseOption | null;
//   selectedBatch: BatchOption | null;
// };

// // --------------- Component --------------
// const StudentForm= () => {
//   const initialFormData: FormDataType = {
//     name: "",
//     gender: "",
//     dob: "",
//     admission_date: "",
//     mobile_no: "",
//     address: "",
//     email: "",
//     photo: null,
//     education: "",
//     parent_name: "",
//     parent_mobile: "",
//     parent_occupation: "",
//     selectedCourses: null,
//     selectedBatch: null,
//   };

//   const [formData, setFormData] = useState<FormDataType>(initialFormData);
//   const [errors, setErrors] = useState<{ [key: string]: string }>({});
//   const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
//   const [batchOptions, setBatchOptions] = useState<BatchOption[]>([]);
//   const [totalFees, setTotalFees] = useState(0);
// // const navigate = useNavigate();
// const token = localStorage.getItem("token");

//   const MySwal = withReactContent(Swal);

//   const today = new Date().toISOString().split("T")[0];

//   useEffect(() => {
//     const fetchCourses = async () => {
//       try {
//         const res = await axios.get("http://localhost:7000/api/courses",{headers: {
//           Authorization: `Bearer ${token}`,
//         }});
//         const formatted = res.data.map((course: any) => ({
//           id: course.id,
//           value: course.course_name,
//           label: `${course.course_name} - ₹${course.fees}`,
//           fees: Number(course.fees),
//         }));
//         setCourseOptions(formatted);
//       } catch (err) {
//         console.error("Failed to fetch courses", err);
//       }
//     };
//     fetchCourses();
//   }, []);


//   useEffect(() => {
//   const fetchFilteredBatches = async () => {
//     if (formData.selectedCourses.length === 0) {
//       setBatchOptions([]); // clear batch options if no courses selected
//       setFormData((prev) => ({ ...prev, selectedBatch: null }));
//       return;
//     }

//     try {
//       const courseNames = formData.selectedCourses.map((c) => c.value);
//       const res = await axios.post("http://localhost:7000/api/batches/filter", {
//         courses: courseNames,
//       },{headers: {
//         Authorization: `Bearer ${token}`,
//       }});

//       const formatted = res.data.map((batch: any) => ({
//         value: batch.id.toString(),
//         label: `${batch.batch_name} (${batch.batch_type}) [${batch.time_from} - ${batch.time_to}]`,
//         batch_name: batch.batch_name,
//         batch_type: batch.batch_type,
//         time_from: batch.time_from,
//         time_to: batch.time_to,
//       }));

//       setBatchOptions(formatted);
//       setFormData((prev) => ({
//         ...prev,
//         selectedBatch: null, // reset selected batch if courses change
//       }));
//     } catch (err) {
//       console.error("Failed to fetch filtered batches", err);
//     }
//   };

//   fetchFilteredBatches();
// }, [formData.selectedCourses]);

//   const handleChange = (e: any) => {
//     const { name, value, type } = e.target;
//     if (type === "file") {
//       const files = e.target.files;
//       setFormData({
//         ...formData,
//         [name]: files && files.length > 0 ? files[0] : null,
//       });
//     } else {
//       const cleanValue =
//         name === "mobile_no" || name === "parent_mobile"
//           ? value.replace(/^\+91/, "").slice(0, 10)
//           : value;
//       setFormData({
//         ...formData,
//         [name]: cleanValue,
//       });
//     }
//   };

//   const handleBatchSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const selected = batchOptions.find((b) => b.value === e.target.value);
//     setFormData((prev) => ({
//       ...prev,
//       selectedBatch: selected || null,
//     }));
//   };

//   const validateForm = () => {
//     const newErrors: { [key: string]: string } = {};

//     if (!formData.name.trim()) newErrors.name = "Name is required";
//     if (!formData.dob) newErrors.dob = "Date of Birth is required";
//     if (!formData.admission_date) newErrors.admission_date = "Admission Date is required";
//     if (!formData.gender) newErrors.gender = "Gender is required";
//     if (!/^\d{10}$/.test(formData.mobile_no)) newErrors.mobile_no = "Mobile number must be 10 digits";
//     if (!formData.address.trim()) newErrors.address = "Address is required";
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
//     if (!formData.education.trim()) newErrors.education = "Education is required";
//     if (!formData.parent_name.trim()) newErrors.parent_name = "Parent name is required";
//     if (!/^\d{10}$/.test(formData.parent_mobile)) newErrors.parent_mobile = "Parent mobile must be 10 digits";
//     if (!formData.parent_occupation.trim()) newErrors.parent_occupation = "Parent occupation is required";
//     if (formData.selectedCourses.length === 0) newErrors.selectedCourses = "Select at least one course";
//     if (!formData.selectedBatch) newErrors.selectedBatch = "Select a batch";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!validateForm()) return;
  
//     try {
//       const data = new FormData();
//       data.append("name", formData.name);
// data.append("gender", formData.gender);
// data.append("dob", formData.dob);
// data.append("admission_date", formData.admission_date);
// data.append("mobile_no", "+91" + formData.mobile_no);
// data.append("address", formData.address);
// data.append("email", formData.email);
// data.append("education", formData.education);
// data.append("parent_name", formData.parent_name);
// data.append("parent_mobile", "+91" + formData.parent_mobile);
// data.append("parent_occupation", formData.parent_occupation);
// if (formData.photo) data.append("photo", formData.photo);
// data.append("courses_id", JSON.stringify(formData.selectedCourses.map(c => c.id)));

// // Corrected course ID array

// // const selectedCourseIdss = formData.selectedCourses.map(course => course.id).join(",");
// // data.append("courses_id", JSON.stringify(selectedCourseIdss));
// // selectedCourseIdss.forEach(id => {
// //   data.append("courses_id[]", id);  // or "courses_id" based on backend
// // });
// // Corrected batch ID
// if (formData.selectedBatch) {
//   data.append("batch_id", formData.selectedBatch.value);
//   data.append(
//     "batch_details",
//     `${formData.selectedBatch.batch_name} (${formData.selectedBatch.batch_type}) [${formData.selectedBatch.time_from} - ${formData.selectedBatch.time_to}]`
//   );
// }

  
//       await axios.post("http://localhost:7000/api/students/create", data, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${token}`,
//         },
//       });
  
//       MySwal.fire({
//         toast: true,
//         position: "top-end",
//         icon: "success",
//         title: "Student added successfully!",
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//       });
  
//       setFormData(initialFormData);
//       setTotalFees(0);
//       setErrors({});
//     } catch (err) {
//       console.error("Failed to submit form", err);
//       MySwal.fire({
//         toast: true,
//         position: "top-end",
//         icon: "error",
//         title: "Failed to submit form",
//         showConfirmButton: false,
//         timer: 3000,
//         timerProgressBar: true,
//       });
//     }
//   };
  

//   const handleReset = () => {
//     setFormData(initialFormData);
//     setTotalFees(0);
//     setErrors({});
//   };

 

//   return (
    
//     <>


//     <form onSubmit={handleSubmit} className="rounded-xl shadow-md bg-white p-6 w-full form-control form-rounded-xl">
//       <h5 className="text-2xl font-bold mb-6">
//         Student <span className="text-blue-700 text-2xl">Admission</span> Form
//       </h5>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {/* Courses */}
//         <div className="md:col-span-2">
//           <Label value="Select Courses" className="mb-2 block" />
//           <ReactSelect
//             options={courseOptions}
//             isMulti
//             onChange={(selectedOptions) => {
//               const selected = selectedOptions as CourseOption[];
//               setFormData((prev) => ({
//                 ...prev,
//                 selectedCourses: selected || [],
//               }));
//               const total = selected ? selected.reduce((sum, c) => sum + c.fees, 0) : 0;
//               setTotalFees(total);
//             }}
//             value={formData.selectedCourses}
//             placeholder="Select Courses"
//             styles={{
//               control: (base) => ({
//                 ...base,
//                 minHeight: '42px',
//                 height: '42px',
//                 padding: '0 8px',
//                 borderRadius: '0.5rem',
//                 borderColor: '#d1d5db',
//                 boxShadow: 'none',
//                 '&:hover': {
//                   borderColor: '#a1a1aa',
//                 },
//               }),
//               valueContainer: (base) => ({
//                 ...base,
//                 padding: '0px',
//               }),
//               input: (base) => ({
//                 ...base,
//                 margin: '0px',
//               }),
//             }}
//           />
//           {errors.selectedCourses && <p className="text-red-600 text-sm">{errors.selectedCourses}</p>}
//         </div>

//         {/* Batch */}
//         <div className="selectradius">
//           <Label htmlFor="batchSelect" value="Select Batch" className="mb-2 block" />
//           <Select
//             id="batchSelect"
//             name="batchSelect"
//             required
//             onChange={handleBatchSelect}
//             value={formData.selectedBatch?.value || ""}
//           >
//             <option value="">-- Select a Batch --</option>
//             {batchOptions.map((batch) => (
//               <option key={batch.value} value={batch.value}>
//                 {batch.label}
//               </option>
//             ))}
//           </Select>
//           {errors.selectedBatch && <p className="text-red-600 text-sm">{errors.selectedBatch}</p>}
//         </div>

//         {/* Input Fields */}
//         {[
//           { name: "name", label: "Student Name", type: "text", placeholder: "Name" },
//           { name: "dob", label: "Date of Birth", type: "date", max: today },
//           { name: "admission_date", label: "Admission Date", type: "date", max: today },
//           { name: "mobile_no", label: "Mobile Number", type: "tel", placeholder: "+91 XXXXXXXXXX" },
//           { name: "address", label: "Address", type: "text", placeholder: "Address" },
//           { name: "email", label: "Email Address", type: "email", placeholder: "Email" },
//           { name: "education", label: "Education Qualification", type: "text", placeholder: "Education" },
//           { name: "parent_name", label: "Parent Name", type: "text", placeholder: "Parent Name" },
//           { name: "parent_mobile", label: "Parent Mobile Number", type: "tel", placeholder: "+91 XXXXXXXXXX" },
//           { name: "parent_occupation", label: "Parent Occupation", type: "text", placeholder: "Occupation" },
//         ].map(({ name, label, type, placeholder, max }) => (
//           <div key={name}>
//             <Label htmlFor={name} value={label} className="mb-2 block" />
//             <TextInput
//               name={name}
//               type={type}
//               onChange={handleChange}
//               required
//               max={max}
//               value={formData[name as keyof FormDataType] as string}
//               placeholder={placeholder}
//             />
//             {errors[name] && <p className="text-red-600 text-sm">{errors[name]}</p>}
//           </div>
//         ))}

//         {/* Gender */}
//         <div className="selectradius " >
//           <Label htmlFor="gender" value="Gender" className="mb-2 block" />
//           <Select name="gender" onChange={handleChange} required value={formData.gender} >
//             <option value="">Select Gender</option>
//             <option value="Male">Male</option>
//             <option value="Female">Female</option>
//             <option value="Other">Other</option>
//           </Select>
//           {errors.gender && <p className="text-red-600 text-sm">{errors.gender}</p>}
//         </div>

//         {/* Photo */}
//         <div>
//           <Label htmlFor="photo" value="Upload Photo" className="mb-2 block" />
//           <FileInput name="photo" onChange={handleChange} accept="image/*" />
//           {errors.photo && <p className="text-red-600 text-sm">{errors.photo}</p>}
//         </div>
//       </div>

//       <p className="text-lg font-semibold mt-4">
//         Total Fees: ₹{totalFees.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
//       </p>

//       <div className="flex justify-end gap-4 mt-6">
//         <Button type="submit" color="primary">Submit</Button>
//         <Button type="button" color="gray" onClick={handleReset}>Reset</Button>
//       </div>
//     </form>
//     </>
//   );

// };

// export default StudentForm;
import { Label, TextInput, Select, Button, FileInput } from "flowbite-react";
import { useEffect, useState } from "react";
import axios from "axios";
import ReactSelect from "react-select";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

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
  gender: string;
  dob: string;
  admission_date: string;
  mobile_no: string;
  address: string;
  email: string;
  photo: File | null;
  education: string;
  parent_name: string;
  parent_mobile: string;
  parent_occupation: string;
  selectedCourses: CourseOption[]; // ✅ Fixed: Changed from CourseOption | null
  selectedBatch: BatchOption | null;
};

const StudentForm = () => {
  const initialFormData: FormDataType = {
    name: "",
    gender: "",
    dob: "",
    admission_date: "",
    mobile_no: "",
    address: "",
    email: "",
    photo: null,
    education: "",
    parent_name: "",
    parent_mobile: "",
    parent_occupation: "",
    selectedCourses: [], // ✅ Fixed: Initialized as empty array
    selectedBatch: null,
  };

  const [formData, setFormData] = useState<FormDataType>(initialFormData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [batchOptions, setBatchOptions] = useState<BatchOption[]>([]);
  const [totalFees, setTotalFees] = useState(0);
  const token = localStorage.getItem("token");

  const MySwal = withReactContent(Swal);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchCourses = async () => {
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

  useEffect(() => {
    const fetchFilteredBatches = async () => {
      if (formData.selectedCourses.length === 0) {
        setBatchOptions([]);
        setFormData((prev) => ({ ...prev, selectedBatch: null }));
        return;
      }

      try {
        const courseNames = formData.selectedCourses.map((c) => c.value);
        const res = await axios.post(
          "http://localhost:7000/api/batches/filter",
          { courses: courseNames },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const formatted = res.data.map((batch: any) => ({
          value: batch.id.toString(),
          label: `${batch.batch_name} (${batch.batch_type}) [${batch.time_from} - ${batch.time_to}]`,
          batch_name: batch.batch_name,
          batch_type: batch.batch_type,
          time_from: batch.time_from,
          time_to: batch.time_to,
        }));

        setBatchOptions(formatted);
        setFormData((prev) => ({ ...prev, selectedBatch: null }));
      } catch (err) {
        console.error("Failed to fetch filtered batches", err);
      }
    };

    fetchFilteredBatches();
  }, [formData.selectedCourses]);

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    if (type === "file") {
      const files = e.target.files;
      setFormData({
        ...formData,
        [name]: files && files.length > 0 ? files[0] : null,
      });
    } else {
      const cleanValue =
        name === "mobile_no" || name === "parent_mobile"
          ? value.replace(/^\+91/, "").slice(0, 10)
          : value;
      setFormData({ ...formData, [name]: cleanValue });
    }
  };

  const handleBatchSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = batchOptions.find((b) => b.value === e.target.value);
    setFormData((prev) => ({
      ...prev,
      selectedBatch: selected || null,
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.dob) newErrors.dob = "Date of Birth is required";
    if (!formData.admission_date) newErrors.admission_date = "Admission Date is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!/^\d{10}$/.test(formData.mobile_no)) newErrors.mobile_no = "Mobile number must be 10 digits";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.education.trim()) newErrors.education = "Education is required";
    if (!formData.parent_name.trim()) newErrors.parent_name = "Parent name is required";
    if (!/^\d{10}$/.test(formData.parent_mobile)) newErrors.parent_mobile = "Parent mobile must be 10 digits";
    if (!formData.parent_occupation.trim()) newErrors.parent_occupation = "Parent occupation is required";
    if (formData.selectedCourses.length === 0) newErrors.selectedCourses = "Select at least one course";
    if (!formData.selectedBatch) newErrors.selectedBatch = "Select a batch";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("gender", formData.gender);
      data.append("dob", formData.dob);
      data.append("admission_date", formData.admission_date);
      data.append("mobile_no", "+91" + formData.mobile_no);
      data.append("address", formData.address);
      data.append("email", formData.email);
      data.append("education", formData.education);
      data.append("parent_name", formData.parent_name);
      data.append("parent_mobile", "+91" + formData.parent_mobile);
      data.append("parent_occupation", formData.parent_occupation);
      if (formData.photo) data.append("photo", formData.photo);

      const courseIds = formData.selectedCourses.map((c) => c.id);
      data.append("courses_id", JSON.stringify(courseIds));

      if (formData.selectedBatch) {
        data.append("batch_id", formData.selectedBatch.value);
        data.append(
          "batch_details",
          `${formData.selectedBatch.batch_name} (${formData.selectedBatch.batch_type}) [${formData.selectedBatch.time_from} - ${formData.selectedBatch.time_to}]`
        );
      }

      await axios.post("http://localhost:7000/api/students/create", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      MySwal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Student added successfully!",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });

      setFormData(initialFormData);
      setTotalFees(0);
      setErrors({});
    } catch (err) {
      console.error("Failed to submit form", err);
      MySwal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Failed to submit form",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setTotalFees(0);
    setErrors({});
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl shadow-md bg-white p-6 w-full form-control form-rounded-xl"
    >
      <h5 className="text-2xl font-bold mb-6">
        Student <span className="text-blue-700">Admission</span> Form
      </h5>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Courses */}
        <div className="md:col-span-2">
          <Label value="Select Courses" className="mb-2 block" />
          <ReactSelect
            options={courseOptions}
            isMulti
            onChange={(selectedOptions) => {
              const selected = selectedOptions as CourseOption[];
              setFormData((prev) => ({
                ...prev,
                selectedCourses: selected || [],
              }));
              const total = selected ? selected.reduce((sum, c) => sum + c.fees, 0) : 0;
              setTotalFees(total);
            }}
            value={formData.selectedCourses}
            placeholder="Select Courses"
          />
          {errors.selectedCourses && <p className="text-red-600 text-sm">{errors.selectedCourses}</p>}
        </div>

        {/* Batch */}
        <div className="selectradius">
          <Label htmlFor="batchSelect" value="Select Batch" className="mb-2 block" />
          <Select
            id="batchSelect"
            name="batchSelect"
            required
            onChange={handleBatchSelect}
            value={formData.selectedBatch?.value || ""}
          >
            <option value="">-- Select a Batch --</option>
            {batchOptions.map((batch) => (
              <option key={batch.value} value={batch.value}>
                {batch.label}
              </option>
            ))}
          </Select>
          {errors.selectedBatch && <p className="text-red-600 text-sm">{errors.selectedBatch}</p>}
        </div>

        {/* Input Fields */}
        {[
          { name: "name", label: "Student Name", type: "text", placeholder: "Name" },
          { name: "dob", label: "Date of Birth", type: "date", max: today },
          { name: "admission_date", label: "Admission Date", type: "date", max: today },
          { name: "mobile_no", label: "Mobile Number", type: "tel", placeholder: "+91 XXXXXXXXXX" },
          { name: "address", label: "Address", type: "text", placeholder: "Address" },
          { name: "email", label: "Email Address", type: "email", placeholder: "Email" },
          { name: "education", label: "Education Qualification", type: "text", placeholder: "Education" },
          { name: "parent_name", label: "Parent Name", type: "text", placeholder: "Parent Name" },
          { name: "parent_mobile", label: "Parent Mobile Number", type: "tel", placeholder: "+91 XXXXXXXXXX" },
          { name: "parent_occupation", label: "Parent Occupation", type: "text", placeholder: "Occupation" },
        ].map(({ name, label, type, placeholder, max }) => (
          <div key={name}>
            <Label htmlFor={name} value={label} className="mb-2 block" />
            <TextInput
              name={name}
              type={type}
              onChange={handleChange}
              required
              max={max}
              value={formData[name as keyof FormDataType] as string}
              placeholder={placeholder}
            />
            {errors[name] && <p className="text-red-600 text-sm">{errors[name]}</p>}
          </div>
        ))}

        {/* Gender */}
        <div className="selectradius">
          <Label htmlFor="gender" value="Gender" className="mb-2 block" />
          <Select name="gender" onChange={handleChange} required value={formData.gender}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </Select>
          {errors.gender && <p className="text-red-600 text-sm">{errors.gender}</p>}
        </div>

        {/* Photo */}
        <div>
          <Label htmlFor="photo" value="Upload Photo" className="mb-2 block" />
          <FileInput name="photo" onChange={handleChange} accept="image/*" />
          {errors.photo && <p className="text-red-600 text-sm">{errors.photo}</p>}
        </div>
      </div>

      <p className="text-lg font-semibold mt-4">
        Total Fees: ₹{totalFees.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </p>

      <div className="flex justify-end gap-4 mt-6">
        <Button type="submit" color="primary">Submit</Button>
        <Button type="button" color="gray" onClick={handleReset}>Reset</Button>
      </div>
    </form>
  );
};

export default StudentForm;
