import { useEffect, useState } from "react";
import axios from "axios";
import { FaClock } from "react-icons/fa";
import Swal from "sweetalert2";
import 'bootstrap-icons/font/bootstrap-icons.css';

const BatchForm = () => {
  const [formData, setFormData] = useState({
    batch_name: '',
    batch_type: '',
    time_from: '',
    time_to: '',
  });

  const [batches, setBatches] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  const token = localStorage.getItem("token");
  

  useEffect(() => {
    console.log(token);
    fetchBatches();

  }, []);

  const fetchBatches = async () => {
    try {
      const res = await axios.get("http://localhost:7000/api/batches/all", {headers: {
        Authorization: `Bearer ${token}`,
      }});
      setBatches(res.data);
    } catch (error) {
      console.error("❌ Error fetching batches:", error);
    }
  };

  const addOneHour = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    let newHours = hours + 1;
    if (newHours === 24) newHours = 0;
    return `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const isTimeGreater = (time1: string, time2: string) => {
    const [h1, m1] = time1.split(":").map(Number);
    const [h2, m2] = time2.split(":").map(Number);
    return h1 > h2 || (h1 === h2 && m1 > m2);
  };

  const formatTimeTo12Hour = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const updatedData = { ...prevData, [name]: value };

      if (name === "time_from") {
        updatedData.time_to = addOneHour(value);
      }

      if (name === "time_to" && !isTimeGreater(value, formData.time_from)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Time',
          text: '⏰ "Time To" must be later than "Time From"',
          timer: 2000,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
        return prevData;
      }

      return updatedData;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (isEditing && editId !== null) {
        await axios.put(`http://localhost:7000/api/batches/update/${editId}`, formData,{
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "✅ Batch updated successfully!",
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
        });
      } else {
        await axios.post("http://localhost:7000/api/batches/add", formData,{
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "✅ Batch added successfully!",
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
        });
      }

      setFormData({ batch_name: '', batch_type: '', time_from: '', time_to: '' });
      setIsEditing(false);
      setEditId(null);
      fetchBatches();
    } catch (error) {
      console.error("❌ Error submitting batch:", error);
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'Something went wrong while submitting batch.',
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  const handleCancel = () => {
    setFormData({ batch_name: '', batch_type: '', time_from: '', time_to: '' });
    setIsEditing(false);
    setEditId(null);
  };

  const handleEdit = (batch: any) => {
    setFormData({
      batch_name: batch.batch_name,
      batch_type: batch.batch_type,
      time_from: batch.time_from,
      time_to: batch.time_to,
    });
    setEditId(batch.id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="rounded-xl shadow-md bg-white p-6 w-full">
      <h2 className="text-2xl font-bold mb-6">{isEditing ? "Edit Batch" : "Batch Entry Form"}</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 font-medium">Batch Name</label>
          <input
            type="text"
            name="batch_name"
            value={formData.batch_name}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 pl-3 border border-gray-300 rounded-md"
            style={{ color: '#484343' }}
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium">Batch Type</label>
          <select
            name="batch_type"
            value={formData.batch_type}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 pl-3 border border-gray-300 rounded-md"
            style={{ color: '#484343' }}
          >
            <option value="">Select Type</option>
            <option value="Morning">Morning</option>
            <option value="Evening">Evening</option>
          </select>
        </div>

        <div className="relative">
          <label className="block text-gray-700 font-medium">Batch Time From</label>
          <FaClock className="absolute right-3 top-9 text-blue-500 pointer-events-none" />
          <input
            type="time"
            name="time_from"
            value={formData.time_from}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 pl-5 border border-gray-300 rounded-md"
            style={{ color: '#484343' }}
          />
        </div>

        <div className="relative">
          <label className="block text-gray-700 font-medium">Batch Time To</label>
          <FaClock className="absolute right-2 top-9 text-blue-500 pointer-events-none" />
          <input
            type="time"
            name="time_to"
            value={formData.time_to}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 pl-5 border border-gray-300 rounded-md"
            style={{ color: '#484343' }}
          />
        </div>

        <div className="flex justify-end gap-4 mt-6 col-span-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            {isEditing ? "Update" : "Submit"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Always visible table */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Batch List</h3>
        <table className="w-full border border-gray-300 text-left">
          <thead className="bg-gray-100">
            <tr className="border px-3 py-1" style={{ color: '#484343' }}>
              <th className="border px-3 py-2">#</th>
              <th className="border px-3 py-2">Name</th>
              <th className="border px-3 py-2">Type</th>
              <th className="border px-3 py-2">Time From</th>
              <th className="border px-3 py-2">Time To</th>
              <th className="border px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch: any, index) => (
              <tr key={batch.id} className="border px-3 py-1" style={{ color: '#484343' }}>
                <td className="border px-3 py-1">{index + 1}</td>
                <td className="border px-3 py-1">{batch.batch_name}</td>
                <td className="border px-3 py-1">{batch.batch_type}</td>
                <td className="border px-3 py-1">{formatTimeTo12Hour(batch.time_from)}</td>
                <td className="border px-3 py-1">{formatTimeTo12Hour(batch.time_to)}</td>
                <td className="border px-3 py-1 text-center">
                  <button
                    onClick={() => handleEdit(batch)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <i className="bi bi-pencil"></i>
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


export default BatchForm;





