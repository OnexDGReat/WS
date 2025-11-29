import React, { useEffect, useState } from "react";
import Sidebar from "../shared/sidebar";
import Table from "./table";
import "./partnerships.css";

const Partnerships = () => {
  // ---------------------------
  // MOCK DATA FOR DEMO
  // ---------------------------
  const mockPartners = [
    {
      id: 1,
      name: "InfoSoft",
      category: "CET - BSIT",
      effectivity_start: new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date("2023-06-01")),
      effectivity_end: new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date("2025-12-01")),
      status: "Active",
    },
    {
      id: 2,
      name: "Dusit",
      category: "CHATME - BSHM",
      effectivity_start: new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date("2020-01-10")),
      effectivity_end: new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date("2024-01-10")),
      status: "Expired",
    },
    {
      id: 3,
      name: "Smart",
      category: "CET - CPE",
      effectivity_start: new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date("2022-03-14")),
      effectivity_end: new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date("2026-12-14")),
      status: "Active",
    },
  ];

  // ---------------------------
  // STATE
  // ---------------------------
  const [partners, setPartners] = useState(mockPartners); // <-- use mock data for demo

  // Uncomment if you want to fetch from API later
  /*
  useEffect(() => {
    axiosInstance
      .get("/partners/")
      .then((res) => setPartners(res.data))
      .catch((err) => console.log(err));
  }, []);
  */

  const columns = [
    { header: "Company/Department 1", accessor: "name" },
    { header: "Company/Department 2", accessor: "category" },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span className={`status ${row.status.toLowerCase()}`}>
          {row.status}
        </span>
      ),
    },
    { header: "Start", accessor: "effectivity_start" },
    { header: "End", accessor: "effectivity_end" },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <div className="actions">
          <a href={`/view-partnership/${row.id}`} className="view-btn">
            View
          </a>
          <a href={`/edit-partnership/${row.id}`} className="edit-btn">
            Edit
          </a>
<a
  onClick={() => handleDelete(row.id)}
  className="delete-btn"
  href="#!"
>
  Delete
</a>

        </div>
      ),
    },
  ];

  // ---------------------------
  // DELETE HANDLER
  // ---------------------------
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this partner?")) return;
    setPartners((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="page-container">
      <Sidebar />
      <div className="content">
        <h1>Partnerships</h1>

        <div className="btn-container">
          <a href="/add-partnership" className="btn-add">
            + Add Partnership
          </a>
        </div>

        <Table data={partners} columns={columns} />
      </div>
    </div>
  );
};

export default Partnerships;
