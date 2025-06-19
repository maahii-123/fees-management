

import { useState, useEffect } from "react";
import axios from "axios";
import DataTable, { TableColumn } from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import 'bootstrap-icons/font/bootstrap-icons.css';
import damiImage from "../../assets/dami.png";

// ✅ Interfaces
interface Student {
  id: number;
  student_id: string;
  name: string;
  gender: string;
  dob: string;
  admission_date: string;
  mobile_no: string;
  address: string;
  email: string;
  photo: string;
  education: string;
  courses: string;
  course_name:string;
  course_fees:string;
  batch_id: number;
  parent_name: string;
  parent_mobile: string;
  parent_occupation: string;
  total_fees: number;
}

interface Batch {
  id: number;
  batch_name: string;
}

interface Fee {
  id: number;
  student_id: string;
  course_name: string;
  amount: string;
  paid: string;
  balance: string;
  payment_date: string;
  discount: string;
  fine: string;
  mode: string;
}


const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const StudentTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [studentData, setStudentData] = useState<Student[]>([]);
  const [batchList, setBatchList] = useState<Batch[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get("http://localhost:7000/api/students/getall", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        const sorted = res.data.sort((a: Student, b: Student) =>
          new Date(b.admission_date).getTime() - new Date(a.admission_date).getTime()
        );
        setStudentData(sorted);
      })
      .catch((err) => console.error("Error fetching students:", err));
  }, []);

  useEffect(() => {
    axios.get("http://localhost:7000/api/batches/all", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setBatchList(res.data))
      .catch((err) => console.error("Error fetching batches:", err));
  }, []);

  const getBatchLabel = (batchId: number) => {
    const batch = batchList.find((b) => b.id === batchId);
    return batch ? batch.batch_name : "N/A";
  };

  const formatPhoneNumber = (phone: string) => {
    return phone ? `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}` : "N/A";
  };

  const formatDate = (date: string) => {
    const newDate = new Date(date);
    return newDate.toLocaleDateString("en-GB");
  };

  const deleteRecord = async (studentId: number) => {
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
        const res = await axios.delete(`http://localhost:7000/api/students/delete/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 200) {
          Toast.fire({ icon: "success", title: "Student deleted successfully!" });
          setStudentData((prev) => prev.filter((student) => student.id !== studentId));
        } else {
          Toast.fire({ icon: "error", title: "Failed to delete student" });
        }
      } catch (err) {
        console.error("Error deleting student:", err);
        Toast.fire({ icon: "error", title: "Server error" });
      }
    }
  };

  const filteredStudents = studentData.filter((student) => {
    const name = student.name || "";
    const studentId = student.student_id || "";
    const courseName = student.course_name || "";

    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      // courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentId.toLowerCase().includes(searchTerm.toLowerCase())||
      courseName.toLowerCase().includes(searchTerm.toLowerCase()) 
    );
  });

  const columns: TableColumn<Student>[] = [
    {
      name: "Student",
      selector: row => row.name,
      sortable: true,
      cell: row => {
        const firstName = row.name?.split(" ")[0] || "No Name";
        return (
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
            setSelectedStudent(row);
            setShowProfileModal(true);
          }}>
            <img
              src={row.photo ? `http://localhost:7000/uploads/${row.photo}` : damiImage}
              alt="student"
              className="h-10 w-10 object-cover rounded-full"
            />
            <div>
              <div className="font-semibold text-blue-600">{firstName}</div>
              <div className="text-xs text-gray-600">{row.student_id}</div>
            </div>
          </div>
        );
      },
    },
    {
      name: "Admission Date",
      selector: row => row.admission_date,
      sortable: true,
      cell: row => formatDate(row.admission_date),
    },
    {
      name: "Contact Info",
      cell: row => (
        <div>
          <div>{formatPhoneNumber(row.mobile_no)}</div>
          <div>{row.email}</div>
        </div>
      ),
    },
    {
      name: "Course/Batch",
      cell: row => {
       
        return (
          <div>
            <div>{row.course_name || "N/A"}</div>
            <div>{getBatchLabel(row.batch_id)}</div>
          </div>
        );
      },
    },
    {
      name: "Total Fees",
      selector: row => row.course_fees,
      sortable: true,
      cell: row => `₹${row.course_fees}`,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-3 text-gray-600 text-sm">
          <button
            onClick={() => navigate("/ui/update", { state: row })}
            className="text-blue-600 hover:text-blue-800"
          >
            <i className="bi bi-pencil text-sm"></i>
          </button>
          <button
            onClick={() => deleteRecord(row.id)}
            className="text-red-600 hover:text-blue-600"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      ),
    }
  ];

  const StudentProfileModal = ({
    student,
    onClose,
  }: {
    student: Student;
    onClose: () => void;
  }) => {
    const [feeList, setFeeList] = useState<Fee[]>([]);
    const [totalPaid, setTotalPaid] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalDiscount, setTotalDiscount] = useState(0);
    const [totalFine, setTotalFine] = useState(0);
  
    const token = localStorage.getItem("token");
  
    useEffect(() => {
      axios
        .get(`http://localhost:7000/api/fees/student/${student.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setFeeList(res.data);
          const paidSum = res.data.reduce(
            (sum: number, fee: Fee) => sum + parseFloat(fee.paid || "0"),
            0
          );
          const totalAmt = res.data.reduce(
            (sum: number, fee: Fee) => sum + parseFloat(fee.amount || "0"),
            0
          );
          const discountSum = res.data.reduce(
            (sum: number, fee: Fee) => sum + parseFloat(fee.discount || "0"),
            0
          );
          const fineSum = res.data.reduce(
            (sum: number, fee: Fee) => sum + parseFloat(fee.fine || "0"),
            0
          );
  
          setTotalPaid(paidSum);
          setTotalAmount(totalAmt);
          setTotalDiscount(discountSum);
          setTotalFine(fineSum);
        })
        .catch((err) => console.error("Error fetching fees:", err));
    }, [student.student_id]);
  
    const firstName = student.name?.split(" ")[0] || "No Name";
    const dueAmount = totalAmount - totalPaid - totalDiscount + totalFine;
  
    let courseName = "N/A";
    if (feeList.length > 0) {
      courseName = feeList[0].course_name || "N/A";
    }
  
    return (
      <div className="max-w-sm w-full bg-white p-6 rounded-lg shadow-lg relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-xl font-bold"
        >
          &times;
        </button>
  
        <div className="flex items-center space-x-4">
          <img
            src={
              student.photo
                ? `http://localhost:7000/uploads/${student.photo}`
                : damiImage
            }
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h2 className="text-lg font-semibold text-black">{firstName}</h2>
            <p className="text-sm text-black">{student.email}</p>
          </div>
        </div>
  
        <div className="mt-5 border-t-2 border-dotted my-5"></div>
  
        <div className="mt-5 space-y-3 text-sm text-black">
  <div className="flex justify-between">
    <span>📞 Mobile:</span>
    <span>{student.mobile_no}</span>
  </div>
  <div className="flex justify-between">
    <span>🗓️ Admission:</span>
    <span>{formatDate(student.admission_date)}</span>
  </div>
  <div className="flex justify-between">
    <span>🎓 Course:</span>
    <span>{courseName}</span>
  </div>
  <div className="flex justify-between">
    <span>📅 Batch:</span>
    <span>{getBatchLabel(student.batch_id)}</span>
  </div>
  <div className="flex justify-between">
    <span>💰 Total Fees:</span>
    <span>₹{totalAmount}</span>
  </div>

  {totalDiscount > 0 && (
    <div className="flex justify-between">
      <span>🎁 Discount:</span>
      <span className="text-green-600">₹{totalDiscount}</span>
    </div>
  )}

  {totalFine > 0 && (
    <div className="flex justify-between">
      <span>⚠️ Fine:</span>
      <span className="text-red-600">₹{totalFine}</span>
    </div>
  )}

  <div className="flex justify-between">
    <span>✅ Paid:</span>
    <span>₹{totalPaid}</span>
  </div>
  <div className="flex justify-between">
    <span>❌ Due:</span>
    <span className="text-red-600">₹{dueAmount}</span>
  </div>
</div>

  
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-2 text-gray-700">🧾 Fee History</h3>
          {feeList.length === 0 ? (
            <p className="text-xs text-gray-500">No payments found.</p>
          ) : (
            <ul className="text-sm space-y-1 max-h-40 overflow-y-auto pr-1 text-black">
              {feeList.map((fee) => (
                <li key={fee.id} className="flex justify-between text-sm">
                  <div>
                    {formatDate(fee.payment_date)} - {fee.course_name}
                  </div>
                  <div>
                    ₹{fee.paid} ({fee.mode})
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 rounded-xl shadow-md bg-white w-full relative">
      <h5 className="text-3xl mb-4">
        <span className="text-blue-600">Student</span> Table
      </h5>

      <div className="mb-4 max-w-sm">
        <input
          type="text"
          placeholder="Search by name, course, student ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded-md w-full"
        />
      </div>

      <DataTable
        title="Student Table List"
        columns={columns}
        data={filteredStudents}
        pagination
        highlightOnHover
        responsive
        customStyles={{
          rows: { style: { minHeight: "60px" } },
          headCells: { style: { fontWeight: "600", fontSize: "16px" } },
        }}
      />

      {showProfileModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <StudentProfileModal
            student={selectedStudent}
            onClose={() => setShowProfileModal(false)}
          />
        </div>
      )}
    </div>
  );
};

export default StudentTable;


