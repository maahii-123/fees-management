import { Label, TextInput, Button, Select } from "flowbite-react";
import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import "bootstrap-icons/font/bootstrap-icons.css"; // Bootstrap Icons

// Toast setup
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
});

// Batch type
interface Batch {
  id: number;
  batch_name: string;
  batch_type: string;
  time_from: string;
  time_to: string;
}

// Course type
interface Course {
  id: number;
  course_name: string;
  fees: number;
  batch_name: string;
  batch_type: string;
  time_from: string;
  time_to: string;
}

const CourseForm = () => {
  const formRef = useRef<HTMLFormElement>(null); // Ref for scrolling
  const [formData, setFormData] = useState({
    courseName: "",
    fees: "",
    batchName: "",
    batchType: "",
    timeFrom: "",
    timeTo: "",
    batchId: 0,
  });

  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const token = localStorage.getItem("token");
  useEffect(() => {
    const fetchBatches = async () => {
      try {
      const res = await fetch("http://localhost:7000/api/batches/all",{headers: {
        Authorization: `Bearer ${token}`,
      },});
        const data = await res.json();
        setBatches(data);
      } catch (error) {
        console.error("❌ Error fetching batches:", error);
      }
    };

    const fetchAllCourses = async () => {
      await fetchCourses();
    };

    fetchBatches();
    fetchAllCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch("http://localhost:7000/api/courses",{headers: {
        Authorization: `Bearer ${token}`,
      }});
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error("❌ Error fetching courses:", err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBatchSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBatch = batches.find(
      (b) => b.id === parseInt(e.target.value)
    );
    if (selectedBatch) {
      setFormData({
        ...formData,
        batchName: selectedBatch.batch_name,
        batchType: selectedBatch.batch_type,
        timeFrom: selectedBatch.time_from,
        timeTo: selectedBatch.time_to,
        batchId: selectedBatch.id,
      });
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      courseName: course.course_name,
      fees: course.fees.toString(),
      batchName: course.batch_name,
      batchType: course.batch_type,
      timeFrom: course.time_from,
      timeTo: course.time_to,
      batchId:
        batches.find((b) => b.batch_name === course.batch_name)?.id || 0,
    });

    // Scroll to form on edit
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`http://localhost:7000/api/courses/${id}`, {
          method: "DELETE", headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          Toast.fire({
            icon: "success",
            title: "Course deleted successfully!",
          });
          fetchCourses();
        } else {
          Toast.fire({
            icon: "error",
            title: "Failed to delete course",
          });
        }
      } catch (err) {
        console.error("Error deleting course:", err);
        Toast.fire({
          icon: "error",
          title: "Server error",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const courseData = {
      course_name: formData.courseName,
      fees: parseFloat(formData.fees),
      batch_id: formData.batchId,
    };

    try {
      const url = editingCourse
        ? `http://localhost:7000/api/courses/${editingCourse.id}`
        : "http://localhost:7000/api/courses";

      const method = editingCourse ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        
            "Authorization": `Bearer ${token}`,
          
        },
        body: JSON.stringify(courseData),
      });

      const data = await res.json();

      if (res.ok) {
        Toast.fire({
          icon: "success",
          title: `Course ${editingCourse ? "updated" : "added"} successfully!`,
        });
        setFormData({
          courseName: "",
          fees: "",
          batchName: "",
          batchType: "",
          timeFrom: "",
          timeTo: "",
          batchId: 0,
        });
        setEditingCourse(null);
        fetchCourses();
      } else {
        Toast.fire({
          icon: "error",
          title: `Failed: ${data.error}`,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Toast.fire({
        icon: "error",
        title: "Server error",
      });
    }
  };

  return (
    <div className="w-full">
      <form
        ref={formRef}
        className="rounded-xl shadow-md bg-white p-6 w-full form-control form-rounded-xl"
        onSubmit={handleSubmit}
      >
        <h5 className="text-2xl font-bold mb-6">
          Course{" "}
          <span className="text-blue-700 text-3xl">
            {editingCourse ? "Edit" : "Entry"}
          </span>{" "}
          Form
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="courseName" value="Course Name" className="mb-2 block" />
            <TextInput
              id="courseName"
              name="courseName"
              type="text"
              placeholder="Enter Course Name"
              required
              value={formData.courseName}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="fees" value="Fees (₹)" className="mb-2 block" />
            <TextInput
              id="fees"
              name="fees"
              type="number"
              placeholder="Enter Fees"
              required
              value={formData.fees}
              onChange={handleChange}
            />
          </div>

          <div className="selectradius">
            <Label htmlFor="batchSelect" value="Select Batch" className="mb-2 block" />
            <Select
              id="batchSelect"
              name="batchSelect"
              required
              onChange={handleBatchSelect}
              value={formData.batchId.toString()}
            >
              <option value="">-- Select a Batch --</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {`${batch.batch_name} (${batch.batch_type}) [${batch.time_from} - ${batch.time_to}]`}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="submit" color="primary">
            {editingCourse ? "Update" : "Submit"}
          </Button>
          <Button
            type="reset"
            color="gray"
            onClick={() => {
              setFormData({
                courseName: "",
                fees: "",
                batchName: "",
                batchType: "",
                timeFrom: "",
                timeTo: "",
                batchId: 0,
              });
              setEditingCourse(null);
            }}
          >
            Cancel
          </Button>
        </div>
      </form>

      {/* Directly Show Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4 my-6">
        <h2 className="text-xl font-bold mb-4">📋 Course List</h2>
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr className="border px-3 py-1" style={{ color: "#484343" }}>
              <th className="border px-4 py-2">Course Name</th>
              <th className="border px-4 py-2">Fees (₹)</th>
              <th className="border px-4 py-2">Batch Name</th>
              <th className="border px-4 py-2">Batch Type</th>
              <th className="border px-4 py-2">Time</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="border px-3 py-1" style={{ color: "#484343" }}>
                <td className="border px-4 py-2">{course.course_name}</td>
                <td className="border px-4 py-2">{course.fees}</td>
                <td className="border px-4 py-2">{course.batch_name}</td>
                <td className="border px-4 py-2">{course.batch_type}</td>
                <td className="border px-3 py-1 text-center">
                  {course.time_from} - {course.time_to}
                </td>
                <td className="border px-4 py-2 flex gap-4">
                  <button
                    onClick={() => handleEdit(course)}
                    className="text-primary hover:underline"
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                     className="text-red-600 hover:text-blue-600"
                  >
                    <i className="bi bi-trash3"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseForm;
// import { Label, TextInput, Button, Select } from "flowbite-react";
// import { useState, useEffect, useRef } from "react";
// import Swal from "sweetalert2";
// import "bootstrap-icons/font/bootstrap-icons.css"; // Bootstrap Icons

// // Toast setup
// const Toast = Swal.mixin({
//   toast: true,
//   position: "top-end",
//   showConfirmButton: false,
//   timer: 2500,
//   timerProgressBar: true,
// });

// // Batch type
// interface Batch {
//   id: number;
//   batch_name: string;
//   batch_type: string;
//   time_from: string;
//   time_to: string;
// }

// // Course type
// interface Course {
//   id: number;
//   course_name: string;
//   fees: number;
//   batch_name: string;
//   batch_type: string;
//   time_from: string;
//   time_to: string;
// }

// const CourseForm = () => {
//   const formRef = useRef<HTMLFormElement>(null); // Ref for scrolling
//   const [formData, setFormData] = useState({
//     courseName: "",
//     fees: "",
//     batchName: "",
//     batchType: "",
//     timeFrom: "",
//     timeTo: "",
//     batchId: 0,
//   });

//   const [batches, setBatches] = useState<Batch[]>([]);
//   const [courses, setCourses] = useState<Course[]>([]);
//   const [editingCourse, setEditingCourse] = useState<Course | null>(null);

//   // Fetch batches and courses on mount
//   useEffect(() => {
//     const fetchBatches = async () => {
//       try {
//         const res = await fetch("http://localhost:7000/api/batches/all");
//         if (!res.ok) throw new Error("Failed to fetch batches");
//         const data = await res.json();
//         setBatches(data);
//       } catch (error) {
//         console.error("❌ Error fetching batches:", error);
//       }
//     };

//     const fetchCourses = async () => {
//       try {
//         const res = await fetch("http://localhost:7000/api/courses");
//         if (!res.ok) throw new Error("Failed to fetch courses");
//         const data = await res.json();
//         setCourses(data);
//       } catch (err) {
//         console.error("❌ Error fetching courses:", err);
//       }
//     };

//     fetchBatches();
//     fetchCourses();
//   }, []);

//   // Handle form input change
//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   // When batch selected, update batch-related form data
//   const handleBatchSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const selectedBatch = batches.find(
//       (b) => b.id === parseInt(e.target.value)
//     );
//     if (selectedBatch) {
//       setFormData((prev) => ({
//         ...prev,
//         batchName: selectedBatch.batch_name,
//         batchType: selectedBatch.batch_type,
//         timeFrom: selectedBatch.time_from,
//         timeTo: selectedBatch.time_to,
//         batchId: selectedBatch.id,
//       }));
//     } else {
//       // Reset batch info if none selected
//       setFormData((prev) => ({
//         ...prev,
//         batchName: "",
//         batchType: "",
//         timeFrom: "",
//         timeTo: "",
//         batchId: 0,
//       }));
//     }
//   };

//   // On Edit click: fill form with course data
//   const handleEdit = (course: Course) => {
//     setEditingCourse(course);
//     // Try to find batch by batch_name
//     const matchedBatch = batches.find(
//       (b) => b.batch_name === course.batch_name
//     );
//     setFormData({
//       courseName: course.course_name,
//       fees: course.fees.toString(),
//       batchName: course.batch_name,
//       batchType: course.batch_type,
//       timeFrom: course.time_from,
//       timeTo: course.time_to,
//       batchId: matchedBatch ? matchedBatch.id : 0,
//     });

//     formRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   // On Delete click: confirm and delete course
//   const handleDelete = async (id: number) => {
//     const result = await Swal.fire({
//       title: "Are you sure?",
//       text: "You won't be able to revert this!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Yes, delete it!",
//       cancelButtonText: "Cancel",
//     });

//     if (result.isConfirmed) {
//       try {
//         const res = await fetch(`http://localhost:7000/api/courses/${id}`, {
//           method: "DELETE",
//         });

//         if (res.ok) {
//           Toast.fire({
//             icon: "success",
//             title: "Course deleted successfully!",
//           });
//           // Refresh list
//           const updatedRes = await fetch("http://localhost:7000/api/courses");
//           const updatedData = await updatedRes.json();
//           setCourses(updatedData);
//         } else {
//           Toast.fire({
//             icon: "error",
//             title: "Failed to delete course",
//           });
//         }
//       } catch (err) {
//         console.error("Error deleting course:", err);
//         Toast.fire({
//           icon: "error",
//           title: "Server error",
//         });
//       }
//     }
//   };

//   // Form submit: Add or Update course
//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     // Validate batch selection
//     if (!formData.batchId) {
//       Toast.fire({
//         icon: "error",
//         title: "Please select a batch",
//       });
//       return;
//     }

//     const courseData = {
//       course_name: formData.courseName.trim(),
//       fees: parseFloat(formData.fees),
//       batch_id: formData.batchId,
//     };

//     try {
//       const url = editingCourse
//         ? `http://localhost:7000/api/courses/${editingCourse.id}`
//         : "http://localhost:7000/api/courses";

//       const method = editingCourse ? "PUT" : "POST";

//       const res = await fetch(url, {
//         method,
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(courseData),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         Toast.fire({
//           icon: "success",
//           title: `Course ${editingCourse ? "updated" : "added"} successfully!`,
//         });
//         // Reset form
//         setFormData({
//           courseName: "",
//           fees: "",
//           batchName: "",
//           batchType: "",
//           timeFrom: "",
//           timeTo: "",
//           batchId: 0,
//         });
//         setEditingCourse(null);

//         // Refresh courses list
//         const refreshedRes = await fetch("http://localhost:7000/api/courses");
//         const refreshedData = await refreshedRes.json();
//         setCourses(refreshedData);
//       } else {
//         Toast.fire({
//           icon: "error",
//           title: `Failed: ${data.error || "Unknown error"}`,
//         });
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       Toast.fire({
//         icon: "error",
//         title: "Server error",
//       });
//     }
//   };

//   return (
//     <div className="w-full max-w-5xl mx-auto p-4">
//       <form
//         ref={formRef}
//         className="rounded-xl shadow-md bg-white p-6 w-full form-control"
//         onSubmit={handleSubmit}
//       >
//         <h5 className="text-2xl font-bold mb-6">
//           Course{" "}
//           <span className="text-blue-700 text-3xl">
//             {editingCourse ? "Edit" : "Entry"}
//           </span>{" "}
//           Form
//         </h5>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Course Name */}
//           <div>
//             <Label
//               htmlFor="courseName"
//               value="Course Name"
//               className="mb-2 block"
//             />
//             <TextInput
//               id="courseName"
//               name="courseName"
//               type="text"
//               placeholder="Enter Course Name"
//               required
//               value={formData.courseName}
//               onChange={handleChange}
//             />
//           </div>

//           {/* Fees */}
//           <div>
//             <Label htmlFor="fees" value="Fees (₹)" className="mb-2 block" />
//             <TextInput
//               id="fees"
//               name="fees"
//               type="number"
//               placeholder="Enter Fees"
//               min={0}
//               step="0.01"
//               required
//               value={formData.fees}
//               onChange={handleChange}
//             />
//           </div>

//           {/* Batch select */}
//           <div className="selectradius md:col-span-2">
//             <Label
//               htmlFor="batchSelect"
//               value="Select Batch"
//               className="mb-2 block"
//             />
//             <Select
//               id="batchSelect"
//               name="batchSelect"
//               required
//               onChange={handleBatchSelect}
//               value={formData.batchId.toString() || ""}
//             >
//               <option value="">-- Select a Batch --</option>
//               {batches.map((batch) => (
//                 <option key={batch.id} value={batch.id}>
//                   {`${batch.batch_name} (${batch.batch_type}) [${batch.time_from} - ${batch.time_to}]`}
//                 </option>
//               ))}
//             </Select>
//           </div>

//           {/* Batch info display */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-2">
//             <div>
//               <Label value="Batch Name" />
//               <TextInput
//                 readOnly
//                 value={formData.batchName}
//                 className="bg-gray-100 cursor-not-allowed"
//               />
//             </div>
//             <div>
//               <Label value="Batch Type" />
//               <TextInput
//                 readOnly
//                 value={formData.batchType}
//                 className="bg-gray-100 cursor-not-allowed"
//               />
//             </div>
//             <div>
//               <Label value="Time" />
//               <TextInput
//                 readOnly
//                 value={`${formData.timeFrom} - ${formData.timeTo}`}
//                 className="bg-gray-100 cursor-not-allowed"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Buttons */}
//         <div className="flex gap-4 mt-6">
//           <Button type="submit" color="success" className="w-full md:w-auto">
//             {editingCourse ? "Update" : "Add"} Course
//           </Button>

//           <Button
//             type="button"
//             color="light"
//             className="w-full md:w-auto"
//             onClick={() => {
//               setEditingCourse(null);
//               setFormData({
//                 courseName: "",
//                 fees: "",
//                 batchName: "",
//                 batchType: "",
//                 timeFrom: "",
//                 timeTo: "",
//                 batchId: 0,
//               });
//             }}
//           >
//             Cancel
//           </Button>
//         </div>
//       </form>

//       {/* Courses Table */}
//       <div className="w-full max-w-7xl mx-auto my-8 overflow-auto">
//         <h4 className="text-xl font-semibold mb-4">Courses List</h4>
//         <table className="table-auto w-full border border-gray-300 rounded-md overflow-hidden">
//           <thead className="bg-blue-700 text-white">
//             <tr>
//               <th className="p-3 border border-gray-300">#</th>
//               <th className="p-3 border border-gray-300">Course Name</th>
//               <th className="p-3 border border-gray-300">Fees (₹)</th>
//               <th className="p-3 border border-gray-300">Batch Name</th>
//               <th className="p-3 border border-gray-300">Batch Type</th>
//               <th className="p-3 border border-gray-300">Time</th>
//               <th className="p-3 border border-gray-300 text-center">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {courses.length === 0 && (
//               <tr>
//                 <td
//                   colSpan={7}
//                   className="p-4 text-center text-gray-500 italic"
//                 >
//                   No courses found.
//                 </td>
//               </tr>
//             )}

//             {courses.map((course, idx) => (
//               <tr
//                 key={course.id}
//                 className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
//               >
//                 <td className="p-3 border border-gray-300">{idx + 1}</td>
//                 <td className="p-3 border border-gray-300">{course.course_name}</td>
//                 <td className="p-3 border border-gray-300">{course.fees}</td>
//                 <td className="p-3 border border-gray-300">{course.batch_name}</td>
//                 <td className="p-3 border border-gray-300">{course.batch_type}</td>
//                 <td className="p-3 border border-gray-300">{`${course.time_from} - ${course.time_to}`}</td>
//                 <td className="p-3 border border-gray-300 text-center">
//                   <button
//                     className="text-green-600 mr-4 hover:text-green-900"
//                     onClick={() => handleEdit(course)}
//                     title="Edit"
//                     aria-label={`Edit course ${course.course_name}`}
//                   >
//                     <i className="bi bi-pencil-square text-xl"></i>
//                   </button>
//                   <button
//                     className="text-red-600 hover:text-red-900"
//                     onClick={() => handleDelete(course.id)}
//                     title="Delete"
//                     aria-label={`Delete course ${course.course_name}`}
//                   >
//                     <i className="bi bi-trash text-xl"></i>
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default CourseForm;
