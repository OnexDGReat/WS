import React, { useState } from "react";
import Sidebar from "../shared/sidebar";
import Table from "../partnerships/table"; // Reuse the same Table component
import "./colleges.css"; // We'll create this next

const Colleges = () => {
  // ---------------------------
  // MOCK DATA FOR DEMO
  // ---------------------------
  const mockColleges = [
    {
      id: 1,
      college: "CET - BSIT",
      partners: "InfoSoft, Smart",
      status: "Active",
    },
    {
      id: 2,
      college: "CHATME - BSHM",
      partners: "Dusit",
      status: "Expired",
    },
    {
      id: 3,
      college: "CET - CPE",
      partners: "Smart, InfoSoft",
      status: "Active",
    },
    {
      id: 4,
      college: "CET - BLIS",
      partners: "InfoSoft",
      status: "Pending",
    },
  ];

  const [colleges, setColleges] = useState(mockColleges);

  const columns = [
    { header: "College", accessor: "college" },
    { header: "Partner Companies", accessor: "partners" },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span className={`status ${row.status.toLowerCase()}`}>
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <div className="actions">
          <a href={`/view-college/${row.id}`} className="view-btn">
            View
          </a>
          <a href={`/edit-college/${row.id}`} className="edit-btn">
            Edit
          </a>
          <button
            onClick={() => handleDelete(row.id)}
            className="delete-btn"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  // ---------------------------
  // DELETE HANDLER
  // ---------------------------
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this college?")) return;
    setColleges((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="page-container">
      <Sidebar />
      <div className="content">
        <h1>Colleges</h1>

        <div className="btn-container">
          <a href="/add-college" className="btn-add">
            + Add College
          </a>
        </div>

        <Table data={colleges} columns={columns} />
      </div>
    </div>
  );
};

export default Colleges;
