import { useEffect, useState } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";

const TotalStudentsCard = () => {
  const [totalStudents, setTotalStudents] = useState<number | null>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:7000/api/students/total-students", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setTotalStudents(res.data.totalStudents);
      })
      .catch((err) => {
        console.error("Failed to fetch total students", err);
      });
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-md">
          <Icon icon="icon-park-outline:people" height={24} />
        </div>
        <p className="text-lg font-semibold text-gray-800">Total Students</p>
      </div>
      <div>
        <p className="text-2xl text-gray-900 font-bold mb-2">
          {totalStudents !== null ? totalStudents : "Loading..."}
        </p>
        <span className="bg-green-100 text-green-700 text-sm px-2 py-1 rounded">
          Updated
        </span>
      </div>
    </div>
  );
};

export default TotalStudentsCard;
