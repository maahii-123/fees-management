


import { useEffect, useState } from "react";
import {
  Label,
  TextInput,
  Select as FlowbiteSelect,
  Button,
  Modal,
} from "flowbite-react";
import axios from "axios";
import Select from "react-select";
import Swal from "sweetalert2";
import successImage from "../../assets/success.png"; // Your success image

type OptionType = {
  value: any;
  label: string;
  fees?: number;
  phone?: string;
};

interface FormData {
  student_id: string;
  course_name: string;
  amount: string;
  mode: string;
  payment_date: string;
  discount: string;
  fine: string;
  paid: string;
};
interface FeesFormProps {
  onRefresh?: () => void;
  setShowFeesForm?: () => void;
}


const FeesForm: React.FC<FeesFormProps> = ({ onRefresh = () => {},setShowFeesForm = () => {}}) => {
  const [students, setStudents] = useState<OptionType[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<OptionType[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<OptionType | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<OptionType | null>(null);
  const [receiptData, setReceiptData] = useState<FormData | null>(null);
  const [receiptStudentName, setReceiptStudentName] = useState<string>("");
  const [receiptCourseName, setReceiptCourseName] = useState<string>("");
  const [receiptPhoneNumber, setReceiptPhoneNumber] = useState<string>("");
  
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState<FormData>({
    student_id: "",
    course_name: "",
    amount: "",
    mode: "",
    payment_date: "",
    discount: "0",
    fine: "0",
    paid: "0",
  });

  const currentDate = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const now = new Date();
    const date = now.toISOString().split("T")[0];
  
    const hour = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = (hour % 12 || 12).toString().padStart(2, "0");
  
    const time12hr = `${hour12}:${minutes} ${ampm}`;
  
    setFormData((prev) => ({
      ...prev,
      payment_date: `${date} ${time12hr}`,
    }));
  }, []);
  const getCurrentTime12hr = () => {
    const now = new Date();
    let hour = now.getHours();
    const minute = now.getMinutes().toString().padStart(2, "0");
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    const hourStr = hour.toString().padStart(2, "0");
    return `${hourStr}:${minute} ${ampm}`;
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:7000/api/students/getall",{headers: {
        Authorization: `Bearer ${token}`,
      }});
      // Map students for react-select format
      const studentOpts = res.data.map((student: any) => ({
        value: student.id,
        label: `${student.student_id} - ${student.name}`,
        phone: student.phone,
        name: student.name,
      }));
      setStudents(studentOpts);
    } catch (error) {
      console.error("❌ Error fetching students:", error);
      Swal.fire("Error", "Failed to load students", "error");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // For numeric fields, ensure they are positive or zero strings
    if (
      ["discount", "fine", "paid"].includes(name) &&
      (value === "" || /^[0-9]*\.?[0-9]*$/.test(value))
    ) {
      setFormData({
        ...formData,
        [name]: value,
      });
    } else if (!["discount", "fine", "paid"].includes(name)) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const amount = parseFloat(formData.amount) || 0;
    const discount = parseFloat(formData.discount) || 0;
    const fine = parseFloat(formData.fine) || 0;
    const paid = parseFloat(formData.paid) || 0;
    const totalPayable = amount - discount + fine;

    if (paid > totalPayable) {
      Swal.fire({
        icon: "warning",
        title: "Paid amount exceeds total payable!",
        text: `Maximum you can pay is ₹${totalPayable.toFixed(2)}.`,
      });
      return;
    }

    if (!formData.student_id || !formData.course_name || !formData.mode || !formData.payment_date) {
      Swal.fire("Error", "Please fill all required fields", "error");
      return;
    }

    try {
      // Submit to your backend
      await axios.post("http://localhost:7000/api/fees/create", formData,{headers: {
        Authorization: `Bearer ${token}`,
      }});

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Fees data submitted successfully!",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      onRefresh();
      setShowFeesForm();
      setReceiptData(formData);
      setReceiptStudentName(selectedStudent?.label || "");
      setReceiptCourseName(selectedCourse?.label || "");
      setReceiptPhoneNumber(selectedStudent?.phone || "");
      resetForm();
    } catch (err) {
      console.error("❌ Submission failed:", err);
      Swal.fire({
        icon: "error",
        title: "❌ Submission Failed!",
        text: "Something went wrong while submitting.",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: "",
      course_name: "",
      amount: "",
      mode: "",
      payment_date: "",
      discount: "0",
      fine: "0",
      paid: "0",
    });
    setSelectedStudent(null);
    setSelectedCourse(null);
    setFilteredCourses([]);
  };

  const sendToWhatsApp = async () => {
    if (!receiptData || !receiptPhoneNumber) return;
    const message = `
🧾 *Fees Receipt*
👤 Student: ${receiptStudentName}
📘 Course: ${receiptCourseName}
💰 Amount: ₹${receiptData.amount}
💸 Discount: ₹${receiptData.discount}
⚠️ Fine: ₹${receiptData.fine}
✅ Paid: ₹${receiptData.paid}
📅 Payment Date: ${receiptData.payment_date}
💳 Mode: ${receiptData.mode}
`;

    try {
      await axios.post("http://localhost:7000/api/fees/send-whatsapp", {
        phone: receiptPhoneNumber,
        message,
      },{headers: {
        Authorization: `Bearer ${token}`,
      }});

      Swal.fire({
        icon: "success",
        title: "Message Sent",
        text: "Receipt has been sent via WhatsApp.",
        timer: 3000,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("❌ WhatsApp error:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to Send",
        text: "Could not send message to WhatsApp.",
      });
    }
  };

  const amount = parseFloat(formData.amount) || 0;
  const discount = parseFloat(formData.discount) || 0;
  const fine = parseFloat(formData.fine) || 0;
  const paid = parseFloat(formData.paid) || 0;

  const totalPayable = amount - discount + fine;
  const dueAmount = totalPayable - paid;

  return (
    <>
      <form
        onSubmit={handleSubmit}
         className="rounded-xl shadow-md bg-white p-6 w-full form-control form-rounded-xl"
      >
        <h5 className="text-2xl font-bold mb-6">
          Student <span className="text-blue-700 text-3xl">Fees</span> Form
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="student_id" value="Select Student" />
            <Select
              id="student_id"
              name="student_id"
              options={students}
              value={selectedStudent}
              onChange={async (selectedOption: OptionType | null) => {
                setSelectedStudent(selectedOption);
                const studentId = selectedOption?.value || "";
                setFormData((prev) => ({
                  ...prev,
                  student_id: studentId,
                }));

                if (studentId) {
                  try {
                    const res = await axios.get(
                      `http://localhost:7000/api/students/${studentId}/courses`,{headers: {
                        Authorization: `Bearer ${token}`,
                      }}
                    );
                    const courseOpts = [{
                      value: res.data.course_name,
                      label: `${res.data.course_name} (₹${res.data.course_fees})`,
                      fees: parseFloat(res.data.course_fees),
                    }];
                    setFilteredCourses(courseOpts);
                  } catch (err) {
                    console.error("❌ Failed to fetch student courses:", err);
                    setFilteredCourses([]);
                  }
                } else {
                  setFilteredCourses([]);
                }

                setSelectedCourse(null);
                setFormData((prev) => ({
                  ...prev,
                  course_name: "",
                  amount: "",
                }));
              }}
              placeholder="Search and select student..."
              isClearable
            />
          </div>

          <div>
            <Label htmlFor="course_name" value="Select Course" />
            <Select
              id="course_name"
              name="course_name"
              options={filteredCourses}
              value={selectedCourse}
              onChange={(selectedOption: OptionType | null) => {
                setSelectedCourse(selectedOption);
                setFormData((prev) => ({
                  ...prev,
                  course_name: selectedOption?.value || "",
                  amount: selectedOption?.fees?.toString() || "",
                }));
              }}
              placeholder="Search and select course..."
              isClearable
              isDisabled={filteredCourses.length === 0}
            />
          </div>

          <div>
            <Label htmlFor="amount" value="Course Fees (₹)" />
            <TextInput
              id="amount"
              name="amount"
              type="number"
              min={0}
              value={formData.amount}
              onChange={handleChange}
              placeholder="Course fees"
              required
              disabled
            />
          </div>

           <div className="selectradius">
            <Label htmlFor="mode" value="Payment Mode" />
            <FlowbiteSelect
              id="mode"
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              required
            >
              <option value="">Select Mode</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="netbanking">Net Banking</option>
            </FlowbiteSelect>
          </div>


          {/* <div>
            <Label htmlFor="payment_date" value="Payment Date" />
            <TextInput
              id="payment_date"
              name="payment_date"
              type="date"
              min="2023-01-01"
              max={currentDate}
              value={formData.payment_date}
              onChange={handleChange}
              required
            />
          </div> */}
        <div>
  <Label htmlFor="payment_date" value="Select Payment Date" />
  <TextInput
    id="payment_date"
    name="payment_date"
    type="date"
    max={currentDate}
    value={formData.payment_date.split(" ")[0]} // Only date part
    onChange={(e) => {
      const selectedDate = e.target.value;
      const time = getCurrentTime12hr(); // Get current time
      setFormData((prev) => ({
        ...prev,
        payment_date: `${selectedDate} ${time}`, // Combine date + time
      }));
    }}
    required
  />
  <p className="text-sm text-gray-500 mt-1">
  Selected Time: {formData.payment_date.split(" ")[1] || ""}
</p>
</div>



          <div>
            <Label htmlFor="discount" value="Discount (₹)" />
            <TextInput
              id="discount"
              name="discount"
              type="number"
              min={0}
              value={formData.discount}
              onChange={handleChange}
              placeholder="Discount amount"
            />
          </div>

          <div>
            <Label htmlFor="fine" value="Fine (₹)" />
            <TextInput
              id="fine"
              name="fine"
              type="number"
              min={0}
              value={formData.fine}
              onChange={handleChange}
              placeholder="Fine amount"
            />
          </div>

          <div>
            <Label htmlFor="paid" value="Paid Amount (₹)" />
            <TextInput
              id="paid"
              name="paid"
              type="number"
              value={formData.paid}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                if (value > totalPayable) {
                  Swal.fire({
                    icon: "warning",
                    title: "Paid amount exceeds total payable!",
                    text: `Maximum you can pay is ₹${totalPayable.toFixed(2)}.`,
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 3000,
                  });
                  return;
                }
                setFormData({
                  ...formData,
                  paid: e.target.value,
                });
              }}
              required
            />
          </div>
        </div>

        <div className="mt-6 bg-gray-100 p-4 rounded-xl">
          <p className="text-lg font-medium">💰 Total Payable: ₹{totalPayable.toFixed(2)}</p>
          <p
            className={`text-lg font-medium ${
              dueAmount > 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            {dueAmount > 0 ? `Due Amount: ₹${dueAmount.toFixed(2)}` : "Paid in Full 🎉"}
          </p>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="submit" color="primary" className="w-1/5">
            Submit
          </Button>
        </div>
      </form>

      {/* Receipt Modal */}
      <Modal
  show={receiptData !== null}
  size="md"
  popup
  onClose={() => setReceiptData(null)}
>
  <Modal.Header />
  <Modal.Body>
    <div className="text-center">
      <img src={successImage} alt="Success" className="mx-auto w-14 h-14 mb-2" />
      <h3 className="text-gray-500 text-lg font-semibold mb-2"> Payment Successful!</h3>

      {/* Payment Summary Card */}
      <div>
         {/* <className="bg-green-100 text-green-800 rounded-xl p-4 my-4 shadow-md"> */}
        {/* <p className="text-sm">✅ <b>Paid Amount:</b></p> */}
        <p className="text-2xl  text-black"><strong>₹{receiptData?.paid}</strong></p>
      </div>

      {/* Dotted Divider */}
      <hr className="border-t border-dotted border-gray-400 my-4" />

      {/* Full Receipt Details */}
  {/* Full Receipt Details */}
<div className="text-sm text-gray-900 space-y-2">
  <div className="flex justify-between">
    <span className="text-gray-600"> Student:</span>
    <strong><span>{receiptStudentName}</span></strong>
  </div>
  <div className="flex justify-between">
    <span className="text-gray-600"> Course:</span>
    <strong> <span>{receiptCourseName}</span></strong>
  </div>
  <div className="flex justify-between">
    <span className="text-gray-600"> Total Fees:</span>
    <strong><span>₹{receiptData?.amount}</span></strong>
  </div>

  {/* Show discount only if > 0 */}
  {parseFloat(receiptData?.discount || "0") > 0 && (
    <div className="flex justify-between">
      <span className="text-gray-600"> Discount:</span>
      <strong><span>₹{receiptData?.discount}</span></strong>
    </div>
  )}

  {/* Show fine only if > 0 */}
  {parseFloat(receiptData?.fine || "0") > 0 && (
    <div className="flex justify-between">
      <span className="text-gray-600"> Fine:</span>
      <strong><span>₹{receiptData?.fine}</span></strong>
    </div>
  )}

  <div className="flex justify-between">
    <span className="text-gray-600"> Payment Date:</span>
    <strong> <span>{receiptData?.payment_date}</span></strong>
  </div>
  <div className="flex justify-between">
    <span className="text-gray-600"> Payment Mode:</span>
    <strong><span>{receiptData?.mode}</span></strong>
  </div>
</div>


      {/* WhatsApp Button */}
      <div className="mt-6 flex justify-center">
        <Button color="success" onClick={sendToWhatsApp}>
           Send Receipt to WhatsApp
        </Button>
      </div>
    </div>
  </Modal.Body>
</Modal>

    </>
  );
};

export default FeesForm;