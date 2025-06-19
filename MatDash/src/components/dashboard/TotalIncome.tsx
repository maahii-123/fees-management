import { useEffect, useState } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";

const TotalIncome = () => {
  const [totalBalance, setTotalBalance] = useState<number | null>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:7000/api/fees/summary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          console.log(res.data)
          setTotalBalance(res.data[0].balance);
        } else {
          console.warn("Summary data is empty or not in expected format");
          setTotalBalance(0); // fallback value
        }
      })
      .catch((err) => {
        console.error("Failed to fetch total balance", err);
      });
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-red-100 text-red-600 p-3 rounded-md">
          <Icon icon="solar:box-linear" height={24} />
        </div>
        <p className="text-lg font-semibold text-gray-800">Total Due Amount</p>
      </div>
      <div>
      <p className="text-2xl text-gray-900 font-bold mb-2">
  ₹{totalBalance?.toLocaleString?.() ?? "0"}
</p>
        <span className="bg-green-100 text-green-700 text-sm px-2 py-1 rounded">
          Updated
        </span>
      </div>
    </div>
  );
};

export default TotalIncome;
