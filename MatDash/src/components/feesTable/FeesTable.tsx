import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import Swal from "sweetalert2";
import FeesForm from "../forms/FeesForm";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Card, Modal, Button, Label, TextInput, Progress } from "flowbite-react";
// import newmoon from "../../assets/new.gif";
import damiImage from "../../assets/dami.png";

const FeesTable = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [feesDetails, setFeesDetails] = useState<any[]>([]);
  const [editingFee, setEditingFee] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showFeesForm, setShowFeesForm] = useState(false);
  
  const token = localStorage.getItem("token");
const [selectedStudentId, setSelectedStudentId] = useState(null);

  useEffect(() => {
    fetchStudents();
    fetchCourses();
    refreshData();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:7000/api/students/getall",{headers: {
        Authorization: `Bearer ${token}`,
      }});
      setStudents(res.data);
    } catch (error) {
      console.error("Failed to fetch students", error);
    }
  };

  const refreshData = async () => {
    if (selectedStudentId) {
      await handleStudentSelect(selectedStudentId); // already defined
    }
  };
  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:7000/api/courses",{headers: {
        Authorization: `Bearer ${token}`,
      }});
      setCourses(res.data);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    }
  };

  const handleStudentSelect = async (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    setStudentDetails(student);
  
    try {
      const res = await axios.get(`http://localhost:7000/api/fees/student/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
  
      // Sort descending by payment_date
      const sortedFees = res.data.sort((a: any, b: any) => 
  new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
);

      setFeesDetails(sortedFees);
    } catch (error) {
      console.error("Failed to fetch fees for student", error);
      setFeesDetails([]);
    }
  };
  

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  
  const handleDeleteFee = async (feeId: string) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this fee record?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`http://localhost:7000/api/fees/delete/${feeId}`,{headers: {
          Authorization: `Bearer ${token}`,
        }});
        setFeesDetails(feesDetails.filter((fee) => fee.id !== feeId));

        Swal.fire({
          title: "Deleted!",
          text: "Fee record deleted successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Failed to delete fee record.",
          icon: "error",
        });
      }
    }
  };

  const handleEditFee = (fee: any) => {
    setEditingFee({ ...fee });
    setShowModal(true);
  };

  const calculateBalance = (fee: any) => {
    const amount = parseFloat(fee.amount) || 0;
    const paid = parseFloat(fee.paid) || 0;
    const discount = parseFloat(fee.discount) || 0;
    const fine = parseFloat(fee.fine) || 0;
    const balance = amount - (paid + discount) + fine;
    return balance < 0 ? 0 : balance;
  };

  const handleEditChange = (e: any) => {
    const { name, value } = e.target;
    const updatedFee = { ...editingFee, [name]: value };
    if (["amount", "paid", "discount", "fine"].includes(name)) {
      updatedFee.balance = calculateBalance(updatedFee);
    }
    setEditingFee(updatedFee);
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(`http://localhost:7000/api/fees/update/${editingFee.id}`, editingFee,{headers: {
        Authorization: `Bearer ${token}`,
      }});
      setFeesDetails(
        feesDetails.map((fee) => (fee.id === editingFee.id ? editingFee : fee))
      );
      setShowModal(false);
      Swal.fire({
        title: "Success!",
        text: "Fee updated successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: "Failed to update fee.",
        icon: "error",
      });
    }
  };

  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
  
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  // const latestFee = feesDetails.reduce((latest, fee) => {
  //   return new Date(fee.payment_date) > new Date(latest.payment_date) ? fee : latest;
  // }, feesDetails[0] || {});

  // const latestPaymentId = latestFee?.id;

  const studentOptions = students.map((student) => ({
    value: student.id,
    label: `${student.student_id} - ${student.name}`,
  }));

  const totalAmount = feesDetails.reduce((sum, fee) => sum + Number(fee.amount || 0), 0);
  const totalPaid = feesDetails.reduce((sum, fee) => sum + Number(fee.paid || 0), 0);
  const totalDue = feesDetails.reduce((sum, fee) => sum + Number(fee.balance || 0), 0);

  const percentagePaid = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

  // Dynamic color based on paid percentage
  const getProgressColor = (percentage: number) => {
    if (percentage < 30) return "red";
    if (percentage < 70) return "yellow";
    return "green";
  };

  return (
    <div className="bg-white p-6 shadow-lg rounded-xl w-90%">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">🔍 Search Student</h2>

      <Select
        options={studentOptions}
        placeholder="Search and select student"
        onChange={(option) => {
          if (option?.value) handleStudentSelect(option.value);
        }}
           styles={{
              control: (base) => ({
                ...base,
                minHeight: '42px',
                height: '42px',
                padding: '0 8px',
                borderRadius: '0.5rem',
                borderColor: '#d1d5db',
                boxShadow: 'none',
                '&:hover': {
                  borderColor: '#a1a1aa',
                },
              }),
              valueContainer: (base) => ({
                ...base,
                padding: '0px',
              }),
              input: (base) => ({
                ...base,
                margin: '0px',
              }),
            }}
      />

      {studentDetails && (
        <div className="flex items-center justify-between bg-[#fdf8f3] shadow-md rounded-2xl p-6 mt-6">
          <div className="flex items-center gap-6">
          <img
        src={studentDetails?.photo ? `http://localhost:7000/uploads/${studentDetails.photo}` : damiImage}
        alt="student"
        className="h-10 w-10 object-cover rounded-full"
      />
            <div>
              <h2 className="text-xl font-bold text-gray-800">{studentDetails.name}</h2>
              <p className="text-gray-600">@{studentDetails.student_id}</p>
              <p className="text-gray-500 mt-1">
                {studentDetails.email || "Student email not available"}
              </p>
              <p className="text-lg font-semibold text-gray-800">
                {studentDetails.mobile_no}
              </p>
            </div>
          </div>
          <div className="text-right w-full max-w-xs">
            <p className="text-sm text-gray-600 mb-2">Fees Status</p>
            <div className="flex justify-end"><Progress
            
              progress={percentagePaid}
              color={getProgressColor(percentagePaid)}
              style={{ width: '200px', height: '8px', }}
              className="mb-2 "
            /></div>
            <p className="text-sm text-gray-800 font-semibold">{percentagePaid}% Paid</p>
            <p className="text-md font-semibold text-gray-800 mt-2">
              Total Due: <span className="text-red-600">₹{totalDue}</span>
            </p>
            <button
           onClick={() => {
          setSelectedStudentId(studentDetails.id); // 👈 student ID set karo
         setShowFeesForm(true); // 👈 Modal open karo
             }}
           className="mt-2 bg-blue-900 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-800"
              >
            Pay Amount
           </button>

          </div>
        </div>
      )}
         
         <Modal
  show={showFeesForm}
  onClose={() => setShowFeesForm(false)}
  size="4xl"       // width ko kaafi bada kar diya (4xl ya xl bhi kar sakte ho)
  popup
  className="rounded-2xl shadow-xl"
>
  <Modal.Header>New Fee Entry</Modal.Header>
  
    <FeesForm
      studentId={selectedStudentId}
      onRefresh={refreshData}
      setShowFeesForm={() => setShowFeesForm(false)}
      onClose={() => setShowFeesForm(false)}
    />
  
</Modal>

{feesDetails.length > 0 && (
        <div className="mt-4 p-4 bg-gray-100 rounded-xl shadow flex justify-between text-lg font-semibold text-gray-800">
          <div>Total Amount: <span className="text-blue-700">₹{totalAmount}</span></div>
          <div>Total Paid: <span className="text-green-700">₹{totalPaid}</span></div>
          <div>Total Due: <span className="text-red-600">₹{totalDue}</span></div>
        </div>
      )}
      {feesDetails.length > 0 && (
        <Card className="mt-4">
          <h3 className="text-xl font-bold text-green-600 mb-4">💳 Fee Transactions</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr className="border px-3 py-1" style={{ color: "#484343" }}>
                  <th className="px-4 py-2 text-left font-semibold">#</th>
                  <th className="px-4 py-2 text-left font-semibold">Course</th>
                  <th className="px-4 py-2 text-left font-semibold">Amount</th>
                  <th className="px-4 py-2 text-left font-semibold">Paid</th>
                  <th className="px-4 py-2 text-left font-semibold">Discount</th>
                  <th className="px-4 py-2 text-left font-semibold">Fine</th>
                  <th className="px-4 py-2 text-left font-semibold">Due</th>
                  <th className="px-4 py-2 text-left font-semibold">Mode</th>
                  <th className="px-4 py-2 text-left font-semibold">Date</th>
                  <th className="px-4 py-2 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {feesDetails.map((fee, index) => (
                 <tr
                 key={fee.id || index}
                 className={`border px-3 py-1 ${isToday(fee.payment_date) ? "bg-yellow-100 font-semibold" : ""}`}
                 style={{ color: "#484343" }}
               >
               
                    <td className="px-4 py-2 ">
                  <span>{index + 1}</span>
                
                       </td>
                    <td className="px-4 py-2">
                      {courses.find((c) => c.name === fee.course_id)?.course_name || "N/A"}
                    </td>
                    <td className="px-4 py-2">₹{fee.amount}</td>
                    <td className="px-4 py-2">₹{fee.paid}</td>
                    <td className="px-4 py-2">₹{fee.discount}</td>
                    <td className="px-4 py-2">₹{fee.fine}</td>
                    <td className="px-4 py-2">₹{fee.balance}</td>
                    <td className="px-4 py-2">{fee.mode}</td>
                    <td className="px-4 py-2">{formatDateTime(fee.payment_date)}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        onClick={() => handleEditFee(fee)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteFee(fee.id)}
                        className="text-red-600 hover:text-blue-600"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>Edit Fee</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            {["amount", "paid", "discount", "fine", "balance", "mode"].map((field) => (
              <div key={field}>
                <Label value={field.charAt(0).toUpperCase() + field.slice(1)} />
                <TextInput
                  name={field}
                  value={editingFee?.[field] || ""}
                  onChange={handleEditChange}
                  readOnly={field === "balance"}
                />
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleEditSubmit}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FeesTable;